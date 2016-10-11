#! /usr/bin/env node

const subtitles = require('./src/subtitles');
const generateAudio = require('./src/audio');
const utils = require('./src/utils');
const createAnkiDb = require('./src/database');
const apkgCreater = require('./src/archiver');
const Bromise = require('bluebird');

const userArgs = process.argv.slice(2);
const inputVideo = userArgs[0];
let inputSubs = userArgs[1];


if (!inputSubs) {
  subtitles.extract(inputVideo)
    .then(subtitles.subsTransform)
    .then(
      subsData => generateAudio(inputVideo, subsData)
    )
    .then(
      noteData => createAnkiDb(inputVideo, noteData)
    )
    .then(
      dbFile => apkgCreater(dbFile, utils.quickName(inputVideo))
    )
    .then(
      // () => {utils.rmFiles('./pkg');}
    )
    .catch(
      err => console.log('A big error occured', err)
    );
}

if (inputSubs) generateAudio(subtitles.subsTransform(inputSubs));
