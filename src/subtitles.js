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
        duration: utils.durationInSeconds(subItem.startTime, subItem.endTime),
        startTime: subItem.startTime.replace(',', '.'),
        endTime: subItem.endTime.replace(',', '.'),
        text: subItem.text.replace('\n', ' ')
      };
    }));
  });
};

subtitles.listEmbeded = (inputVideo) => {
  // List all available subtitles
  return new Bromise((resolve, reject) => {
    ffmpeg(inputVideo)
      .ffprobe((err, data) => {
        if (err) {
          reject(err);
        }

        const subStreams = data.streams
          .filter(stream => stream.codec_type === 'subtitle')
          .map(stream => ({
            language: stream.tags.language,
            index: stream.index
          }));

          resolve(subStreams);
      });
  });
};

subtitles.extract = (streamIndex, inputVideo) => {

  utils.ensureDir('./output');
  return new Bromise((resolve, reject) => {
    ffmpeg(inputVideo)
    .output(`output/${utils.quickName(inputVideo)}.srt`)
    .noVideo()
    .noAudio()
    .outputOptions(`-c:s:${streamIndex} srt`)
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

module.exports = subtitles;