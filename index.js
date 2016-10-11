#! /usr/bin/env node

const ffmpeg = require('fluent-ffmpeg');
const subsParser = require('./src/subtitles');
const chalk = require('chalk');
const utils = require('./src/utils');
const database = require('./src/database');
const apkgCreater = require('./src/archiver');

const userArgs = process.argv.slice(2);
const inputVideo = userArgs[0];
let inputSubs = userArgs[1];

if (!inputSubs) {
  ffmpeg(inputVideo)
    .output(`output/${utils.quickName(inputVideo)}.srt`)
    .noVideo()
    .noAudio()
    .outputOptions('-c:s:0 srt')
    .on('error', (err) => {
      console.log(chalk.red(`An error occured while generating subtitles. ${err.message}`));
    })
    .on('start', () => console.log('Extracting subtitles...'))
    .on('end', () => {
      console.log(chalk.green('Successfully extracted subtitles'));
      inputSubs = `output/${utils.quickName(inputVideo)}.srt`;
      generateAudio(subsParser(inputSubs))
    })
    .run()
}

if (inputSubs) generateAudio(subsParser(inputSubs));

const generateAudio = (subsData) => {
  console.log('Slicing video file... )xxxxx[;;;;;;;;;>');
  const noteData = [];
  let index = 0;
  subsData.forEach(subItem => {

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
      })
      .on('start', () => {
        // console.log(`${chalk.dim('Processing')} ${fileName}`);
      })
      .run();

    noteData.push({text: subItem.text, media: fileName, index});
    index++;
  });

  const onFinishDb = database.createAnkiDeck(inputVideo, noteData);
  onFinishDb(apkgCreater);

};
