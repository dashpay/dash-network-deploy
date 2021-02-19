data "template_file" "service_ssh" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "SSH"
    port = var.ssh_port
  }
}

data "template_file" "service_core_p2p" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "Core P2P"
    port = var.dashd_port
  }
}

data "template_file" "service_core_rpc" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "Core RPC"
    port = var.dashd_rpc_port
  }
}

data "template_file" "service_core_zmq" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "Core ZMQ"
    port = var.dashd_zmq_port
  }
}

data "template_file" "service_tendermint_p2p" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "Tendermint P2P"
    port = var.tendermint_p2p_port
  }
}

data "template_file" "service_tendermint_rpc" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "Tendermint RPC"
    port = var.tendermint_rpc_port
  }
}

data "template_file" "service_dapi" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "DAPI"
    port = var.dapi_port
  }
}

data "template_file" "service_dapi_grpc" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "DAPI GRPC"
    port = var.dapi_grpc_port
  }
}

data "template_file" "service_drive" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "Drive"
    port = var.drive_port
  }
}

data "template_file" "service_insight" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "Insight API"
    port = var.insight_port
  }
}

data "template_file" "service_kibana" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "Kibana"
    port = var.kibana_port
  }
}

data "template_file" "service_docker" {
  template = file("${path.module}/templates/services/service.tpl")

  vars = {
    name = "Docker API"
    port = var.docker_port
  }
}

data "template_file" "masternodes" {
  count    = length(aws_instance.masternode)
  template = file("${path.module}/templates/services/node.tpl")

  vars = {
    name = "masternode-${count.index + 1}"
    external_services = replace(
      chomp(
        join(
          "",
          [
            data.template_file.service_ssh.rendered,
            data.template_file.service_core_p2p.rendered,
            data.template_file.service_dapi.rendered,
            data.template_file.service_dapi_grpc.rendered,
            data.template_file.service_tendermint_p2p.rendered,
          ],
        ),
      ),
      "{{ip}}",
      element(aws_instance.masternode.*.public_ip, count.index),
    )
    internal_services = replace(
      chomp(
        join(
          "",
          [
            data.template_file.service_tendermint_rpc.rendered,
            data.template_file.service_core_rpc.rendered,
            data.template_file.service_core_zmq.rendered,
            data.template_file.service_drive.rendered,
            data.template_file.service_insight.rendered,
            data.template_file.service_docker.rendered,
          ],
        ),
      ),
      "{{ip}}",
      element(aws_instance.masternode.*.public_ip, count.index),
    )
    service_logs = chomp(
      join(
        "\n",
        [
          "   - dashd",
          "   - dapi_api",
          "   - dapi_tx_filter_stream",
          "   - dapi_nginx",
          "   - dapi_envoy",
          "   - drive_abci",
          "   - drive_mongodb",
          "   - tendermint",
          "   - sentinel",
          "   - insight",
        ],
      ),
    )
  }
}

data "template_file" "wallets" {
  count    = length(aws_instance.dashd_wallet)
  template = file("${path.module}/templates/services/node.tpl")

  vars = {
    name = "dashd-wallet-${count.index + 1}"
    external_services = replace(
      chomp(join("", [data.template_file.service_ssh.rendered])),
      "{{ip}}",
      element(aws_instance.dashd_wallet.*.public_ip, count.index),
    )
    internal_services = replace(
      chomp(
        join(
          "",
          [
            data.template_file.service_core_p2p.rendered,
            data.template_file.service_core_rpc.rendered,
            data.template_file.service_core_zmq.rendered,
            data.template_file.service_docker.rendered,
          ],
        ),
      ),
      "{{ip}}",
      element(aws_instance.dashd_wallet.*.public_ip, count.index),
    )
    service_logs = chomp(join("\n", ["   - dashd"]))
  }
}

data "template_file" "seeds" {
  count    = length(aws_instance.seed_node)
  template = file("${path.module}/templates/services/node.tpl")

  vars = {
    name = "seed-${count.index + 1}"
    external_services = replace(
      chomp(
        join(
          "",
          [
            data.template_file.service_ssh.rendered,
            data.template_file.service_core_p2p.rendered,
            data.template_file.service_dapi.rendered,
            data.template_file.service_dapi_grpc.rendered,
            data.template_file.service_tendermint_p2p.rendered,
          ],
        ),
      ),
      "{{ip}}",
      element(aws_instance.seed_node.*.public_ip, count.index),
    )
    internal_services = replace(
      chomp(
        join(
          "",
          [
            data.template_file.service_tendermint_rpc.rendered,
            data.template_file.service_core_rpc.rendered,
            data.template_file.service_core_zmq.rendered,
            data.template_file.service_drive.rendered,
            data.template_file.service_insight.rendered,
            data.template_file.service_docker.rendered,
          ],
        ),
      ),
      "{{ip}}",
      element(aws_instance.seed_node.*.public_ip, count.index),
    )
    service_logs = chomp(join("\n", [
      "   - dashd",
      "   - dapi_api",
      "   - dapi_tx_filter_stream",
      "   - dapi_nginx",
      "   - dapi_envoy",
      "   - drive_abci",
      "   - drive_mongodb",
      "   - tendermint",
      "   - sentinel",
      "   - insight",
    ]))
  }
}

data "template_file" "miners" {
  count    = length(aws_instance.miner)
  template = file("${path.module}/templates/services/node.tpl")

  vars = {
    name = "miner-${count.index + 1}"
    external_services = replace(
      chomp(join("", [data.template_file.service_ssh.rendered])),
      "{{ip}}",
      element(aws_instance.miner.*.public_ip, count.index),
    )
    internal_services = replace(
      chomp(
        join(
          "",
          [
            data.template_file.service_core_p2p.rendered,
            data.template_file.service_core_rpc.rendered,
            data.template_file.service_docker.rendered,
          ],
        ),
      ),
      "{{ip}}",
      element(aws_instance.miner.*.public_ip, count.index),
    )
    service_logs = chomp(join("\n", ["   - dashd"]))
  }
}

data "template_file" "services" {
  template = file("${path.module}/templates/services/services.tpl")

  vars = {
    masternodes     = chomp(join("\n", data.template_file.masternodes.*.rendered))
    wallets         = chomp(join("\n", data.template_file.wallets.*.rendered))
    seeds           = chomp(join("\n", data.template_file.seeds.*.rendered))
    miners          = chomp(join("\n", data.template_file.miners.*.rendered))
    elb_host        = chomp(join("\n", aws_elb.web.*.dns_name))
    insight_port    = var.insight_port
    kibana_port     = var.kibana_port
    vpn_host        = chomp(join("\n", aws_eip.vpn.*.public_ip))
    vpn_port        = var.vpn_port
  }
}

output "services" {
  value = data.template_file.services.rendered
}

