'use strict'

import { core, RustClass } from '../RustClass.js'
import CanvasRenderingContext2D from './CanvasRenderingContext2D.js';

//
// The Canvas API
//

class Canvas extends RustClass {
    #contexts

    constructor(width, height) {
        super(Canvas).alloc()
        this.#contexts = []
        Object.assign(this, { width, height })
    }

    getContext(kind) {
        return (kind == "2d") ? this.#contexts[0] || this.newPage() : null
    }

    getAttribute(key) {
        if (key === 'width') return this.prop('width');
        else if (key === 'height') return this.prop('height');
    }


    get width() { return this.prop('width') }
    set width(w) {
        this.prop('width', (typeof w == 'number' && !Number.isNaN(w) && w >= 0) ? w : 300)
        if (this.#contexts[0]) this.getContext("2d").ƒ('resetSize', core(this))
    }

    get height() { return this.prop('height') }
    set height(h) {
        this.prop('height', h = (typeof h == 'number' && !Number.isNaN(h) && h >= 0) ? h : 150)
        if (this.#contexts[0]) this.getContext("2d").ƒ('resetSize', core(this))
    }

    newPage(width, height) {
        let ctx = new CanvasRenderingContext2D(this)
        this.#contexts.unshift(ctx)
        if (arguments.length == 2) {
            Object.assign(this, { width, height })
        }
        return ctx
    }

    get pages() {
        return this.#contexts.slice().reverse()
    }

    get png() { return this.toBuffer("png") }
    get jpg() { return this.toBuffer("jpg") }
    get pdf() { return this.toBuffer("pdf") }
    get svg() { return this.toBuffer("svg") }


    saveAsSync(filename, opts = {}) {
        opts = typeof opts == 'number' ? { quality: opts } : opts
        let { format, quality, pages, padding, pattern, density, outline, matte } = io.options(this.pages, { filename, ...opts })
        this.ƒ("saveSync", pages.map(core), pattern, padding, format, quality, density, outline, matte)
    }

    toBufferSync(extension = "png", opts = {}) {
        opts = typeof opts == 'number' ? { quality: opts } : opts
        let { format, quality, pages, density, outline, matte } = io.options(this.pages, { extension, ...opts })
        return this.ƒ("toBufferSync", pages.map(core), format, quality, density, outline, matte)
    }

    toDataURLSync(extension = "png", opts = {}) {
        opts = typeof opts == 'number' ? { quality: opts } : opts
        let { mime } = io.options(this.pages, { extension, ...opts }),
            buffer = this.toBufferSync(extension, opts);
        return `data:${mime};base64,${buffer.toString('base64')}`
    }
}

export default Canvas;