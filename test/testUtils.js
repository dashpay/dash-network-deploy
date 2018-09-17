const SSH = require('simple-ssh');
const fs = require('fs');
const Promise = require('bluebird');

exports.echo = function (ssh, command, callback) {
  let data = '';
  let error = null;

  ssh.exec(command, {
    out(stdout) {
      data += stdout;
    },
    exit(code) {
      if (code !== 0) {
        return callback(new Error(`exit code: ${code}`));
      }
      // here's all the data you have persisted from stdout
      return callback(error, data);
    },
    error(err) {
      error = err;
    },
  })
    .start();
};


exports.echoP = function (ssh, command) {
  return new Promise(((resolve, reject) => {
    let data = '';
    let error = null;

    ssh.exec(command, {
      out(stdout) {
        data += stdout;
      },
      exit(code) {
        if (code !== 0) {
          reject(new Error(`exit code: ${code}`));
          // return callback(new Error(`exit code: ${code}`));
        }
        // here's all the data you have persisted from stdout
        resolve(data);
      },
      error(err) {
        error = err;
        reject(new Error(`exit code: ${code}`));
      },
    })
      .start();
  }));
};
