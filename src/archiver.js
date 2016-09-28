const fs = require('fs');
const archiver = require('archiver');
const utils = require('./utils');
const chalk = require('chalk');

const apkgCreater = (dbFile) => {
  const output = fs.createWriteStream(`../output/${utils.quickName(dbFile)}.apkg`);
  const archive = archiver('zip');

  output.on('close', () => {
    console.log(chalk.green(`${utils.quickName(dbFile)}.apkg has successfully been created`));
  });

  archive.on('error', (err) => {throw err});

  archive.pipe(output);

  archive
    .append(fs.createReadStream(dbFile), { name: `${utils.quickName(dbFile)}`})
    .finalize();
};

module.exports = apkgCreater;