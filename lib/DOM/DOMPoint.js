'use strict'
// @info
//   DOMPoint polyfill
// @src
//   https://drafts.fxtf.org/geometry/#DOMPoint
//   https://github.com/chromium/chromium/blob/master/third_party/blink/renderer/core/geometry/dom_point_read_only.cc
class DOMPoint {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static fromPoint(otherPoint) {
        return new DOMPoint(
            otherPoint.x,
            otherPoint.y,
            otherPoint.z !== undefined ? otherPoint.z : 0,
            otherPoint.w !== undefined ? otherPoint.w : 1
        );
    }

    matrixTransform(matrix) {
        if (
            (matrix.is2D || matrix instanceof SVGMatrix) &&
            this.z === 0 &&
            this.w === 1
        ) {
            return new DOMPoint(
                this.x * matrix.a + this.y * matrix.c + matrix.e,
                this.x * matrix.b + this.y * matrix.d + matrix.f,
                0, 1
            );
        }
        else {
            return new DOMPoint(
                this.x * matrix.m11 + this.y * matrix.m21 + this.z * matrix.m31 + this.w * matrix.m41,
                this.x * matrix.m12 + this.y * matrix.m22 + this.z * matrix.m32 + this.w * matrix.m42,
                this.x * matrix.m13 + this.y * matrix.m23 + this.z * matrix.m33 + this.w * matrix.m43,
                this.x * matrix.m14 + this.y * matrix.m24 + this.z * matrix.m34 + this.w * matrix.m44
            );
        }
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            w: this.w
        };
    }
}

export default DOMPoint;
