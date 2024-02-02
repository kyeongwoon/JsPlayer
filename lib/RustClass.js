'use strict'

import { createRequire } from 'module';
const nativeModule = createRequire(import.meta.url)('../addon/wgpu_canvas.node')
//
// Neon <-> Node interface
//

const ø = Symbol.for('📦'); // the attr containing the boxed struct
const core = (obj) => (obj || {})[ø]; // dereference the boxed struct

// native module -> js object
const neon = {};

for (const [name, fn] of Object.entries(nativeModule)) {
    const parts = name.split('_');
    const struct = parts[0];
    let getset, attr;
    if (parts.length === 3) {
        getset = parts[1];
        attr = parts[2];
    } else {
        attr = parts[1];
    }

    if (struct && attr) {
        if (!neon[struct]) {
            neon[struct] = {};
        }
        if (getset) {
            if (!neon[struct][attr]) {
                neon[struct][attr] = {};
            }
            neon[struct][attr][getset] = fn
        } else {
            neon[struct][attr] = fn;
        }
    }
}

class RustClass {
    constructor(type) {
        Object.defineProperty(this, 'native', { value: neon[type.name], writable: false, enumerable: false })
    }

    alloc(...args) {
        const value = this.native['new'](null, ...args)
        Object.defineProperty(this, ø, { value, writable: false, enumerable: false })
    }

    init(fn, ...args) {
        const value = this.native[fn](null, ...args)
        Object.defineProperty(this, ø, { value, writable: false, enumerable: false })
    }

    ref(key, val) {
        return arguments.length > 1 ? this[Symbol.for(key)] = val : this[Symbol.for(key)]
    }

    prop(attr, ...vals) {
        const getset = arguments.length > 1 ? 'set' : 'get'
        return this.native[attr][getset](this[ø], ...vals)
    }

    ƒ(fn, ...args) {
        try {
            return this.native[fn](this[ø], ...args)
        } catch (error) {
            Error.captureStackTrace(error, this.ƒ)
            throw error
        }
    }
}

export { neon, core, RustClass };
export default RustClass;
