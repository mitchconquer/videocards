const fs = require('fs');
const subsParser = require('subtitles-parser');
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const utils = require('./utils');
const Bromise = require('bluebird');
const startBuffer = 200;
const endBuffer = 200;

const subtitles = {};

subtitles.subsTransform = (inputSubs) => {
  return new Bromise((resolve, reject) => {
    const subFile = fs.readFileSync(inputSubs,'utf8');
    const subsData = subsParser.fromSrt(subFile);

    resolve(subsData.map(subItem => {
      return {
        id: parseInt(subItem.id),
        duration: utils.durationInSeconds(subItem.startTime, subItem.endTime),
        startTime: subItem.startTime.replace(',', '.'),
        endTime: subItem.endTime.replace(',', '.'),
        text: subItem.text.replace('\n', ' ')
      };
    }));
  });
};

subtitles.joinSentences = (subsData) => {
  const groupedSubIds = _groupSubsByPunct(subsData);
  return _parseSubGrouping(subsData, groupedSubIds);
};

const _groupSubsByPunct = (subsData) => {
  const punctuation = '...';
  const groupedSubIds = [];

  subsData.forEach((sub, index) => {
    const notYetAdded = !_flatten(groupedSubIds).includes(sub.id);
    if (notYetAdded) {
      groupedSubIds.push(_parse(index));
    }
  });

  function _parse(index) {
    let ids = [subsData[index].id];
    if (subsData[index].text.endsWith(punctuation)){
      ids = ids.concat(_parse(index + 1));
    }
    return ids;
  }

  function _alreadyAdded(multiDimArray, needle) {
    return _flatten(multiDimArray).includes(needle);
  }

  function _flatten(input) {
    if (!Array.isArray(input)) {
      return input;
    }
    return input.reduce((flat, item) => flat.concat(_flatten(item)), []);
  }

  return groupedSubIds;
};

const _parseSubGrouping = (subsData, groupedSubIds) => {
  const durationPadding = 0.1;

  const parsedSubs = [];
  groupedSubIds.forEach(subGroup => {
    let startTime, endTime, id, duration;
    let text = '';

    subGroup.forEach((subId, index) => {
      const sub = subsData.filter(sub => sub.id === subId)[0];
      if (index === 0) {
        startTime = sub.startTime;
        id = sub.id;
      }
      if (index === subGroup.length - 1) {
        endTime = sub.endTime;
        duration = utils.durationInSeconds(startTime, endTime) + durationPadding;
      }
      text += ` ${sub.text}`;
    });
    parsedSubs.push({id, duration, startTime, endTime, text});
  });
  return parsedSubs;
};

subtitles.timeGapMode = (subsData) => {
  const timeGaps = [];
  let prevEndTime;
  
  subsData.forEach(sub => {
    if (!prevEndTime) {
      prevEndTime = sub.endTime;
      currentGroup = [sub.id];
      return;
    }

    const timeGapMs = utils.durationInSeconds(prevEndTime, sub.startTime) * 1000;

    timeGaps.push(timeGapMs);
  });

  return _findMode(timeGaps);
}

const _findMode = (numberSet) => {
  const totals = {};
  numberSet.forEach(num => {
    if (totals[num]) {
      totals[num]++;
    } else {
      totals[num] = 1;
    }
  });

  let mode;
  let count = 0;
  Object.keys(totals).forEach(num => {
    if (totals[num] > count) {
      count = totals[num];
      mode = num;
    }
  });

  return mode;
};

subtitles.extract = (streamIndex, inputVideo) => {

  utils.ensureDir('./output');
  return new Bromise((resolve, reject) => {
    ffmpeg(inputVideo)
    .output(`output/${utils.quickName(inputVideo)}.srt`)
    .noVideo()
    .noAudio()
    .outputOptions(`-c:s:${streamIndex} srt`)
    .on('start', () => console.log('Extracting subtitles...'))
    .on('error', (err) => {
      console.log(chalk.red(`An error occured while generating subtitles. ${err.message}`));
      reject(err);
    })
    .on('end', () => {
      console.log(chalk.green('Successfully extracted subtitles'));
      inputSubs = `output/${utils.quickName(inputVideo)}.srt`;
      resolve(inputSubs);
    })
    .run()
  });
};

module.exports = subtitles;