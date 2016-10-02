const fs = require('fs');
const archiver = require('archiver');
const chalk = require('chalk');

const apkgCreater = (dbFile, quickName) => {
  const output = fs.createWriteStream(`./${quickName}.apkg`);
  const archive = archiver('zip');

  // Create empty media file
  fs.writeFileSync('./pkg/media', '{}');

  output
    .on('close', () => {
      console.log(chalk.green(`${quickName}.apkg has successfully been created`));
    })
    .on('error', err => {
      throw err
    });

  archive
    .on('error', (err) => {
      throw err
    });

  archive.pipe(output);

  archive
    .directory('./pkg', '')
    .finalize();
};

module.exports = apkgCreater;