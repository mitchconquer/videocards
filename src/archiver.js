const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const chalk = require('chalk');
const Bromise = require('bluebird');

const apkgCreater = (dbFile, quickName, directory) => {
  return new Bromise((resolve, reject) => {
    const outputDir = path.join(`${( directory || '.' )}`, `${quickName}.apkg`);
    const output = fs.createWriteStream(outputDir);
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
      .directory(path.join('pkg'), '')
      .pipe(output);

    archive
      .finalize();
  });
};

module.exports = apkgCreater;