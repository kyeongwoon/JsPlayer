'use strict'
import { createRequire } from 'module';
import CircularBuffer from './circular_buffer.js'
import { workerData, parentPort } from 'worker_threads';
const AL = createRequire(import.meta.url)('./addon/neon_al.node')

let eof = false;

const STATE_INIT = 0;
const STATE_PREPARE = 1;
const STATE_PLAY = 2;

const audio = {
    // OpenAL
    aDevice: null,
    aContext: null,
    alSource: null,
    a_count: 0,
    state: STATE_INIT
};

const audio_bufer = new CircularBuffer(workerData.audio);

// init media...
void function init() {
    // Open AL
    audio.aDevice = AL.alcOpenDevice();
    audio.aContext = AL.alcCreateContext(audio.aDevice);

    // make active context
    AL.alcMakeContextCurrent(audio.aContext);
    audio.alSource = AL.alGenSources(1);
    AL.alGenBuffers();
    AL.alSourcei(audio.alSource, AL.AL_LOOPING, AL.AL_FALSE);
}();

function play_audio() {
    if (audio_bufer.count < 1) {
        return;
    } else {
        if (audio.state === STATE_INIT) {
            audio.state = STATE_PREPARE;
        } else if (audio.state === STATE_PREPARE) {
            let [ret_buffer, pts] = audio_bufer.pop();

            // Prefill all of the buffers
            const sample_rate = audio_bufer.user_data1;
            if (audio.a_count < 3) {
                AL.alBufferData(audio.a_count, AL.AL_FORMAT_STEREO16, ret_buffer, ret_buffer.byteLength, sample_rate);
                audio.a_count++;
                ret_buffer = null;
                parentPort.postMessage({ pts })

                if (audio.a_count === 3) {
                    audio.state = STATE_PLAY;
                    AL.alSourceQueueBuffers(audio.alSource, 3);
                    AL.alSourcePlay(audio.alSource);
                }
            }
        } else { // STATE_PLAY
            let val = AL.alGetSourcei(audio.alSource, AL.AL_BUFFERS_PROCESSED);
            if (val > 0) {
                while (val--) {
                    const sample_rate = audio_bufer.user_data1;
                    let [ret_buffer, pts] = audio_bufer.pop();
                    AL.alFillData(audio.alSource, ret_buffer, ret_buffer.byteLength, sample_rate);
                    ret_buffer = null;
                    parentPort.postMessage({ pts })
                }
                val = AL.alGetSourcei(audio.alSource, AL.AL_SOURCE_STATE);
                if (val !== AL.AL_PLAYING) {
                    AL.alSourcePlay(audio.alSource);
                }
                //parentPort.postMessage({ pts })
            }
        }
    }
}

(function forever() {
    play_audio();
    setImmediate(forever);
})();