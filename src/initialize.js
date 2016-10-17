const ffmpeg = require('fluent-ffmpeg');
const Bromise = require('bluebird');
const inquirer = require('inquirer');
const subtitles = require('./subtitles');

const initializeSubs = (inputSubs, inputVideo) => {
  if (inputSubs) {
    return new Bromise((resolve) => {
      resolve(inputSubs);
    });
  }

  return new Bromise((resolve, reject) => {
    // List all available subtitles
    ffmpeg(inputVideo)
      .ffprobe((err, data) => {
        if (err) {
          throw err;
        }

        const subStreams = data.streams
          .filter(stream => stream.codec_type === 'subtitle')
          .map(stream => ({
            language: stream.tags.language,
            index: stream.index
          }));
        const languages = subStreams.map(stream => stream.language);

        inquirer.prompt([
          {
            type: 'list',
            name: 'language',
            choices: languages,
            message: 'Please choose a text language',
            default: languages[0]
          }
        ])
        .then(
          answer => {
            const index = subStreams.filter(sub => sub.language === answer.language)[0].index;
            const extractedSubs = subtitles.extract(index, inputVideo);
            return resolve(extractedSubs);
          }
        );
      });
  });
};

module.exports = initializeSubs;