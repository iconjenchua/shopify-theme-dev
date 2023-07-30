const { executeCommand, envVariables } = require('./helper');

executeCommand(`gulp watch | theme watch --env ${envVariables.STORE} --dir dist`);
