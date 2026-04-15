/* eslint-disable no-console */

const {
  pollTestnetStatus,
} = require('../lib/testnetStatus/pollTestnetStatus');

async function main() {
  const result = await pollTestnetStatus();

  console.log(`Checked ${result.expectedNodeCount} expected testnet masternodes.`);
  console.log(`Detected ${result.incidentCount} active incidents.`);

  for (const incident of result.skippedIncidents) {
    console.log(`Skipped existing issue for ${incident.nodeName} (${incident.observedState}).`);
  }

  for (const createdIssue of result.createdIssues) {
    if (createdIssue.dryRun) {
      console.log(`Would create issue for ${createdIssue.nodeName} (${createdIssue.observedState}).`);
    } else {
      console.log(
        `Created recovery issue for ${createdIssue.nodeName} `
        + `(${createdIssue.observedState}): ${createdIssue.issueUrl}`,
      );
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
