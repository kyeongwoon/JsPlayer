# JsPlayer
This project was inspired by http://dranger.com/ffmpeg/, and referenced the updated code from https://github.com/rambodrahmani/ffmpeg-video-player.

This project uses OpenAL and ffmpeg on the JS Canvas API. 

Media decoding and sound output are executed in separate threads using WebWorker. 

To simplify memory exchange between JS World and Native World, a large TypedArray is allocated in advance and used as a circular buffer, and the size can be adjusted arbitrarily.

## how to run
First, you need to copy the addon binaries of [neon_al](https://github.com/kyeongwoon/neon_al), [neon_ffmpeg](https://github.com/kyeongwoon/neon_ffmpeg), and [wgpu_canvas](https://github.com/kyeongwoon/wgpu-canvas) under the addon folder. This inconvenience will be improved in the future..

You can install the project with npm. In the project directory, run:

```js
// in JsPlayer.js
const media_file = 'your media file path'
```

```sh
$ npm install
$ node JsPlayer
```

## todo
- play control
- support subtitle
- gui widget

## Caveat
- Currently tested only on macos