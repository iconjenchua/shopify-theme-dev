const { executeCommand } = require('./helper');

executeCommand(`gulp watch | theme watch --allenvs --dir dist --allow-live`);
