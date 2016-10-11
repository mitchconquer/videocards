const fs = require('fs');
const archiver = require('archiver');
const chalk = require('chalk');
const Bromise = require('bluebird');

const apkgCreater = (dbFile, quickName) => {
  return new Bromise((resolve, reject) => {
    const output = fs.createWriteStream(`./${quickName}.apkg`);
    const archive = archiver('zip');

    output
      .on('close', () => {
        console.log(chalk.green(`${quickName}.apkg has successfully been created`));
      })
      .on('error', err => {
        reject(err);
      });

    archive
      .on('error', (err) => {
        reject(err);
      })
      .on('end', () => {
        resolve();
      })
      .directory('./pkg', '')
      .pipe(output);

    archive
      .finalize();
  });
};

module.exports = apkgCreater;