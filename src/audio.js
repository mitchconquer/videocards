const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const utils = require('./utils');
const Bromise = require('bluebird');

const generateAudio = (inputVideo, subsData) => {
  utils.ensureDir('./pkg');
  
  return new Bromise((resolve, reject) => {
    console.log('Slicing video file... )xxxxx[;;;;;;;;;>');

    _batchProcess(inputVideo, subsData, resolve);

  });
};

const _batchProcess = (inputVideo, subsData, batchCompleteCallback) => {
  let index = 0;
  const batchQty = 300;
  const noteData = [];

  function _process() {
    for (let j = 0; j < batchQty; j++) {
      const idx = index++;
      if (idx < subsData.length) {
        console.log(idx);
        noteData.push(
          _mp3Promise(inputVideo, subsData[idx], idx)
        );
      }
    }

    if (index < subsData.length) {
      console.log('_process if statement');
      _waitBatch(noteData, _process);
    }
    else {
      _waitBatch(noteData, batchCompleteCallback);
    }
  }

  _process();
};

const _waitBatch = (noteData, callback) => {
  console.log('_waitBatch');
  Bromise.all(noteData)
  .then(
    () => callback(noteData)
  );
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