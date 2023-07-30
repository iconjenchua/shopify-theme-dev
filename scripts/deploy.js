const { executeCommand, envVariables } = require('./helper');

executeCommand(`theme deploy --env ${envVariables.STORE} --dir dist`);
