const { executeCommand, executeCommandWithPromise, envVariables } = require('./helper');

const optionDefinitions = [
  { name: 'all', alias: 'a', type: String }
];

const commandLineArgs = require('command-line-args');
const options = commandLineArgs(optionDefinitions);

executeCommandWithPromise(`rimraf download && mkdirp download`)
  .then(
    // Copy first the latest build files in /dist to /download
    executeCommandWithPromise(`gulp copy:prereconcile`)
  ).then(
    // Download all files and directories in shopify inside download directory
    executeCommand(`theme download --env ${envVariables.STORE} --dir download ${ ! options.all ? '--ignores .theme_ignores' : '' }`)
  );