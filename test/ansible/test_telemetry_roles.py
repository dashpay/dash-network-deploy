"""Offline provisioning regressions; run with ansible-core 2.16 and PyYAML."""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

import yaml
from ansible.parsing.dataloader import DataLoader
from ansible.template import Templar

ROOT = Path(__file__).resolve().parents[2] / 'ansible'


class TelemetryRoles(unittest.TestCase):
    def play(self, tasks, variables, expect_success=True, check=False, backend=True, backend_address="192.0.2.50"):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            stub = base / 'roles/elastic.beats/tasks'
            stub.mkdir(parents=True)
            (stub / 'main.yml').write_text(yaml.safe_dump([
                {'name': 'Verify actual rendered collector contract',
                 'ansible.builtin.assert': {'that': [
                     'beat_conf.setup.dashboards.enabled == false',
                     'beat_conf.metricbeat.modules | length == 2',
                     'output_conf.elasticsearch.hosts == ["192.0.2.50:9200"]',
                     'output_conf.elasticsearch.username == "fixture-user"',
                     'output_conf.elasticsearch.password == "fixture-only"',
                 ]}},
                {'ansible.builtin.copy': {'dest': str(base / 'rendered.json'),
                                         'content': '{{ beat_conf | to_json }}'}},
            ]))
            inventory = base / 'inventory'
            inventory.write_text('[targets]\nlocalhost ansible_connection=local\n' +
                                 ('[logs_nodes]\nlogs-1' + (' private_ip=' + backend_address if backend_address is not None else '') + '\n'
                                  if backend else '[logs_nodes]\n'))
            playbook = base / 'play.yml'
            playbook.write_text(yaml.safe_dump([{'hosts': 'localhost', 'gather_facts': False,
                                                 'vars': variables, 'tasks': tasks}]))
            env = dict(os.environ, ANSIBLE_ROLES_PATH=str(base / 'roles') + ':' + str(ROOT / 'roles'),
                       ANSIBLE_NOCOLOR='1', ANSIBLE_LOCAL_TEMP=str(base / 'local'),
                       ANSIBLE_REMOTE_TEMP=str(base / 'remote'))
            command = ['ansible-playbook', '-i', str(inventory), str(playbook), '--limit', 'localhost']
            if check:
                command += ['--check']
            result = subprocess.run(command, text=True, capture_output=True, env=env)
            self.assertEqual(result.returncode == 0, expect_success, result.stdout + result.stderr)
            output = base / 'rendered.json'
            return result.stdout, json.loads(output.read_text()) if output.exists() else None

    def test_collection_does_not_load_dashboards_and_preserves_output(self):
        _, rendered = self.play([{'ansible.builtin.include_role': {'name': 'metricbeat'}}],
                                dict(metricbeat_enabled=True, elastic_version='8.13.2',
                                     elastic_username='fixture-user', elastic_password='fixture-only'))
        self.assertIs(rendered['setup']['dashboards']['enabled'], False)
        self.assertEqual(rendered['setup']['kibana']['host'], '192.0.2.50:5601')

    def test_missing_backend_fails_before_configuration(self):
        output, rendered = self.play(
            [{'ansible.builtin.include_role': {'name': 'metricbeat'}}],
            dict(metricbeat_enabled=True), False, backend=False)
        self.assertIn('logging backend is absent', output)
        self.assertIsNone(rendered)

    def test_explicit_dashboard_opt_in_is_required(self):
        tasks = [{'ansible.builtin.include_role': {'name': 'metricbeat', 'tasks_from': 'setup_dashboards'}}]
        output, _ = self.play(tasks, {}, False, check=True)
        self.assertIn('Verify the intended Kibana backend', output)
        output, _ = self.play(tasks, dict(metricbeat_provision_dashboards=True,
                                          metricbeat_dashboard_backend_verified=True), check=True)
        self.assertIn('failed=0', output)

    def filebeat_tasks(self):
        main = yaml.safe_load((ROOT / 'roles/core_filebeat/tasks/main.yml').read_text())
        # The real guard must be first, before container discovery, installation,
        # rendering and especially the existing unconditional service restart.
        self.assertEqual(main[0]['ansible.builtin.import_tasks'], 'validate_backend.yml')
        self.assertIn('ansible.builtin.service', main[-1])
        return [
            {'ansible.builtin.import_tasks': str(ROOT / 'roles/core_filebeat/tasks/validate_backend.yml')},
            {'ansible.builtin.include_vars': str(ROOT / 'roles/core_filebeat/vars/common.yml')},
            {'ansible.builtin.assert': {'that': [
                'filebeat_output_elasticsearch_hosts == ["192.0.2.50:9200"]',
                'filebeat_output_elasticsearch_auth.username == "fixture-user"',
                'filebeat_output_elasticsearch_auth.password == "fixture-only"',
            ]}},
            {'ansible.builtin.debug': {'msg': 'validated_output_ready_for_configuration'}},
        ]

    def test_filebeat_empty_inventory_cannot_reach_configuration_or_restart(self):
        output, _ = self.play(self.filebeat_tasks(), {}, False, backend=False)
        self.assertIn('without an intentional logs_nodes', output)
        self.assertNotIn('validated_output_ready_for_configuration', output)

    def test_filebeat_missing_or_invalid_identity_cannot_reach_configuration(self):
        for address in (None, '999.1.2.3', 'not-an-address', '0.0.0.0'):
            with self.subTest(address=address):
                output, _ = self.play(self.filebeat_tasks(), {}, False, backend_address=address)
                self.assertIn('lacks a valid inventory IPv4 identity', output)
                self.assertNotIn('validated_output_ready_for_configuration', output)

    def test_filebeat_verified_inventory_preserves_hosts_and_auth(self):
        output, _ = self.play(self.filebeat_tasks(), dict(
            elastic_version='8.13.2', elastic_username='fixture-user', elastic_password='fixture-only'))
        self.assertIn('validated_output_ready_for_configuration', output)

    def test_package_owned_rotation_and_legacy_fallback(self):
        tasks = yaml.safe_load((ROOT / 'roles/dashd/tasks/logrotate.yml').read_text())
        settings = next(t['vars'] for t in tasks if 'ansible.builtin.include_role' in t)
        for wtmp in (False, True):
            for btmp in (False, True):
                variables = {'dashd_wtmp_rotation': {'stat': {'exists': wtmp}},
                             'dashd_btmp_rotation': {'stat': {'exists': btmp}}}
                templar = Templar(loader=DataLoader(), variables=variables)
                self.assertEqual(templar.template(settings['logrotate_wtmp_enable']), not wtmp)
                self.assertEqual(templar.template(settings['logrotate_btmp_enable']), not btmp)
        # Package files must only be inspected, never rewritten or removed.
        self.assertEqual(tasks[0]['ansible.builtin.package']['state'], 'present')
        self.assertEqual(tasks[1]['ansible.builtin.stat']['path'], '/etc/logrotate.d/wtmp')
        self.assertEqual(tasks[2]['ansible.builtin.stat']['path'], '/etc/logrotate.d/btmp')
        self.assertEqual(settings['logrotate_applications'][0]['definitions'][0]['options'],
                         ['rotate 7', 'daily', 'maxsize 1G', 'missingok', 'notifempty',
                          'copytruncate', 'compress', 'delaycompress'])


if __name__ == '__main__':
    unittest.main()
