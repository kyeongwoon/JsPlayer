'use strict'
import { createRequire } from 'module';
import { App, Window} from './lib/index.js'
import CircularBuffer from './circular_buffer.js'
import { Worker } from 'worker_threads';

const AV = createRequire(import.meta.url)('./addon/neon_ffmpeg.node')

// Pre-allocate enough buffers for the decoding queue.
const sharedSubtitleBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 8192 * 1024 * 2);
const sharedAudioBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 8192 * 1024 * 16);
const sharedVideoBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 8192 * 1024 * 40);

const video_bufer = new CircularBuffer(sharedVideoBuffer);

let audio_last_pts = 0;
let frame_timer = AV.av_gettime() / 1000000.0; // sec
let frame_last_pts = 0;
let frame_last_delay = 0.01; 

const AV_SYNC_THRESHOLD = 0.01;
const AV_NOSYNC_THRESHOLD = 10.0;

let ratio = 1.0;
let video_image = null;
let [av_width, av_height] = [0, 0];

const media_file = 'your media file path'

//
const decode_thread = new Worker('./decode_thread.js', {
    workerData: {
        path: media_file,
        audio: sharedAudioBuffer,
        video: sharedVideoBuffer,
        subtitle: sharedSubtitleBuffer
    }
});

decode_thread.on('message', (data) => {
    // Information is retrieved when first opened.
    const { width, height, sub_no } = data.info;

    // get video size
    if (width !== 0 && height !== 0) {
        av_height = height;
        av_width = width;
    }
});

const audio_thread = new Worker('./audio_thread.js',{ workerData: { audio: sharedAudioBuffer } });

audio_thread.on('message', (data) => {
    // refresh audio pts
    audio_last_pts = data.pts;
});

const app = new App();
app.run();

function errorlHandler(err) {
    console.error(err, 'Uncaught Exception thrown');
    decode_thread.terminate();
    audio_thread.terminate();
    process.exit(1);
}

function signalHandler() {
    console.log('signal handler')
    decode_thread.terminate();
    audio_thread.terminate();
    process.exit()
}

process.on('uncaughtException', errorlHandler);
process.on('SIGINT', signalHandler)
process.on('SIGTERM', signalHandler)
process.on('SIGQUIT', signalHandler)

const win = Window.open(null, 'JS player', 'resizable,width=800,height=800');

win.addEventListener('resize', e => {
    //console.log("listener resize")
    //console.log([win.innerWidth, win.innerHeight])
})

function draw() {
    const ctx = win.canvas.getContext("2d")
    if (!video_image) {
        if (!av_height || !av_width) return;
        // When the decoder is opened, it is executed only once.
        let [w, h] = [av_width, av_height];
        ratio = h / w;

        if (w > 1440) {
            w = 1440;
            h = (ratio * w) | 0;
        }
        //win.resizeTo(w, h);

        video_image = ctx.createImageData(av_width, av_height);

        // init timer
        frame_timer = AV.av_gettime() / 1000000.0; // sec
        frame_last_delay = 0.01; // 24fps = 0.041, 30fps = 0.03
        audio_last_pts = frame_last_pts; // 0

    }
    let actual_timer = 80;
    const [screen_width, screen_height] = [win.innerWidth, win.innerHeight]

    const data = video_bufer.pop();
    if (data) {
        const [vdata, pts] = data; 
        let delay = pts - frame_last_pts;
        if (delay <= 0 || delay >= 1.0) {
            //if (delay !== 0)
            //    console.log(`error in delay ${delay} -  frame last delay ${frame_last_delay}`)
            
            // if incorrect delay, use previous one 
            delay = frame_last_delay;
        }

        //save for next time
        frame_last_delay = delay;
        frame_last_pts = pts;

        // sync with audio
        const diff = pts - audio_last_pts;
        const sync_threshold = (delay > AV_SYNC_THRESHOLD) ? delay : AV_SYNC_THRESHOLD;
        if (Math.abs(diff) < AV_NOSYNC_THRESHOLD) {
            if (diff <= -sync_threshold) {
                delay = 0;
            } else if (diff >= sync_threshold) {
                delay = 2 * delay;
            }
        }

        // calc next timer
        frame_timer += delay;

        // computer the REAL delay  : micro sec
        let actual_delay = frame_timer - AV.av_gettime() / 1000000.0;
        if (actual_delay < 0.010) {
            /* Really it should skip the picture instead */
            actual_delay = 0.010;
        }
        //console.log(`actual dealy ${actual_delay}`)

        // sec to milliseconds
        actual_timer = (actual_delay * 1000 + 0.5) | 0;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, screen_width, screen_height);

        //	ratio = h / w;
        let movie_width = screen_width;
        let movie_height = screen_width * ratio;

        let letter_box_x = 0, letter_box_y = 0;
        if (movie_height > screen_height) {
            movie_height = screen_height;
            movie_width = screen_height / ratio;
            letter_box_x = (screen_width - movie_width) / 2;
        } else {
            letter_box_y = (screen_height - movie_height) / 2;
        }
        video_image.data = vdata;
        ctx.putImageData(video_image, letter_box_x, letter_box_y, 0, 0, movie_width, movie_height);
        video_image.data = null;

        // TBD: display subtitle
    } 
    setTimeout(() => win.requestAnimationFrame(draw), actual_timer);
}

win.requestAnimationFrame(draw);
