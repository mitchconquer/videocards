const fs = require('fs');
const chalk = require('chalk');
const crypto = require('crypto');

const utils = {
  combineSubtitles: function(subtitle1, subtitle2, options = {replaceMedia: false}) {
    const { replaceMedia } = options;
    let target, source;
    if (subtitle1.index < subtitle2.index) {
      target = subtitle1;
      source = subtitle2;
    } else {
      target = subtitle2;
      source = subtitle1;
    }

    const merged = Object.assign({}, target);
    merged.text = `${target.text} ${source.text}`;
    merged.endTime = source.endTime;
    merged.duration = utils.durationInSeconds(target.startTime, source.endTime);

    if (!replaceMedia) {
      merged.media = this.updateFileVersionHash(merged.media);
    }

    return merged;
  },

  durationInSeconds: function(startTime, endTime) {
    const end = utils.timeInMSeconds(endTime);
    const start = utils.timeInMSeconds(startTime);
    return (end - start) / 1000;
  },

  ensureDir: function(givenDir) {
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

  getGuid: function() {
    return 'xxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const r = Math.random()*16|0;
      const v = char === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },

  padZeros: function(id) {
    const numDigits = 5;
    const padding = (numDigits - `${id}`.length);
    let padded = `${id}`;
    for (let i = 0; i < padding; i++) {
      padded = `0${padded}`;
    }
    return padded;
  },

  quickName: function(videoPath) {
    const regex = /(.*\/)*(.*)\.(.{0,4})/;
    const matches = videoPath.match(regex);
    return matches[2];
  },

  updateFileVersionHash: function(file) {
    // Check if there is already a version hash
    let fileName = this.quickName(file);
    const hashRegex = /(\.[a-z0-9]*)/;
    const matches = fileName.match(hashRegex)
    if (matches && matches.length > 0) {
      // Remove hash if already exists
      fileName = fileName.slice(0, (-1 * matches[0].length));
    }
    // Add randomHash
    const randomHash = crypto.randomBytes(4).toString('hex');
    return `${fileName}.${randomHash}.mp3`;
  },

  rmFiles: function(dir) {
    if (!_dirExists(dir)) {
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
  },

  rmFile: function(file) {
    const filePath = `./pkg/${file}`;
    if (!_fileExists(filePath)) {
      return;
    }
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  },

  timeInMSeconds: function(timeString) {
    const timeArray = timeString.split(':');
    const hours = parseInt(timeArray[0]);
    const minutes = parseInt(timeArray[1]);
    const separator = (timeArray[2].indexOf(',') > -1) ? ',' : '.';
    const seconds = parseInt(timeArray[2].split(separator)[0]);
    const mSeconds = parseInt(timeArray[2].split(separator)[1]);

    return mSeconds + (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000);
  }
};

module.exports = utils;


const _dirExists = (dir) => {
  let dirExists;
  try {
    dirExists = fs.statSync(dir).isDirectory();
  }
  catch(err) {
    return false;
  }
  return !!dirExists;
};

const _fileExists = (file) => {
  let fileExists;
  try {
    fileExists = fs.statSync(file).isFile();
  }
  catch(err) {
    return false;
  }
  return !!fileExists;
};
