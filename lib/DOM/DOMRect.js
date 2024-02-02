'use strict'
// @info
//   DOMRect polyfill
// @src
//   https://drafts.fxtf.org/geometry/#DOMRect
//   https://github.com/chromium/chromium/blob/master/third_party/blink/renderer/core/geometry/dom_rect_read_only.cc

class DOMRect {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        if (!(this instanceof DOMRect)) return new DOMRect(x, y, width, height);

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static fromRect(otherRect) {
        return new DOMRect(otherRect.x, otherRect.y, otherRect.width, otherRect.height);
    }

    get top() {
        if(this.height < 0) return this.y + this.height;
        return this.y;
    }

    get left() {
        if(this.width < 0) return this.x + this.width;
        return this.x;
    }

    get right() {
        if(this.width < 0) return this.x;
        return this.x + this.width;
    }

    get bottom() {
        if(this.height < 0) return this.y;
        return this.y + this.height;
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            top: this.top,
            left: this.left,
            right: this.right,
            bottom: this.bottom
        };
    }
}

for (let propertyName of ["top", "right", "bottom", "left"]) {
    let propertyDescriptor = Object.getOwnPropertyDescriptor(DOMRect.prototype, propertyName);
    propertyDescriptor.enumerable = true;
    Object.defineProperty(DOMRect.prototype, propertyName, propertyDescriptor);
}

export default DOMRect;