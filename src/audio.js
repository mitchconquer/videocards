const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const utils = require('./utils');
const Bromise = require('bluebird');
const path = require('path');

const generateAudio = (inputVideo, subsData) => {
  utils.ensureDir('./pkg');
  
  return new Bromise((resolve, reject) => {
    console.log('Slicing video file... )xxxxx[;;;;;;;;;>');
    _batchProcess(inputVideo, subsData, resolve);
  });
};

const _batchProcess = (inputVideo, subsData, allCompleteCallback) => {
  let index = 0;
  const batchQty = 300;

  function _process(noteData = []) {
    for (let j = 0; j < batchQty; j++) {
      const idx = index++;
      if (idx < subsData.length) {
        noteData.push(
          _mp3Promise(inputVideo, subsData[idx], idx)
        );
      }
    }

    if (index < subsData.length) {
      _waitBatch(noteData, _process);
    }
    else {
      console.log(`Processed ${noteData.length} audio files`);
      return _waitBatch(noteData, allCompleteCallback);
    }
  }

  return _process();
};

const _waitBatch = (noteData, callback) => {
  return Bromise.all(noteData)
  .then(
    result => callback(result)
  )
  .catch(
    error => {throw error;}
  );
};

const _mp3Promise = (inputVideo, subItem, index) => {
  return new Bromise((resolve, reject) => {
    const fileName = `${utils.quickName(inputVideo).slice(0, 20)}_${utils.padZeros(subItem.id)}.mp3`;

    ffmpeg(inputVideo)
      .seekInput(subItem.startTime)
      .inputOptions('-vn')
      .output(`pkg/${fileName}`)
      .format('mp3')
      .outputOptions('-write_xing', 0) // Fixes Mac MP3 length error
      .duration(subItem.duration)

      .on('error', (err) => {
        console.log(chalk.red('An error occurred: ' + err.message));
        reject(err);
      })
      .on('end', () => {
        const mediaItem = {
          id: subItem.id,
          duration: subItem.duration,
          startTime: subItem.startTime,
          endTime: subItem.endTime,
          text: subItem.text,
          media: fileName,
          index
        };
        resolve(mediaItem);
      })
      .run();
  });
};

module.exports = generateAudio;