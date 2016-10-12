const fs = require('fs');
const chalk = require('chalk');

const utils = {
  dirExists: (dir) => {
    let dirExists;
    try {
      dirExists = fs.statSync(dir).isDirectory();
    }
    catch(err) {
      return false;
    }
    return !!dirExists;
  },
  ensureDir: (givenDir) => {
    let dir;
    try {
      dir = fs.statSync(givenDir);
    }
    catch(err) {
      console.log(chalk.dim(`Creating ${givenDir} directory...`));
    }
    if (dir && dir.isDirectory()) {
      return true;
    }
    fs.mkdirSync(`${givenDir}`);

    return fs.statSync(givenDir);
  },
  getGuid: () => {
    return 'xxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const r = Math.random()*16|0;
      const v = char === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },
  padZeros: (id) => {
    const numDigits = 5;
    const padding = (numDigits - `${id}`.length);
    let padded = `${id}`;
    for (let i = 0; i < padding; i++) {
      padded = `0${padded}`;
    }
    return padded;
  },
  quickName: (videoPath) => {
    const regex = /(.*\/)*(.*)\.(.{0,4})/;
    const matches = videoPath.match(regex);
    return matches[2];
  },
  rmFiles: (dir) => {
    if (!utils.dirExists(dir)) {
      return false;
    }
    
    const files = fs.readdirSync(dir);
    console.log(chalk.dim(`Cleaning ${dir} directory...`));

    if (files.length > 0) {
      files.forEach(file => {
        const filePath = `${dir}/${file}`;
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
        else if (fs.statSync(filePath).isDirectory()) {
          this.rmFiles(filePath);
        }
      });
    }
  }
};

module.exports = utils;