const fs = require('fs');
const subsParser = require('subtitles-parser');
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const utils = require('./utils');
const Bromise = require('bluebird');
const startBuffer = 200;
const endBuffer = 200;

const subtitles = {};

subtitles.subsTransform = (inputSubs) => {
  return new Bromise((resolve, reject) => {
    const subFile = fs.readFileSync(inputSubs,'utf8');
    const subsData = subsParser.fromSrt(subFile);

    resolve(subsData.map(subItem => {
      return {
        id: parseInt(subItem.id),
        duration: _getDurationInSeconds(subItem.startTime, subItem.endTime),
        startTime: subItem.startTime.replace(',', '.'),
        endTime: subItem.endTime.replace(',', '.'),
        text: subItem.text.replace('\n', ' ')
      };
    }));
  });
};

subtitles.extract = (inputVideo, callback) => {
  return new Bromise((resolve, reject) => {
    ffmpeg(inputVideo)
    .output(`output/${utils.quickName(inputVideo)}.srt`)
    .noVideo()
    .noAudio()
    .outputOptions('-c:s:0 srt')
    .on('start', () => console.log('Extracting subtitles...'))
    .on('error', (err) => {
      console.log(chalk.red(`An error occured while generating subtitles. ${err.message}`));
      reject(err);
    })
    .on('end', () => {
      console.log(chalk.green('Successfully extracted subtitles'));
      inputSubs = `output/${utils.quickName(inputVideo)}.srt`;
      resolve(inputSubs);
    })
    .run()
  });
};

const _getDurationInSeconds = (startTime, endTime) => {
  return (_timeInMSeconds(endTime) - _timeInMSeconds(startTime) + endBuffer) / 1000
};

const _timeInMSeconds = (timeString) => {
  const timeArray = timeString.split(':');
  const hours = parseInt(timeArray[0]);
  const minutes = parseInt(timeArray[1]);
  const seconds = parseInt(timeArray[2].split(',')[0]);
  const mSeconds = parseInt(timeArray[2].split(',')[1]);

  return mSeconds + (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000);
};

module.exports = subtitles;