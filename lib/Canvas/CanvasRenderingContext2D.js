'use strict'

import { core, RustClass } from '../RustClass.js'
import CanvasGradient from './CanvasGradient.js';
import CanvasPattern from './CanvasPattern.js';
import CanvasTexture from './CanvasTexture.js';
import Path2D from './Path2D.js';
import Image from './Image.js';
import ImageData from './ImageData.js';
import TextMetrics from './TextMetrics.js';
import DOMMatrix from '../DOM/DOMMatrix.js';
import css from './css.js'
import { parseFont } from "css-font-parser";
import fontManager from 'node-system-fonts';

const toString = val => typeof val == 'string' ? val : new String(val).toString()

class CanvasRenderingContext2D extends RustClass {
    #canvas
    constructor(canvas) {
        try {
            super(CanvasRenderingContext2D).alloc(core(canvas))
            this.#canvas = new WeakRef(canvas)
        } catch (e) {
            throw new TypeError(`Function is not a constructor (use Canvas's "getContext" method instead)`)
        }
    }

    get canvas() { return this.#canvas.deref() }

    // -- global state & content reset ------------------------------------------
    reset() { this.ƒ('reset') }

    // -- grid state ------------------------------------------------------------
    save() { this.ƒ('save') }
    restore() { this.ƒ('restore') }

    get currentTransform() { return (this.prop('currentTransform')) }
    set currentTransform(matrix) { this.prop('currentTransform', (matrix)) }

    resetTransform() { this.ƒ('resetTransform') }
    getTransform() { return this.currentTransform }
    setTransform(matrix) {
        this.currentTransform = arguments.length > 1 ? [...arguments] : matrix
    }

    transform(a, b, c, d, e, f) { this.ƒ('transform', ...arguments) }
    translate(x, y) { this.ƒ('translate', ...arguments) }
    scale(x, y) { this.ƒ('scale', ...arguments) }
    rotate(angle) { this.ƒ('rotate', ...arguments) }

    createProjection(quad, basis) {
        return (this.ƒ("createProjection", [quad].flat(), [basis].flat()))
    }

    // -- bézier paths ----------------------------------------------------------
    beginPath() { this.ƒ('beginPath') }
    rect(x, y, width, height) { this.ƒ('rect', ...arguments) }
    arc(x, y, radius, startAngle, endAngle, isCCW) { this.ƒ('arc', ...arguments) }
    ellipse(x, y, xRadius, yRadius, rotation, startAngle, endAngle, isCCW) { this.ƒ('ellipse', ...arguments) }
    moveTo(x, y) { this.ƒ('moveTo', ...arguments) }
    lineTo(x, y) { this.ƒ('lineTo', ...arguments) }
    arcTo(x1, y1, x2, y2, radius) { this.ƒ('arcTo', ...arguments) }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) { this.ƒ('bezierCurveTo', ...arguments) }
    quadraticCurveTo(cpx, cpy, x, y) { this.ƒ('quadraticCurveTo', ...arguments) }
    conicCurveTo(cpx, cpy, x, y, weight) { this.ƒ("conicCurveTo", ...arguments) }
    closePath() { this.ƒ('closePath') }
    isPointInPath(x, y) { return this.ƒ('isPointInPath', ...arguments) }
    isPointInStroke(x, y) { return this.ƒ('isPointInStroke', ...arguments) }

    roundRect(x, y, w, h, r) {
        let radii = css.radii(r)
        if (radii) {
            if (w < 0) radii = [radii[1], radii[0], radii[3], radii[2]]
            if (h < 0) radii = [radii[3], radii[2], radii[1], radii[0]]
            this.ƒ("roundRect", x, y, w, h, ...radii.map(({ x, y }) => [x, y]).flat())
        }
    }


    // -- using paths -----------------------------------------------------------
    fill(path, rule) {
        if (path instanceof Path2D) this.ƒ('fill', core(path), rule)
        else this.ƒ('fill', path) // 'path' is the optional winding-rule
    }

    stroke(path, rule) {
        if (path instanceof Path2D) this.ƒ('stroke', core(path), rule)
        else this.ƒ('stroke', path) // 'path' is the optional winding-rule
    }

    clip(path, rule) {
        if (path instanceof Path2D) this.ƒ('clip', core(path), rule)
        else this.ƒ('clip', path) // 'path' is the optional winding-rule
    }

    // -- shaders ---------------------------------------------------------------
    createPattern(image, repetition) { return new CanvasPattern(...arguments) }
    createLinearGradient(x0, y0, x1, y1) {
        return new CanvasGradient("Linear", ...arguments)
    }
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        return new CanvasGradient("Radial", ...arguments)
    }
    createConicGradient(startAngle, x, y) {
        return new CanvasGradient("Conic", ...arguments)
    }

    createTexture(spacing, options) {
        return new CanvasTexture(spacing, options)
    }

    // -- fill & stroke ---------------------------------------------------------
    fillRect(x, y, width, height) { this.ƒ('fillRect', ...arguments) }
    strokeRect(x, y, width, height) { this.ƒ('strokeRect', ...arguments) }
    clearRect(x, y, width, height) { this.ƒ('clearRect', ...arguments) }

    set fillStyle(style) {
        const isShader = style instanceof CanvasPattern || style instanceof CanvasGradient || style instanceof CanvasTexture;
        const [ref, val] = isShader ? [style, core(style)] : [null, style]
        this.ref('fill', ref)
        this.prop('fillStyle', val)
    }

    get fillStyle() {
        let style = this.prop('fillStyle')
        return style === null ? this.ref('fill') : style
    }

    set strokeStyle(style) {
        const isShader = style instanceof CanvasPattern || style instanceof CanvasGradient || style instanceof CanvasTexture;
        const [ref, val] = isShader ? [style, core(style)] : [null, style]
        this.ref('stroke', ref)
        this.prop('strokeStyle', val)
    }

    get strokeStyle() {
        const style = this.prop('strokeStyle')
        return style === null ? this.ref('stroke') : style
    }

    // -- line style ------------------------------------------------------------
    getLineDash() { return this.ƒ("getLineDash") }
    setLineDash(segments) { this.ƒ("setLineDash", segments) }
    get lineCap() { return this.prop("lineCap") }
    set lineCap(style) { this.prop("lineCap", style) }
    get lineDashFit() { return this.prop("lineDashFit") }
    set lineDashFit(style) { this.prop("lineDashFit", style) }
    get lineDashMarker() { return wrap(Path2D, this.prop("lineDashMarker")) }
    set lineDashMarker(path) { this.prop("lineDashMarker", path instanceof Path2D ? core(path) : path) }
    get lineDashOffset() { return this.prop("lineDashOffset") }
    set lineDashOffset(offset) { this.prop("lineDashOffset", offset) }
    get lineJoin() { return this.prop("lineJoin") }
    set lineJoin(style) { this.prop("lineJoin", style) }
    get lineWidth() { return this.prop("lineWidth") }
    set lineWidth(width) { this.prop("lineWidth", width) }
    get miterLimit() { return this.prop("miterLimit") }
    set miterLimit(limit) { this.prop("miterLimit", limit) }

    // -- imagery ---------------------------------------------------------------
    get imageSmoothingEnabled() { return this.prop("imageSmoothingEnabled") }
    set imageSmoothingEnabled(flag) { this.prop("imageSmoothingEnabled", !!flag) }
    get imageSmoothingQuality() { return this.prop("imageSmoothingQuality") }
    set imageSmoothingQuality(level) { this.prop("imageSmoothingQuality", level) }
    putImageData(imageData, ...coords) { this.ƒ('putImageData', imageData, ...coords) }
    createImageData(width, height) { return new ImageData(width, height) }

    getImageData(x, y, width, height) {
        let w = Math.floor(width),
            h = Math.floor(height),
            buffer = this.ƒ('getImageData', x, y, w, h);
        return new ImageData(buffer, w, h)
    }

    drawImage(image, ...coords) {
        //  this.ƒ('drawImage', core(image.getContext('2d')), ...coords)
        if (image instanceof Image) {
            this.ƒ('drawImage', core(image), ...coords)
        } else {
            throw new Error("Expected an Image or a Canvas argument")
        }
    }

    drawCanvas(image, ...coords) {
        //if (image instanceof Canvas) {
        //  this.ƒ('drawCanvas', core(image.getContext('2d')), ...coords)
        this.drawImage(image, ...coords)
    }

    // -- typography ------------------------------------------------------------
    get font() { return this.prop('font') }
    set font(str) {
        // const o = parseFont(str);
        const o = css.font(str);
        const fonts = fontManager.findFontSync({ family: o.family[0], style: o.style });
        o.path = fonts.path

        console.log(o);
        this.prop('font', o)
    }
    get textAlign() { return this.prop("textAlign") }
    set textAlign(mode) { this.prop("textAlign", mode) }
    get textBaseline() { return this.prop("textBaseline") }
    set textBaseline(mode) { this.prop("textBaseline", mode) }
    get direction() { return this.prop("direction") }
    set direction(mode) { this.prop("direction", mode) }

    measureText(text, maxWidth) {
        //text = this.textWrap ? text : text + '\u200b' // include trailing whitespace by default
        let metrics = this.ƒ('measureText', toString(text), maxWidth)
        /*
                width, left, right, ascent, descent,
        fontAscent, fontDescent, emAscent, emDescent,
        hanging, alphabetic, ideographic
        */
        return new TextMetrics(metrics)
    }

    fillText(text, x, y, maxWidth) {
        this.ƒ('fillText', toString(text), x, y, maxWidth)
    }

    strokeText(text, x, y, maxWidth) {
        this.ƒ('strokeText', toString(text), x, y, maxWidth)
    }

    outlineText(text) {
        let path = this.ƒ('outlineText', toString(text))
        return path ? wrap(Path2D, path) : null
    }

    // -- non-standard typography extensions --------------------------------------------
    get fontVariant() { return this.prop('fontVariant') }
    set fontVariant(str) { this.prop('fontVariant', css.variant(str)) }
    get textTracking() { return this.prop("textTracking") }
    set textTracking(ems) { this.prop("textTracking", ems) }
    get textWrap() { return this.prop("textWrap") }
    set textWrap(flag) { this.prop("textWrap", !!flag) }

    // -- effects ---------------------------------------------------------------
    get globalCompositeOperation() { return this.prop("globalCompositeOperation") }
    set globalCompositeOperation(blend) { this.prop("globalCompositeOperation", blend) }
    get globalAlpha() { return this.prop("globalAlpha") }
    set globalAlpha(alpha) { this.prop("globalAlpha", alpha) }
    get shadowBlur() { return this.prop("shadowBlur") }
    set shadowBlur(level) { this.prop("shadowBlur", level) }
    get shadowColor() { return this.prop("shadowColor") }
    set shadowColor(color) { this.prop("shadowColor", color) }
    get shadowOffsetX() { return this.prop("shadowOffsetX") }
    set shadowOffsetX(x) { this.prop("shadowOffsetX", x) }
    get shadowOffsetY() { return this.prop("shadowOffsetY") }
    set shadowOffsetY(y) { this.prop("shadowOffsetY", y) }
    get filter() { return this.prop('filter') }
    set filter(str) { this.prop('filter', css.filter(str)) }
}

export default CanvasRenderingContext2D;