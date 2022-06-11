export const encoding = {
  toTypedArray(buf: Buffer) {
    const view = new Uint8Array(buf.length);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return view;
  },
  toArrayBuffer(buf: Buffer) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  },
  toBuffer(ab: ArrayBuffer) {
    const buf = new Buffer(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
    }
    return buf;
  },
};

export default encoding;
