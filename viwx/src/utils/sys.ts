import fs from 'fs';
import path from 'path';

const chars = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd',
  'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
  'y', 'z'];

export default {
  wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms, true);
    });
  },
  randomString(length: number) {
    let str = '';
    for (let i = 0; i < length; i++) {
      const pos = Math.round(Math.random() * (chars.length - 1));
      str += chars[pos];
    }
    return str;
  },
  rmFiles(dir: string, exipredDays: number) {
    const day = Date.now() - exipredDays * 24 * 3600000;
    fs.readdirSync(dir).forEach((e) => {
      const p = path.join(dir, e);
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        return;
      }
      if (st.mtimeMs < day) {
        fs.unlinkSync(p);
      }
    });
  },
};
