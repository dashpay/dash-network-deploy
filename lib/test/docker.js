const Docker = require('dockerode');

const dockerTimeout = 60 * 1000;

const getDocker = (hostName) => (new Docker({
  host: hostName,
  port: 2375,
  timeout: dockerTimeout,
}));

const execCommand = async (docker, containerId, cmd) => {
  const container = docker.getContainer(containerId);

  const options = {
    Cmd: cmd,
    AttachStdout: true,
    AttachStderr: true,
  };

  const containerExec = await container.exec(options);
  const commandStream = await containerExec.start();

  return new Promise((resolve, reject) => {
    let buffer = Buffer.from('');
    const chunks = [];

    commandStream.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });

    commandStream.on('close', () => {
      let streamType;

      while (buffer.length > 0) {
        const header = buffer.subarray(0, 8);

        const streamTypeBuf = header.subarray(0, 1);
        const frameSizeBuf = header.subarray(4, 8);

        streamType = streamTypeBuf.readUint8(0);
        const frameSize = frameSizeBuf.readUint32BE(0);

        const frame = buffer.subarray(8, header.length + frameSize);

        chunks.push(frame.toString());

        buffer = buffer.subarray(8 + frameSize);
      }

      const data = chunks.reduce((acc, val) => acc + val, '');

      try {
        if (streamType === 2) {
          reject(new Error(data));
        }

        const json = JSON.parse(data);

        resolve(json);
      } catch (error) {
        reject(new Error(`Could not parse docker modem json: ${error}`));
      }
    });
  });
};

const getContainerId = async (docker, nameFilter) => {
  const options = {
    filters: JSON.stringify({
      name: [nameFilter],
    }),
  };

  const [coreContainerInfo] = await docker.listContainers(options);

  if (!coreContainerInfo) {
    console.log(coreContainerInfo)
    throw new Error(`No container found with name filter ${nameFilter}`);
  }

  return coreContainerInfo.Id;
};

module.exports = {
  getDocker,
  execCommand,
  getContainerId,
};
