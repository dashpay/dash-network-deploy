const { expect } = require('chai');

const {
  buildIssueBody,
  buildIssueTitle,
  buildObservedState,
  filterIncidentsWithoutOpenIssues,
  findRecoveryIncidents,
  parseExpectedNodeNames,
} = require('../lib/testnetStatus/pollTestnetStatus');

describe('pollTestnetStatus', () => {
  describe('parseExpectedNodeNames', () => {
    it('should only return testnet masternode groups from the inventory', () => {
      const inventoryContents = `
web-1 ansible_host=1.2.3.4

[web]
web-1

[masternodes]
masternode-1
masternode-2

[hp_masternodes]
hp-masternode-1

[seed_nodes]
seed-1
`;

      expect(parseExpectedNodeNames(inventoryContents)).to.deep.equal([
        'masternode-1',
        'masternode-2',
        'hp-masternode-1',
      ]);
    });
  });

  describe('buildObservedState', () => {
    it('should report a missing node as absent from the status API', () => {
      expect(buildObservedState()).to.equal('missing from status API');
    });

    it('should combine failing status fields into a single observed state', () => {
      const observedState = buildObservedState({
        health: 'unreachable',
        status: {
          masternodeState: 'POSE_BANNED',
          coreServiceStatus: 'down',
          platformStatus: 'degraded',
        },
      });

      expect(observedState).to.equal(
        'masternodeState=POSE_BANNED, health=unreachable, coreServiceStatus=down, platformStatus=degraded',
      );
    });

    it('should ignore healthy ready nodes', () => {
      const observedState = buildObservedState({
        health: 'healthy',
        status: {
          masternodeState: 'READY',
          coreServiceStatus: 'up',
          platformStatus: 'up',
        },
      });

      expect(observedState).to.equal('');
    });
  });

  describe('findRecoveryIncidents', () => {
    it('should flag banned, down, and missing expected nodes', () => {
      const incidents = findRecoveryIncidents(
        ['masternode-1', 'masternode-2', 'hp-masternode-1', 'hp-masternode-2'],
        [
          {
            name: 'masternode-1',
            health: 'healthy',
            status: {
              masternodeState: 'READY',
              coreServiceStatus: 'up',
            },
          },
          {
            name: 'masternode-2',
            health: 'healthy',
            status: {
              masternodeState: 'POSE_BANNED',
              coreServiceStatus: 'up',
            },
          },
          {
            name: 'hp-masternode-1',
            health: 'unreachable',
            status: {
              masternodeState: 'READY',
              coreServiceStatus: 'up',
              platformStatus: 'up',
            },
          },
        ],
      );

      expect(incidents).to.deep.equal([
        {
          nodeName: 'masternode-2',
          observedState: 'masternodeState=POSE_BANNED',
        },
        {
          nodeName: 'hp-masternode-1',
          observedState: 'health=unreachable',
        },
        {
          nodeName: 'hp-masternode-2',
          observedState: 'missing from status API',
        },
      ]);
    });
  });

  describe('issue helpers', () => {
    it('should use a deterministic issue title and public body', () => {
      expect(buildIssueTitle('hp-masternode-7')).to.equal('[Testnet Recovery] hp-masternode-7');
      expect(buildIssueBody('hp-masternode-7', 'health=unreachable')).to.equal(
        `hp-masternode-7 requires automated recovery investigation.

Observed state from the testnet status page: health=unreachable.

Use the automated-recovery skill for investigation and any safe first-response actions.

If the incident is outside that skill's safe scope, stop and leave a comment describing what you checked and why it was escalated.

If recovery succeeds, leave a comment with what you did and then close the issue.

<!-- testnet-recovery-node:hp-masternode-7 -->`,
      );
    });

    it('should only create issues for incidents without an open matching issue', () => {
      const incidents = [
        { nodeName: 'masternode-1', observedState: 'health=unreachable' },
        { nodeName: 'hp-masternode-1', observedState: 'masternodeState=POSE_BANNED' },
      ];

      const openIssues = [
        { number: 28, title: '[Testnet Recovery] hp-masternode-1' },
      ];

      expect(filterIncidentsWithoutOpenIssues(incidents, openIssues)).to.deep.equal([
        { nodeName: 'masternode-1', observedState: 'health=unreachable' },
      ]);
    });
  });
});
