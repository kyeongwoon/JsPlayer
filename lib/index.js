"use strict"

import App from './App.js'
import CanvasRenderingContext2D from './Canvas/CanvasRenderingContext2D.js';
import CanvasGradient from './Canvas/CanvasGradient.js';
import CanvasPattern from './Canvas/CanvasPattern.js';
import CanvasTexture from './Canvas/CanvasTexture.js';
import Canvas from './Canvas/Canvas.js';
import Path2D from './Canvas/Path2D.js'
import ImageData from './Canvas/ImageData.js';
import Image from './Canvas/Image.js';
import TextMetrics from './Canvas/TextMetrics.js';
import Window from './DOM/Window.js';
import { fileURLToPath } from "url";

global.__dirname = fileURLToPath(new URL(".", import.meta.url));
global.__filename = fileURLToPath(import.meta.url);

const loadImage = src => Object.assign(new Image(), { src }).decode()
export {
  Canvas, CanvasGradient, CanvasPattern, CanvasRenderingContext2D, CanvasTexture,
  TextMetrics, Image, ImageData, Path2D, loadImage,
  App, Window,
}
