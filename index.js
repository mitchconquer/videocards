const path = require('path');
const initializeSubs = require('./src/initialize');
const subtitles = require('./src/subtitles');
const generateAudio = require('./src/audio').generateAudio;
const updateAudio = require('./src/audio').updateAudio;
const createAnkiDb = require('./src/database');
const apkgCreater = require('./src/archiver');
const utils = require('./src/utils');
// const Bromise = require('bluebird');

// const userArgs = process.argv.slice(2);
// const inputVideo = userArgs[0];
// const inputSubs = userArgs[1];

exports.initializeSubs = initializeSubs;
exports.transformSubs = subtitles.subsTransform;
exports.generateAudio = generateAudio;
exports.updateAudio = updateAudio;
exports.getAudioDir = () => path.resolve('pkg');
exports.createAnkiDb = createAnkiDb;
exports.createApkg = apkgCreater;
exports.rmFile = utils.rmFile;
exports.rmFiles = utils.rmFiles;
exports.quickName = utils.quickName;
exports.combineSubtitles = utils.combineSubtitles;


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
