'use strict'

class TextMetrics {
    constructor({
        width, left, right, ascent, descent,
        fontAscent, fontDescent, emAscent, emDescent,
        hanging, alphabetic, ideographic
    }) {
        readOnly(this, "width", width)
        //readOnly(this, "actualBoundingBoxLeft", left)
        //readOnly(this, "actualBoundingBoxRight", right)
        readOnly(this, "actualBoundingBoxAscent", ascent)
        readOnly(this, "actualBoundingBoxDescent", descent)
        readOnly(this, "fontBoundingBoxAscent", fontAscent)
        readOnly(this, "fontBoundingBoxDescent", fontDescent)
        readOnly(this, "emHeightAscent", emAscent)
        readOnly(this, "emHeightDescent", emDescent)
        //readOnly(this, "hangingBaseline", hanging)
        //readOnly(this, "alphabeticBaseline", alphabetic)
        //readOnly(this, "ideographicBaseline", ideographic)
    }
}

// shorthands for attaching read-only attributes
const readOnly = (obj, attr, value) => (
    Object.defineProperty(obj, attr, { value, writable: false, enumerable: true })
)


export default TextMetrics;