'use strict'
import { RustClass, neon, core } from "./RustClass.js";

class App extends RustClass {
    windows = [];
    constructor() {
        super(App)
        global.app = this;
        this.mainWindow = null;
        this.stamp = Date.now();
    }

    run() {
        const self = this;
        setTimeout(() => self.loop())
    }

    loop() {
        const evs = this.ƒ("pump")
        for (let ev of evs) {
            if (ev.type !== undefined) {
                for (const win of this.windows) {
                    if (win.state.id === ev.windowId) {
                        if (ev.type === 'redraw' && win.callback) {
                            win.callback(win);
                            neon.App.draw(win.state.id);
                        } else if(ev.type === 'exit') {
                            return;
                        } else {
                            const event = new Event(ev.type);
                            if(ev.type === 'resize') {
                                win.resizeTo(ev.width, ev.height)
                            }
                            win.dispatchEvent(event);
                        }
                    }
                }
            }
        }

        // requestAnimationFrame
        for(const win of this.windows) {
            const values = Object.values(win.acb);
            if(values.length) {
                // clear all callbacks
                win.acb = {};
                for(const cb of values) {
                    cb(win);
                }
                neon.App.draw(win.state.id);    
            }
        }

        setTimeout(() => this.loop(), 16.67);
    }

    openWindow(win) {
        if(this.windows.length === 0) {
            this.mainWindow = win;
        }

        const id = neon.App.openWindow(JSON.stringify(win.state), core(win.canvas.pages[win.state.page - 1]))
        win.state.id = id;

        this.windows.push(win)
    }

    closeWindow(win) {
        if(win === this.mainWindow) {
            this.quit();
        } else {
            const index = this.windows.indexOf(win);
            if(index !== -1) {
                this.windows.splice(index, 1);
                neon.App.closeWindow(win.state.id)
            }
        }
    }

    quit() {
        this.ƒ("quit")
        process.exit()
    }
}

export default App;