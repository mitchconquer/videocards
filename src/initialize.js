const ffmpeg = require('fluent-ffmpeg');
const Bromise = require('bluebird');

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
        console.log(data.streams.filter(stream => stream.codec_type === 'subtitle'));
      });
      resolve();
    // Wait for user input
    // Return object of requested subtitle file and stream index OR given subtitle files
  });
};

module.exports = initialize;