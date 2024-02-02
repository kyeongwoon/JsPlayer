'use strict'

// shorthands for attaching read-only attributes
const readOnly = (obj, attr, value) => (
  Object.defineProperty(obj, attr, { value, writable: false, enumerable: true })
)

class ImageData {
  constructor(...args) {
    if (args[0] instanceof ImageData) {
      var { data, width, height } = args[0]
    } else if (args[0] instanceof Uint8ClampedArray || args[0] instanceof Buffer) {
      var [data, width, height] = args
      height = height || data.length / width / 4
      if (data.length / 4 != width * height) {
        throw new Error("ImageData dimensions must match buffer length")
      }
    } else {
      var [width, height] = args
    }

    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 0 || height < 0) {
      throw new Error("ImageData dimensions must be positive integers")
    }

    readOnly(this, "width", width)
    readOnly(this, "height", height)
    //readOnly(this, "data", new Uint8ClampedArray(data && data.buffer || width * height * 4))

    //console.log([width, height])
    this.data = new Uint8ClampedArray(data && data.buffer || width * height * 4);
  }
}

export default ImageData;  