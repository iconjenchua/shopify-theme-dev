const { executeCommand, executeCommandWithPromise, envVariables } = require('./helper');

executeCommandWithPromise(`rimraf download && mkdirp download`)
  .then(
    // Copy first the latest build files in /dist to /download
    executeCommandWithPromise(`gulp copy:prereconcile`)
  ).then(
    // Download all files and directories in shopify inside download directory
    executeCommand(`theme download config locales templates/*.json --env ${envVariables.STORE} --dir download`)
  );


