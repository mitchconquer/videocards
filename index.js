#! /usr/bin/env node

const ffmpeg = require('fluent-ffmpeg');

const userArgs = process.argv.slice(2);
const inputFile = userArgs[0];
const inputStart = '5:00';
const duration = '00:30.000';

ffmpeg(inputFile)
  .seekInput(inputStart)
  .inputOptions('-vn')
  .output(`output/audio-${inputFile}-${inputStart}.mp3`)
  .format('mp3')
  .duration(duration)

  .on('error', (err) => {
    console.log('An error occurred: ' + err.message);
  })
  .on('end', () => {
    console.log(`Processing ${inputFile} finished !`);
  })
  .run();

