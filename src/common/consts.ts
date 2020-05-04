export const NEXUS7_HEIGHT = 960;
export const NEXUS7_WIDTH = 600;

export const IPHONE11_HEIGHT = 896;
export const IPHONE11_WIDTH = 414;

export const EMBEDDED_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover">
  <title>epubjs</title>
  <script>${process.env.POLYFILL}</script>
  <script>${process.env.EPUBJS}</script>
  <script>${process.env.BRIDGE}</script>
  <style>
    body {
      margin: 0;
      -webkit-tap-highlight-color: rgba(0,0,0,0);
      -webkit-tap-highlight-color: transparent; /* For some Androids */
    }

    /* For iPhone X Notch */
    @media only screen
      and (min-device-width : 375px)
      and (max-device-width : 812px)
      and (-webkit-device-pixel-ratio : 3) {
      body {
        padding-top: calc(env(safe-area-inset-top) / 2);
      }
    }
  </style>
</head><body></body></html>
`;
