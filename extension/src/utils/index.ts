import fs from 'fs';
import path from 'path';
import css from './css';
import html from './html';

export default {
  jsonFromFile(file: string) {
    if (!fs.existsSync(file)) {
      return undefined;
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  },
  jsonToFile(obj: any, file: string) {
    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf-8');
  },
  css,
  html,
  path: {
    compatible(fp: string) {
      return fp.replace(/^[\\/]([a-z]+:)/i, '$1').replace(/\\/g, '/');
    },
    relative(f1: string, f2: string) {
      return path.relative(f1, f2).replace(/^[\\/]([a-z]+:)/i, '$1')
        .replace(/\\/g, '/');
    },
  },
  /**
   * @param {string} s
   * @param {string} p
   * @return {boolean}
   */
  isMatched(s: string, p: string): boolean {
    // 构造 dp 函数
    const dp = [];
    for (let i = 0; i <= s.length; i++) {
      const child = [];
      for (let j = 0; j <= p.length; j++) {
        child.push(false);
      }
      dp.push(child);
    }
    dp[s.length][p.length] = true;
    // 执行
    for (let i = p.length - 1; i >= 0; i--) {
      if (p[i] !== '*') break;
      else dp[s.length][i] = true;
    }

    for (let i = s.length - 1; i >= 0; i--) {
      for (let j = p.length - 1; j >= 0; j--) {
        if (s[i] === p[j] || p[j] === '?') {
          dp[i][j] = dp[i + 1][j + 1];
        } else if (p[j] === '*') {
          dp[i][j] = dp[i + 1][j] || dp[i][j + 1];
        } else {
          dp[i][j] = false;
        }
      }
    }
    return dp[0][0];
  },
  isMatchedVx(s: string, ps: Array<string>): boolean {
    for (const iterator of ps) {
      if (this.isMatched(s, iterator)) {
        return true;
      }
    }
    return false;
  },
};
