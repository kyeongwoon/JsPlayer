'use strict'
import {core, RustClass} from '../RustClass.js'

class CanvasGradient extends RustClass {
    constructor(style, ...coords) {
        super(CanvasGradient)
        style = (style || "").toLowerCase()
        if (['linear', 'radial', 'conic'].includes(style)) this.init(style, ...coords)
        else throw new Error(`Function is not a constructor (use CanvasRenderingContext2D's "createConicGradient", "createLinearGradient", and "createRadialGradient" methods instead)`)
    }

    addColorStop(offset, color) {
        if (offset >= 0 && offset <= 1) this.ƒ('addColorStop', offset, color)
        else throw new Error("Color stop offsets must be between 0.0 and 1.0")
    }
}

export default CanvasGradient;