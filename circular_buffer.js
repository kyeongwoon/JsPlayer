'use strict'

// buffer read cursor, write cursor
class CircularBuffer {
    start_pos = 16;
    chunk_header_size = 4;
    constructor(buf) {
        this.buf = buf; //SharedArrayBuffer
        this.array = new Uint8Array(buf); // create view
        this.array32 = new Uint32Array(buf);
        this.length = buf.byteLength;
        this.write_ofs = this.start_pos;
        this.read_ofs = this.start_pos;
        this.count = 0;
        // in audio file
            // frame_rate : user data1
        // in video file
            // width : user data 1
            // height : user data 2
    }
    get user_data1() { return  Atomics.load(this.array32, 3);}
    set user_data1(v) {Atomics.store(this.array32, 3, v);}
    get count() {return Atomics.load(this.array32, 2);}
    set count(v) {Atomics.store(this.array32, 2, v);}
    get write_ofs() {return Atomics.load(this.array32, 1);}
    set write_ofs(v) {Atomics.store(this.array32, 1, v);}
    get read_ofs() {return Atomics.load(this.array32, 0);}
    set read_ofs(v) { Atomics.store(this.array32, 0, v)}

    init() {
        this.count = 0;
        this.start_pos = 16;
        this.read_ofs = this.start_pos;
        this.write_ofs = this.start_pos;
    }

    push(src, len, user_data = 0.0) {
        if(len === 0) {
            console.error('push len is 0')
            return;
        }
        this.count++;
        // extra 12 = len(4 - 32bit) + userdata(8 - 64 bit)
        const total = this.write_ofs + 12 + len;
        // write len
        if(total > this.length) {
            // write zero length for recycling
            console.log('recycle occurs.... ' + total + ' > ' + this.length);
            Buffer.from(this.array.buffer, this.write_ofs, 4).writeUInt32LE(0);
            this.write_ofs = this.start_pos;
        }
        Buffer.from(this.array.buffer, this.write_ofs, 4).writeUInt32LE(len);
        this.write_ofs += 4;

        Buffer.from(this.array.buffer, this.write_ofs, 8).writeDoubleLE(user_data);
        this.write_ofs += 8;

        src.copy(this.array, this.write_ofs, 0, len);
        this.write_ofs += len;
    }
    peek(len) {
        // extra 12 = len(4 - 32bit) + userdata(8 - 64 bit)
        const total = this.write_ofs + 12 + len;
        // write len
        if(total > this.length) {
            // write zero length for recycling
            console.log('recycle occurs.... ' + total + ' > ' + this.length);
            Buffer.from(this.array.buffer, this.write_ofs, 4).writeUInt32LE(0);
            this.write_ofs = this.start_pos;
        }
        const peek_ofs = this.write_ofs + 12;
        const buffer = Buffer.from(this.array.buffer, peek_ofs, len);
        return buffer;
    }

    pop() {
        if(this.count === 0) {
            return null;
        }
        this.count--;
        let len = Buffer.from(this.array.buffer, this.read_ofs, 4).readUInt32LE();
        if(len === 0) { // if zero len, means recycle
            this.read_ofs = this.start_pos;
            len = Buffer.from(this.array.buffer, this.read_ofs, 4).readUInt32LE();
        }
        this.read_ofs += 4;
        const user_data = Buffer.from(this.array.buffer, this.read_ofs, 8).readDoubleLE();
        this.read_ofs += 8;

        if(len === 0) {
            console.error(`len is ${len}`)
        }

        // share memory...
        const buffer = Buffer.from(this.buf, this.read_ofs, len);
        this.read_ofs += len;
        return [buffer, user_data];
    }
};

export default CircularBuffer;