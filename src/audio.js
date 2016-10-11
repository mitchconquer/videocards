const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const utils = require('./utils');
const Bromise = require('bluebird');

const generateAudio = (inputVideo, subsData) => {
  return new Bromise((resolve, reject) => {
    console.log('Slicing video file... )xxxxx[;;;;;;;;;>');
    const noteData = [];

    subsData.forEach((subItem, index) => {
      noteData.push(
        _mp3Promise(inputVideo, subItem, index)
      );
    });

    Bromise.all(noteData)
      .then(
        noteData => resolve(noteData)
      )
      .catch(reject);
  });
};

const _mp3Promise = (inputVideo, subItem, index) => {
  return new Bromise((resolve, reject) => {
    const fileName = `${utils.quickName(inputVideo).slice(0, 20)}_${utils.padZeros(subItem.id)}.mp3`;

    ffmpeg(inputVideo)
      .seekInput(subItem.startTime)
      .inputOptions('-vn')
      .output(`pkg/${index}`)
      .format('mp3')
      .outputOptions('-write_xing', 0) // Fixes Mac MP3 length error
      .duration(subItem.duration)

      .on('error', (err) => {
        console.log(chalk.red('An error occurred: ' + err.message));
        reject(err);
      })
      .on('end', () => {
        resolve({text: subItem.text, media: fileName, index});
      })
      .run();
  });
};

module.exports = generateAudio;