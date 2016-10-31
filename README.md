# videocards

## Setup

<!-- Install [ffmpeg](http://ffmpeg.org/): `brew install ffmpeg` (note you must have [Homebrew](http://brew.sh/) installed first)

Run `npm link` in the project directory to install the script

Run `gencards videofile [subsfile]` -->

## Notes

If using with webpack, there is a conflict with fluent-ffmpeg so you must include this in your webpack config file.

```js
resolve: {
  alias: {
    'fluent-ffmpeg': 'fluent-ffmpeg/lib/fluent-ffmpeg.js'
  }
}
```

ffmpeg [documentation](https://ffmpeg.org/ffmpeg.html).

## Ideas

### Immediate ToDos

- [ ] Improve time manipulation by creating utility methods to convert times to objects and back
- [ ] Convert video to MP3 before cutting it up will save memory?
- [ ] Break anki deck creation into own npm
- [ ] If the fact that the deck field needs the default deck added first should add that fact to the android wiki page

### Feature Ideas

- [X] Option to join together subtitles in the same sentence
- [ ] Display all of the embedded subtitle tracks and select one
- [ ] Display all embeded audio tracks and choose one
- [ ] Shift subtitle tracking foward/backward
- [ ] Export with video or audio
- [ ] Control audio/video quality
- [ ] Branch off and improve subtitle parser
- [ ] Option to name deck separately from video file
- [ ] Better error handling if unrecognized formats
- [ ] Auto convert subtitles to acceptable format
- [ ] add cli flag to enable subtitle joining