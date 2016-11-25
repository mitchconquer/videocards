# videocards

## Notes

If using with webpack, there is a conflict with fluent-ffmpeg so you must include this in your webpack config file.

```js
resolve: {
  alias: {
    'fluent-ffmpeg': 'fluent-ffmpeg/lib/fluent-ffmpeg.js'
  }
}
```

If using this package with electron, Sqlite3 has an issue where it can't access the compiled files during runtime. Use [electron-rebuild](https://github.com/electron/electron-rebuild#node-pre-gyp-workaround) to resolve the issue.

ffmpeg [documentation](https://ffmpeg.org/ffmpeg.html).
