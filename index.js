#! /usr/bin/env node

const ffmpeg = require('fluent-ffmpeg');
const Subtitle = require('./src/subtitle.js');

const userArgs = process.argv.slice(2);
const inputFile = userArgs[0];
const inputStart = '5:00';
const duration = '00:30.000';

const sub = new Subtitle('testfile.mkv');

console.log(sub.file);

// ffmpeg(inputFile)
//   .seekInput(inputStart)
//   .inputOptions('-vn')
//   .output(`output/audio-${inputFile}-${inputStart}.mp3`)
//   .format('mp3')
//   .duration(duration)

//   .on('error', (err) => {
//     console.log('An error occurred: ' + err.message);
//   })
//   .on('end', () => {
//     console.log(`Processing ${inputFile} finished !`);
//   })
//   .run();

