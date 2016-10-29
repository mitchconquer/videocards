#! /usr/bin/env node

const initializeSubs = require('./src/initialize');
const subtitles = require('./src/subtitles');
// const generateAudio = require('./src/audio');
// const utils = require('./src/utils');
// const createAnkiDb = require('./src/database');
// const apkgCreater = require('./src/archiver');
// const Bromise = require('bluebird');

// const userArgs = process.argv.slice(2);
// const inputVideo = userArgs[0];
// const inputSubs = userArgs[1];

exports.initializeSubs = (inputSubs, inputVideo) => {
  let subtitles;
  initializeSubs(inputSubs, inputVideo)
    .then(
      subs => {
        subtitles = subtitles.subsTransform(subs);
      }
    );

  return subtitles;
};

// initializeSubs(inputSubs, inputVideo)
//   .then(subtitles.subsTransform)
//   .then(subtitles.joinSentences)
//   .then(
//     subsData => generateAudio(inputVideo, subsData)
//   )
//   .then(
//     noteData => createAnkiDb(inputVideo, noteData)
//   )
//   .then(
//     dbFile => apkgCreater(dbFile, utils.quickName(inputVideo))
//   )
//   .then(
//     () => {utils.rmFiles('./pkg');}
//   )
//   .then(
//     () => {utils.rmFiles('./output');}
//   )
//   .catch(
//     err => console.log('A big ol\' error occured', err)
//   );
