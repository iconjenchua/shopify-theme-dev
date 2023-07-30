'use strict';
require('dotenv').config();

exports.executeCommand = (cmd) => {
  const exec = require('child_process').exec,
      watching = exec(cmd);

  watching.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
  });

  watching.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  watching.on('exit', function (code) {
    console.log('code ' + code.toString());
  });
}

exports.executeCommandWithPromise = (cmd) => {
  const exec = require('child_process').exec;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.warn(err);
      }
      resolve(stdout? stdout : stderr);
    });
  });
}

exports.envVariables = process.env