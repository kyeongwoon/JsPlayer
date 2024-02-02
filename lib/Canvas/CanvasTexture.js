'use strict'
import {core, RustClass} from '../RustClass.js'

class CanvasTexture extends RustClass {
    constructor(spacing, { path, line, color, angle, offset = 0 } = {}) {
        super(CanvasTexture)
        let [x, y] = typeof offset == 'number' ? [offset, offset] : offset.slice(0, 2)
        let [h, v] = typeof spacing == 'number' ? [spacing, spacing] : spacing.slice(0, 2)
        path = core(path)
        line = line != null ? line : (path ? 0 : 1)
        angle = angle != null ? angle : (path ? 0 : -Math.PI / 4)
        this.alloc(path, color, line, angle, h, v, x, y)
    }
}

export default CanvasTexture;