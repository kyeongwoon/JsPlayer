'use strict';

import { createRequire } from 'module';
import { workerData, parentPort } from 'worker_threads';
import CircularBuffer from './circular_buffer.js'
const AV = createRequire(import.meta.url)('./addon/neon_ffmpeg.node')

const media = {
    eof: false,
    path: '',
    ic: null,
    audio_no: -1,
    video_no: -1,
    sub_no: -1,
    audioCtx: null,
    videoCtx: null,
    subCtx: null,
    codec_timebase: 0, // 1/24
    video_clock: 0, // 비디오 디코딩을 위한 클럭, pts 계산에 사용
};

const MEDIA_VIDEO = 0;
const MEDIA_AUDIO = 1;
const MEDIA_SUBTITLE = 2;


let start_flag = false;
const audio_bufer = new CircularBuffer(workerData.audio);
const video_bufer = new CircularBuffer(workerData.video);
const subs_bufer = new CircularBuffer(workerData.subtitle);
let [ww, hh] = [0, 0];

// init media...
void function init() {
    const path = workerData.path;

    media.path = path;

    media.ic = AV.avformat_open_input(path);
    const info = AV.av_dump_format(media.ic, path);
    console.log(info);
    AV.avformat_find_stream_info(media.ic);

    media.video_no = AV.av_find_best_stream(media.ic, AV.AVMEDIA_TYPE_VIDEO);
    media.audio_no = AV.av_find_best_stream(media.ic, AV.AVMEDIA_TYPE_AUDIO);
    media.sub_no = AV.av_find_best_stream(media.ic, AV.AVMEDIA_TYPE_SUBTITLE);

    //console.log([media.video_no, media.audio_no, media.sub_no])
    if (media.video_no !== -1) {
        media.sub_no = AV.av_find_best_stream(media.ic, AV.AVMEDIA_TYPE_SUBTITLE);
        media.videoCtx = AV.avcodec_open(media.ic, media.video_no);
    } else {
        console.log('no video ')
        media.videoCtx = null;
    }

    if (media.sub_no !== -1) {
        media.subCtx = AV.avcodec_open(media.ic, media.sub_no);
    } else {
        console.log('no sub ')
        media.subCtx = null;
    }

    if (media.audio_no !== -1) {
        media.audioCtx = AV.avcodec_open(media.ic, media.audio_no);
        AV.avcodec_resampler(media.audioCtx);

        const sample_rate = AV.avcodec_sample_rate(media.audioCtx);
        audio_bufer.user_data1 = sample_rate;
    } else {
        media.audioCtx = null;
    }

    if (media.video_no !== -1) {
        //[ww, hh] = AV.avcodec_dimension(media.videoCtx);
        [ww, hh] = AV.avcodec_dimension(media.ic, media.video_no);
        info.width = ww;
        info.height = hh;
        info.sub_no = media.sub_no;

        //console.log(`video info  ${info.width} x ${info.height}`)
        parentPort.postMessage({ info });

    } else {
        info.width = 0;
        info.height = 0;
        info.sub_no = media.sub_no;
        parentPort.postMessage({ info });
    }
    //console.log('decoder init')
}();

const AV_TIME_BASE = 1000000;

// 검색용 변수...
let video_clock = 0;
let seek_incr = 0;
let seek_req = false;
let play_flag = 0;

function typeOf(obj) {
    return Object.getPrototypeOf(obj).constructor;
}

function decode_media(media) {
    if (start_flag === false) {
        start_flag = true;
    }
    if (play_flag !== 0) {
        if (play_flag === 1) {
            // play => pause
            audio_bufer.init();
            video_bufer.init();
            subs_bufer.init();
            return;
        } else {
            // pause => play
            play_flag = 0;
        }
    }
    if (seek_req && !media.eof) {
        let seek_pos = video_clock;
        seek_pos += seek_incr;

        let stream_index = -1;
        if (media.video_no !== -1)
            stream_index = media.video_no;
        else
            stream_index = media.audio_no;

        let seek_target = seek_pos * AV_TIME_BASE;

        if (AV.av_seek_frame(media.ic, stream_index, seek_target, (seek_incr < 0) ? AV.AVSEEK_FLAG_BACKWARD : 0) >= 0) {
            // flush que....
            audio_bufer.init();
            video_bufer.init();
            subs_bufer.init();
            console.log('===> OK')
        }
        seek_req = false;
    }
    if (!media.eof && (video_bufer.count < 64 && audio_bufer.count < 4096)) {
        let buf = video_bufer.peek(Math.max(1024 * 1024 * 4, ww*hh*4));
        const ret = AV.avcodec_decode(media.ic, media.videoCtx, media.video_no,
            media.audioCtx, media.audio_no, media.subCtx, media.sub_no, buf);
        if (ret.error !== undefined) {
            console.log('avcoder decode return null.....')
            media.eof = true;
            return;
        }
        let { pts, type, len } = ret;
        if (ret.type === MEDIA_VIDEO) {
            const buffer = buf.subarray(0, len);
            // pts is sec
            if (pts === 0) {
                // if we have pts, set video clock to it
                pts = media.video_clock;
            } else {
                // if we aren't given a pts, set it to the clock
                media.video_clock = pts;
            }
            // update the video clock
            {
                media.codec_timebase = AV.avcodec_timebase(media.videoCtx);
                let frame_delay = media.codec_timebase; // 1/24
                //if we are repeating a frame, adjust clock accordingly
                frame_delay += ret.repeat_pict * (frame_delay * 0.5);
                media.video_clock += frame_delay;
            }
            // save pts with buffer
            video_bufer.push(buffer, buffer.length, pts);
        } else if (ret.type === MEDIA_AUDIO) {
            const buffer = buf.subarray(0, len);
            audio_bufer.push(buffer, buffer.length, pts);
        } else if (ret.type === MEDIA_SUBTITLE) {
            let buf1 = Buffer.from(ret.text);
            subs_bufer.push(buf1, buf1.length, pts);
            buf1 = null;
        }
    } else AV.av_usleep(10);
}

parentPort.on('message', (message) => {
    video_clock = message.clock;
    switch (message.key) {
        case 'left':
            seek_incr = -10;
            break;
        case 'right':
            seek_incr = 10;
            break;
        case 'up':
            seek_incr = -60;
            break;
        case 'down':
            seek_incr = 60;
            break;
        case 'space':
            play_flag++;
            return;
    }
    seek_req = true;
});

(function forever() {
    if (media.eof === true) {
        // clean media....
        AV.avcodec_close(media.audioCtx);
        if (media.videoCtx !== null)
            AV.avcodec_close(media.videoCtx);
        if (media.subCtx !== null)
            AV.avcodec_close(media.subCtx);

        AV.avformat_close_input(media.ic);
        return;
    }
    decode_media(media);
    setImmediate(forever);
})();
