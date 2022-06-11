import path from 'path';
import sass from 'sass';
import css from './css';

export default function (filePath: string, rooPath: string, scoped: string | undefined): string {
  const out = sass.renderSync({
    file: filePath,
    includePaths: [path.dirname(filePath), rooPath],
  });
  return css(out.css.toString(), scoped);
}
