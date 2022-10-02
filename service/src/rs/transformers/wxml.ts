import path from 'path';

export default function (code: string, filePath: string): string {
  const name = path.basename(filePath).replace(/\.wxml$/i, '');
  return `
<!DOCTYPE html>
<html style='height:100%; height: 100%;'>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover" />
    <style>
      :root { --devicePixelRatio: 1; }
      html,body {padding: 0; margin: 0;}
      wx-image div { height: 100%; width: 100%; }
    </style>
    <link id="stylesheet-app" rel="stylesheet" href="/app.wxss?t=0" />
    <link id="stylesheet-page" rel="stylesheet" href="./${name}.wxss?t=0" />
    <script>
      window.wxml = unescape('${escape(code)}');
      function autoScale() {
        const ratio = document.documentElement.clientWidth / 750;
        document.documentElement.style.setProperty('--devicePixelRatio', ratio.toString());
      }
      window.addEventListener('resize', autoScale);
      window.addEventListener('load', autoScale);
    </script>
  </head>
  <body style='height:100%; height: 100%'>
    <span style='font-size: 32px; color: gray; display: flex; justify-content: center; align-items: center; height: 100%;'>loading...</span>
  </body>
</html>
  `;
}
