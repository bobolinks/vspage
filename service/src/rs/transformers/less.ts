import fs from 'fs';
import path from 'path';
import less from 'less';
import css from './css';

export default async function (filePath: string, rooPath: string, scoped: string | undefined): Promise<string> {
  const src = fs.readFileSync(filePath, 'utf-8');
  const out = await less.render(src, {
    paths: [path.dirname(filePath)],
    rootpath: rooPath,
  });
  return css(out.css, scoped);
}
