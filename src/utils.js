module.exports = {
  quickName: (videoPath) => {
    const regex = /(.*\/)*(.*)\.(.{0,4})/;
    const matches = videoPath.match(regex);
    return matches[2];
  },
  padZeros: (id) => {
    const numDigits = 5;
    const padding = (numDigits - `${id}`.length);
    let padded = `${id}`;
    for (let i = 0; i < padding; i++) {
      padded = `0${padded}`;
    }
    return padded;
  },
  getGuid: () => {
    return 'xxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const r = Math.random()*16|0;
      const v = char === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
};