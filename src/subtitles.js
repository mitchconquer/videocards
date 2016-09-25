const fs = require('fs');
const subsParser = require('subtitles-parser');
const startBuffer = 200;
const endBuffer = 200;

const subsTransform = (inputSubs) => {
  const subFile = fs.readFileSync(inputSubs,'utf8');
  const subsData = subsParser.fromSrt(subFile);

  return subsData.map(subItem => {
    return {
      id: parseInt(subItem.id),
      duration: getDurationInSeconds(subItem.startTime, subItem.endTime),
      startTime: subItem.startTime.replace(',', '.'),
      endTime: subItem.endTime.replace(',', '.'),
      text: subItem.text.replace('\n', ' ')
    };
  });
};

const subtractTime = (timeString, timeAdjustment) => {
  let adjustment = timeAdjustment;
  const timeArray = timeString.split(':');
  let hours = parseInt(timeArray[0]) - Math.floor(adjustment / 3600000);
  adjustment = adjustment - Math.floor(adjustment / 3600000) * 3600000;
  let minutes = parseInt(timeArray[1]) - Math.floor(adjustment / 6000);
  adjustment = adjustment -  Math.floor(adjustment / 6000) * 6000;
  let seconds = parseInt(timeArray[2].split(',')[0]) - Math.floor(adjustment / 6000);
  adjustment = adjustment - Math.floor(adjustment / 1000) * 1000;
  let mSeconds = parseInt(timeArray[2].split(',')[1]) - adjustment;

  console.log(`${hours}:${minutes}:${seconds}.${mSeconds}`);
  return `${hours}:${minutes}:${seconds}.${mSeconds}`;
};

const getDurationInSeconds = (startTime, endTime) => {
  return (timeInMSeconds(endTime) - timeInMSeconds(startTime) + endBuffer) / 1000
};

const timeInMSeconds = (timeString) => {
  const timeArray = timeString.split(':');
  const hours = parseInt(timeArray[0]);
  const minutes = parseInt(timeArray[1]);
  const seconds = parseInt(timeArray[2].split(',')[0]);
  const mSeconds = parseInt(timeArray[2].split(',')[1]);

  // console.log({hours, minutes, seconds, mSeconds});

  return mSeconds + (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000);
};

module.exports = subsTransform;