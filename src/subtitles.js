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
        duration: _getDurationInSeconds(subItem.startTime, subItem.endTime),
        startTime: subItem.startTime.replace(',', '.'),
        endTime: subItem.endTime.replace(',', '.'),
        text: subItem.text.replace('\n', ' ')
      };
    }));
  });
};

subtitles.joinSentences = (subsData, userOptions = {}) => {
  const defaultOptions = {
    autoBufferTime: true,
    reduceBufferBy: 1,
    bufferTime: 150,
    joinByPunctuation: true,
    trailingPunctTrigger: '...',
    leadingPunctTrigger: '...'
  }
  const options = Object.assign(defaultOptions, userOptions);
  console.log(chalk.dim('Parsing subtitles with following options'));
  console.log(options);

  let groupedSubIds;
  if (options.joinByPunctuation) {
    groupedSubIds = _groupSubsByPunct(subsData, options);
  } else {
    groupedSubIds = _groupSubsByTime(subsData, options);
  }

  console.log(_parseSubGrouping(subsData, groupedSubIds));

  return _parseSubGrouping(subsData, groupedSubIds);
};

const _groupSubsByPunct = (subsData, options) => {
  const groupedSubIds = [];
  let currentGroup = [];

  const leading = options.leadingPunctTrigger;
  const trailing = options.trailingPunctTrigger;

  subsData.forEach((sub, index) => {
    const led = sub.text.startsWith(leading);
    const trailed = sub.text.endsWith(trailing);
    let prevIsTrailed;
    if (index > 0) {
      prevIsTrailed = subsData[index - 1].text.endsWith(trailed);
    }

    if (currentGroup.length < 1) {
      currentGroup.push(sub.id);
      if (!leading && !trailed) {
        groupedSubIds.push(currentGroup);
        currentGroup = [];
      }
      return true;
    }

    if (leading && led) {
      currentGroup.push(sub.id);
      if (!trailing || !trailed) {
        groupedSubIds.push(currentGroup);
        currentGroup = [];
      }
      return true;
    }

    if (trailing && prevIsTrailed) {
      currentGroup.push(sub.id);
      if (!leading & !trailed) {
        groupedSubIds.push(currentGroup);
        currentGroup = [];
        return true;
      }
    }
  });
  groupedSubIds.push(currentGroup);
  return groupedSubIds;
};

const _groupSubsByTime = (subsData, options) => {
  const groupedSubIds = [];
  let prevEndTime;
  let currentGroup = [];

  let bufferTime;
  if (options.autoBufferTime) {
    bufferTime = subtitles.timeGapMode(subsData) - options.reduceBufferBy;
  } else {
    bufferTime = options.bufferTime;
  }

  subsData.forEach(sub => {
    if (!prevEndTime) {
      prevEndTime = sub.endTime;
      currentGroup = [sub.id];
      return;
    }

    const timeGapMs = _getDurationInSeconds(prevEndTime, sub.startTime) * 1000;

    if (timeGapMs <= bufferTime) {
      currentGroup.push(sub.id);
      prevEndTime = sub.endTime;
      return;
    }

    groupedSubIds.push(currentGroup);
    currentGroup = [sub.id];
    prevEndTime = sub.endTime;

  });

  groupedSubIds.push(currentGroup);

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
        duration = _getDurationInSeconds(startTime, endTime) + durationPadding;
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

    const timeGapMs = _getDurationInSeconds(prevEndTime, sub.startTime) * 1000;

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

subtitles.extract = (inputSubs = null, inputVideo) => {
  if (inputSubs) {
    // Just return the subs file if they are given by the user
    return new Bromise(resolve => resolve(inputSubs));
  }

  utils.ensureDir('./output');
  return new Bromise((resolve, reject) => {
    ffmpeg(inputVideo)
    .output(`output/${utils.quickName(inputVideo)}.srt`)
    .noVideo()
    .noAudio()
    .outputOptions('-c:s:0 srt')
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

const _getDurationInSeconds = (startTime, endTime) => {
  const end = _timeInMSeconds(endTime);
  const start = _timeInMSeconds(startTime);
  return (end - start) / 1000;
};

const _timeInMSeconds = (timeString) => {
  const timeArray = timeString.split(':');
  const hours = parseInt(timeArray[0]);
  const minutes = parseInt(timeArray[1]);
  const separator = (timeArray[2].indexOf(',') > -1) ? ',' : '.'; 
  const seconds = parseInt(timeArray[2].split(separator)[0]);
  const mSeconds = parseInt(timeArray[2].split(separator)[1]);

  return mSeconds + (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000);
};

module.exports = subtitles;