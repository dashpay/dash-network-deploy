const firstRunConfig = require('../lib/configGenerator/firstRunConfig');

async function main() {
    const [
        network,
        networkName,
    ] = process.argv.slice(2);

    await firstRunConfig(
        network,
        networkName,
    );
};

main().catch(console.error);
