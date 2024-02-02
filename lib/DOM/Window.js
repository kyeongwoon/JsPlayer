'use strict'
import Canvas from "../Canvas/Canvas.js"
import { v4 } from 'uuid';

class Window extends EventTarget {
    static #kwargs = "left,top,width,height,title,page,background,fullscreen,visible".split(/,/)
    #canvas
    #state

    constructor(title, url, width, height) {
        super();
        global.window = this;
        globalThis.window = this;
        this.acb = {}
        let canvas = new Canvas(width, height)

        this.#state = {
            title,
            visible: true,
            background: "white",
            fullscreen: false,
            page: canvas.pages.length,
            left: undefined,
            top: undefined,
            width,
            height,
            cursor: "default",
            cursorHidden: false,
            fit: "contain",
            id: Math.random().toString(16)
        }
        this.#canvas = canvas;

        Object.assign(this, { canvas }, Object.fromEntries(
            Object.entries({}).filter(([k, v]) => Window.#kwargs.includes(k) && v !== undefined)
        ))

        global.app.openWindow(this)
    }

    static open(url = null, windowName = '_blank', windowFeatures = 'resizable,width=500,height=500') {
        let x, y, w, h;
        let features = windowFeatures.split(',');
        features.forEach(item => {
            let pair = item.split('=');
            if (pair) {
                switch (pair[0]) {
                    case 'left': x = +pair[1] | 0; break;
                    case 'top': y = +pair[1] | 0; break;
                    case 'width': w = +pair[1] | 0; break;
                    case 'height': h = +pair[1] | 0; break;
                }
            }
        });
        const win = new Window(windowName, url, w, h);
        const self = win;
        self.id = 0;

        return win;
    }

    get state() { return this.#state }
    get ctx() { return this.#canvas.pages[this.page - 1] }

    get canvas() { return this.#canvas }
    set canvas(canvas) {
        if (canvas instanceof Canvas) {
            canvas.getContext("2d") // ensure it has at least one page
            this.#canvas = canvas
            this.#state.page = canvas.pages.length
        }
    }
    get innerWidth() { return this.#state.width }
    get innerHeight() { return this.#state.height }

    close() { global.app.closeWindow(this) }

    blur() { }
    maximize() { }
    minimize() { }
    matchMedia() { }
    moveTo(x, y) { }
    moveBy(deltaX, deltaY) { }
    resizeBy(xDelta, yDelta) {
        this.#state.width += xDelta;
        this.#state.height += yDelta;
    }
    resizeTo(width, height) {
        this.#state.width = width;
        this.#state.height = height;
    }
    restore() { }
    sizeToContent() { }
    setCursor(shape) {  // non standard...
        if (shape === "wait") {
        } else {
        }
    }
    setResizable() { }
    scroll() { }
    scrollBy() { }
    scrollByLines(lines) { }
    scrollByPages(pages) { }
    scrollTo() { }
    stop() { }

    requestAnimationFrame(callback) {
        this.callback = callback;
        const id = v4();
        this.acb[id] = callback;
        return id;
    }

    cancelAnimationFrame(id) {
        if (this.acb[requestID]) {
            delete this.acb[requestID];
        }
    }

    queueMicrotask() { }

    // timming functions
    setInterval(f, milliseconds, ...args) { return setInterval(f, milliseconds, ...args); }
    clearInterval(id) { }

    setTimeout(f, milliseconds, ...args) { return setTimeout(f, milliseconds, ...args); }
    clearTimeout(id) { }

    requestIdleCallback(callback, option) { }
    cancelIdleCallback(handle) { }

    setImmediate(func, ...args) { }
    clearImmediate(immediateID) { }
    setImmediate(f, param1, param2) { return setTimeout(f, 1, param1, param2); }

    // event handler function
    onload = null;
    onunload = null;
    onabort = null;
    onerror = null;
    onchange = null;

    onresize = null;
    onpaint = null;
    onclose = null;

    onclick = null;
    ondblclick = null;

    onmousedown = null;
    onmouseup = null;
    onmousemove = null;
    onmouseout = null;
    onmouseover = null;
    onwheel = null;
    onfocus = null;

    onkeydown = null;
    onkeyup = null;
    onkeypress = null;

    onscroll = null;
    onselect = null;

    onsubmit = null;
    onreset = null;
    oninput = null;
}

export default Window;