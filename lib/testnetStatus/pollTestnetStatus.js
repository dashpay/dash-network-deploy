const fs = require('fs').promises;
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const DEFAULT_STATUS_API_URL = 'https://status.testnet.networks.dash.org/api/nodes';
const DEFAULT_INVENTORY_PATH = path.resolve(process.cwd(), 'networks/testnet.inventory');
const DEFAULT_EXPECTED_NODE_NAMES_PATH = path.resolve(
  __dirname,
  'expectedTestnetNodes.json',
);
const DEFAULT_REPOSITORY = 'dashpay/infra';
const DEFAULT_ASSIGNEE = 'dashinfraclaw';
const ISSUE_TITLE_PREFIX = '[Testnet Recovery]';

const execFileAsync = promisify(execFile);

function parseExpectedNodeNames(inventoryContents) {
  const expectedNodeNames = [];
  const trackedGroups = new Set(['masternodes', 'hp_masternodes']);
  let currentGroup = null;

  for (const rawLine of inventoryContents.split('\n')) {
    const line = rawLine.trim();

    if (line && !line.startsWith('#') && line.startsWith('[') && line.endsWith(']')) {
      const groupName = line.slice(1, -1);
      currentGroup = trackedGroups.has(groupName) ? groupName : null;
    } else if (line && !line.startsWith('#') && currentGroup) {
      expectedNodeNames.push(line.split(/\s+/)[0]);
    }
  }

  return expectedNodeNames;
}

function buildObservedState(statusNode) {
  if (!statusNode) {
    return 'missing from status API';
  }

  const observedStates = [];
  const masternodeState = statusNode.status?.masternodeState;
  const { health } = statusNode;
  const coreServiceStatus = statusNode.status?.coreServiceStatus;
  const platformStatus = statusNode.status?.platformStatus;

  if (masternodeState === 'POSE_BANNED') {
    observedStates.push(`masternodeState=${masternodeState}`);
  }

  if (health && health !== 'healthy') {
    observedStates.push(`health=${health}`);
  }

  if (coreServiceStatus && coreServiceStatus !== 'up') {
    observedStates.push(`coreServiceStatus=${coreServiceStatus}`);
  }

  if (platformStatus && platformStatus !== 'up') {
    observedStates.push(`platformStatus=${platformStatus}`);
  }

  return observedStates.join(', ');
}

function findRecoveryIncidents(expectedNodeNames, statusNodes) {
  const statusByName = new Map(statusNodes.map((statusNode) => [statusNode.name, statusNode]));

  return expectedNodeNames.reduce((incidents, nodeName) => {
    const statusNode = statusByName.get(nodeName);
    const observedState = buildObservedState(statusNode);

    if (!observedState) {
      return incidents;
    }

    incidents.push({
      nodeName,
      observedState,
    });

    return incidents;
  }, []);
}

function buildIssueTitle(nodeName) {
  return `${ISSUE_TITLE_PREFIX} ${nodeName}`;
}

function buildIssueBody(nodeName, observedState) {
  return `${nodeName} requires automated recovery investigation.

Observed state from the testnet status page: ${observedState}.

Use the automated-recovery skill for investigation and any safe first-response actions.

If the incident is outside that skill's safe scope, stop and leave a comment describing what you checked and why it was escalated.

If recovery succeeds, leave a comment with what you did and then close the issue.

<!-- testnet-recovery-node:${nodeName} -->`;
}

function filterIncidentsWithoutOpenIssues(incidents, openIssues) {
  const openIssueTitles = new Set(openIssues.map((issue) => issue.title));

  return incidents.filter((incident) => !openIssueTitles.has(buildIssueTitle(incident.nodeName)));
}

async function readExpectedNodeNames(
  inventoryPath = DEFAULT_INVENTORY_PATH,
  expectedNodeNamesPath = DEFAULT_EXPECTED_NODE_NAMES_PATH,
) {
  try {
    const inventoryContents = await fs.readFile(inventoryPath, 'utf8');
    return parseExpectedNodeNames(inventoryContents);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    const expectedNodeNamesContents = await fs.readFile(expectedNodeNamesPath, 'utf8');
    const expectedNodeNames = JSON.parse(expectedNodeNamesContents);

    if (!Array.isArray(expectedNodeNames)) {
      throw new Error('Expected node names fallback must be a JSON array');
    }

    return expectedNodeNames;
  }
}

async function fetchStatusNodes(statusApiUrl = DEFAULT_STATUS_API_URL, fetchImpl = fetch) {
  const response = await fetchImpl(statusApiUrl);

  if (!response.ok) {
    throw new Error(`Status API request failed with ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error('Status API response must be an array');
  }

  return payload;
}

async function listOpenRecoveryIssues(
  repository = DEFAULT_REPOSITORY,
  execFileImpl = execFileAsync,
) {
  const { stdout } = await execFileImpl('gh', [
    'issue',
    'list',
    '--repo',
    repository,
    '--state',
    'open',
    '--limit',
    '500',
    '--json',
    'number,title',
  ]);

  return JSON.parse(stdout);
}

async function createRecoveryIssue(
  incident,
  repository = DEFAULT_REPOSITORY,
  assignee = DEFAULT_ASSIGNEE,
  execFileImpl = execFileAsync,
) {
  const issueTitle = buildIssueTitle(incident.nodeName);
  const issueBody = buildIssueBody(incident.nodeName, incident.observedState);

  const { stdout } = await execFileImpl('gh', [
    'issue',
    'create',
    '--repo',
    repository,
    '--title',
    issueTitle,
    '--body',
    issueBody,
    '--assignee',
    assignee,
  ]);

  return stdout.trim();
}

async function pollTestnetStatus({
  statusApiUrl = DEFAULT_STATUS_API_URL,
  inventoryPath = DEFAULT_INVENTORY_PATH,
  repository = process.env.TESTNET_RECOVERY_ISSUE_REPOSITORY || DEFAULT_REPOSITORY,
  assignee = process.env.TESTNET_RECOVERY_ASSIGNEE || DEFAULT_ASSIGNEE,
  dryRun = process.env.DRY_RUN === '1',
  fetchImpl = fetch,
  execFileImpl = execFileAsync,
} = {}) {
  const [expectedNodeNames, statusNodes] = await Promise.all([
    readExpectedNodeNames(inventoryPath),
    fetchStatusNodes(statusApiUrl, fetchImpl),
  ]);

  const incidents = findRecoveryIncidents(expectedNodeNames, statusNodes);

  if (incidents.length === 0) {
    return {
      expectedNodeCount: expectedNodeNames.length,
      incidentCount: 0,
      createdIssues: [],
      skippedIncidents: [],
    };
  }

  const openIssues = await listOpenRecoveryIssues(repository, execFileImpl);
  const incidentsToCreate = filterIncidentsWithoutOpenIssues(incidents, openIssues);
  const skippedIncidents = incidents.filter((incident) => !incidentsToCreate.includes(incident));

  if (dryRun) {
    return {
      expectedNodeCount: expectedNodeNames.length,
      incidentCount: incidents.length,
      createdIssues: incidentsToCreate.map((incident) => ({
        nodeName: incident.nodeName,
        observedState: incident.observedState,
        dryRun: true,
      })),
      skippedIncidents,
    };
  }

  const createdIssues = [];

  for (const incident of incidentsToCreate) {
    const issueUrl = await createRecoveryIssue(
      incident,
      repository,
      assignee,
      execFileImpl,
    );

    createdIssues.push({
      nodeName: incident.nodeName,
      observedState: incident.observedState,
      issueUrl,
    });
  }

  return {
    expectedNodeCount: expectedNodeNames.length,
    incidentCount: incidents.length,
    createdIssues,
    skippedIncidents,
  };
}

module.exports = {
  ISSUE_TITLE_PREFIX,
  buildIssueBody,
  buildIssueTitle,
  buildObservedState,
  createRecoveryIssue,
  DEFAULT_ASSIGNEE,
  DEFAULT_INVENTORY_PATH,
  DEFAULT_EXPECTED_NODE_NAMES_PATH,
  DEFAULT_REPOSITORY,
  DEFAULT_STATUS_API_URL,
  fetchStatusNodes,
  filterIncidentsWithoutOpenIssues,
  findRecoveryIncidents,
  listOpenRecoveryIssues,
  parseExpectedNodeNames,
  pollTestnetStatus,
  readExpectedNodeNames,
};
