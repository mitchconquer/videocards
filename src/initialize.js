const ffmpeg = require('fluent-ffmpeg');
const Bromise = require('bluebird');
const inquirer = require('inquirer');

const initialize = (inputSubs, inputVideo) => {
  if (inputSubs) {
    return new Bromise((resolve) => {
      resolve({
        userGivenSubs: true,
        path: inputSubs
      });
    });
  }

  return new Bromise((resolve, reject) => {
    // List all available subtitles
    ffmpeg(inputVideo)
      .ffprobe((err, data) => {
        const subStreams = data.streams
          .filter(stream => stream.codec_type === 'subtitle')
          .map(stream => ({
            language: stream.tags.language,
            index: stream.index
          }));
        // subStreams.forEach(language => console.log(language));
        const languages = subStreams.map(stream => stream.language);
        inquirer.prompt([
          {
            type: 'list',
            name: 'subtitleLang',
            choices: languages,
            message: 'Please choose a text language',
            default: languages[0]
          }
        ])
        .then(
          answers => console.log(answers)
        );
      });

    // Wait for user input

    // Return object of requested subtitle file and stream index OR given subtitle files
  });
};

module.exports = initialize;