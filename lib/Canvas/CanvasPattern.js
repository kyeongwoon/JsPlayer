'use strict'
import {core, RustClass} from '../RustClass.js'

class CanvasPattern extends RustClass {
    constructor(src, repeat) {
        super(CanvasPattern)
        if (src instanceof Image) {
            this.init('from_image', core(src), repeat)
        } else if (src instanceof Canvas) {
            let ctx = src.getContext('2d')
            this.init('from_canvas', core(ctx), repeat)
        } else {
            throw new Error("CanvasPatterns require a source Image or a Canvas")
        }
    }

    setTransform(matrix) {
        if (arguments.length > 1) matrix = [...arguments]
        this.ƒ('setTransform', toSkMatrix(matrix))
    }
}

export default CanvasPattern;