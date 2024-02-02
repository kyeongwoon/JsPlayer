'use strict'

import {core, RustClass } from '../RustClass.js'
import fs from 'fs';

const imageCache = new Map();

class Image extends RustClass {
  constructor() {
    super(Image).alloc()
  }

  get complete() { return this.prop('complete') }
  get height() { return this.prop('height') }
  get width() { return this.prop('width') }

  get src() { return this.prop('src') }
  set src(src) {
    let data;

    if (Buffer.isBuffer(src)) {
      [data, src] = [src, '']
    } else if (typeof src != 'string') {
      return
    } else if (/^\s*data:/.test(src)) {
      // data URI
      let split = src.indexOf(','),
        enc = src.lastIndexOf('base64', split) !== -1 ? 'base64' : 'utf8',
        content = src.slice(split + 1);
      data = Buffer.from(content, enc);
    } else if (/^\s*https?:\/\//.test(src)) {
      // remote URL
      // todo

    } else {
      // local file path
      if(imageCache.has(src)) {
        console.log('cache hit ....')
        data = imageCache.get(src);
      } else {
        data = fs.readFileSync(src);
        imageCache.set(src, data);
      }
    }

    this.prop("src", src)
    if (data) {
      this.prop("data", data);
      if (this.onload) {
        this.onload();
      }
    }
  }
}

export default Image;