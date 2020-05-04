// eslint-disable-next-line @typescript-eslint/no-unused-vars
window.onerror = function (message, file, line, col, error) {
  const msg = JSON.stringify({ method: 'error', value: message });
  window.postMessage(msg, '*');
};

(function () {
  function _ready() {
    let contents;
    const targetOrigin = '*';
    const sendMessage = function (obj) {
      if (!window.ReactNativeWebView.postMessage) {
        setTimeout(() => {
          sendMessage(obj);
        }, 1);
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      }
    };

    const q = [];
    let _isReady = false;

    let book;
    let rendition;

    let minSpreadWidth = 815;
    let axis = 'horizontal';

    const isChrome = /Chrome/.test(navigator.userAgent);
    const isWebkit = !isChrome && /AppleWebKit/.test(navigator.userAgent);

    // debug
    console.log = function () {
      // eslint-disable-next-line prefer-rest-params
      sendMessage({ method: 'log', value: Array.from(arguments) });
    };

    console.error = function () {
      // eslint-disable-next-line prefer-rest-params
      sendMessage({ method: 'error', value: Array.from(arguments) });
    };

    function onMessage(e) {
      const message = e.data;
      handleMessage(message);
    }

    function handleMessage(message) {
      const decoded =
        typeof message == 'object' ? message : JSON.parse(message);
      let response;
      let result;

      switch (decoded.method) {
        case 'open': {
          const url = decoded.args[0];
          const options = decoded.args.length > 1 && decoded.args[1];
          openEpub(url, options);

          if (options && options.webviewStylesheet) {
            const head = document.getElementsByTagName('head')[0];
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = options.webviewStylesheet;
            head.appendChild(link);
          }

          break;
        }
        case 'display': {
          const args = decoded.args && decoded.args.length && decoded.args[0];
          let target;

          if (!args) {
            target = undefined;
          } else if (args.target) {
            target = args.target.toString();
          } else if (args.spine) {
            target = parseInt(args.spine);
          }

          if (rendition) {
            rendition.display(target);
          } else {
            q.push(message);
          }
          break;
        }
        case 'flow': {
          const direction = decoded.args.length && decoded.args[0];
          axis = direction === 'paginated' ? 'horizontal' : 'vertical';

          if (rendition) {
            rendition.flow(direction);
          } else {
            q.push(message);
          }

          break;
        }
        case 'resize': {
          const width = decoded.args.length && decoded.args[0];
          const height = decoded.args.length > 1 && decoded.args[1];

          if (rendition) {
            rendition.resize(width, height);
          } else {
            q.push(message);
          }

          break;
        }
        case 'setLocations': {
          const locations = decoded.args[0];
          if (book) {
            book.locations.load(locations);
          } else {
            q.push(message);
          }

          if (rendition) {
            rendition.reportLocation();
          }
          break;
        }
        case 'reportLocation': {
          if (rendition) {
            rendition.reportLocation();
          } else {
            q.push(message);
          }
          break;
        }
        case 'minSpreadWidth': {
          minSpreadWidth = decoded.args;
          break;
        }
        case 'mark': {
          if (rendition) {
            // eslint-disable-next-line prefer-spread
            rendition.annotations.mark.apply(
              rendition.annotations,
              decoded.args,
            );
          } else {
            q.push(message);
          }
          break;
        }
        case 'underline': {
          if (rendition) {
            // eslint-disable-next-line prefer-spread
            rendition.annotations.underline.apply(
              rendition.annotations,
              decoded.args,
            );
          } else {
            q.push(message);
          }
          break;
        }
        case 'highlight': {
          if (rendition) {
            // eslint-disable-next-line prefer-spread
            rendition.annotations.highlight.apply(
              rendition.annotations,
              decoded.args,
            );
          } else {
            q.push(message);
          }
          break;
        }
        case 'removeAnnotation': {
          if (rendition) {
            // eslint-disable-next-line prefer-spread
            rendition.annotations.remove.apply(
              rendition.annotations,
              decoded.args,
            );
          } else {
            q.push(message);
          }
          break;
        }
        case 'themes': {
          const themes = decoded.args[0];
          if (rendition) {
            rendition.themes.register(themes);
          } else {
            q.push(message);
          }
          break;
        }
        case 'theme': {
          const theme = decoded.args[0];
          if (rendition) {
            rendition.themes.select(theme);
          } else {
            q.push(message);
          }
          break;
        }
        case 'fontSize': {
          const fontSize = decoded.args[0];
          if (rendition) {
            rendition.themes.fontSize(fontSize);
          } else {
            q.push(message);
          }
          break;
        }
        case 'font': {
          const font = decoded.args[0];
          if (rendition) {
            rendition.themes.font(font);
          } else {
            q.push(message);
          }
          break;
        }
        case 'override': {
          if (rendition) {
            // eslint-disable-next-line prefer-spread
            rendition.themes.override.apply(rendition.themes, decoded.args);
          } else {
            q.push(message);
          }
          break;
        }
        case 'gap': {
          const gap = decoded.args[0];
          if (rendition) {
            rendition.settings.gap = gap;
            if (rendition.manager) {
              rendition.manager.settings.gap = gap;
            }
          } else {
            q.push(message);
          }
          break;
        }
        case 'next': {
          if (rendition) {
            rendition.next();
          } else {
            q.push(message);
          }
          break;
        }
        case 'prev': {
          if (rendition) {
            rendition.prev();
          } else {
            q.push(message);
          }
          break;
        }
      }
    }

    function openEpub(url, options) {
      const settings = Object.assign(
        {
          manager: 'continuous',
          overflow: 'visible',
          method: 'blobUrl',
          fullsize: true,
          snap: isChrome,
        },
        options,
      );
      window.book = book = ePub(url);

      window.rendition = rendition = book.renderTo(document.body, settings);

      rendition.hooks.content.register(
        function (contents, rendition) {
          const doc = contents.document;
          const startPosition = { x: -1, y: -1 };
          const currentPosition = { x: -1, y: -1 };
          const isLongPress = false;
          let longPressTimer;
          const touchduration = 250;
          const $body = doc.getElementsByTagName('body')[0];
          const lastTap = undefined;
          const preventTap = false;
          const doubleTap = false;

          function touchStartHandler(e) {
            let f;
            let target;
            startPosition.x = e.targetTouches[0].pageX;
            startPosition.y = e.targetTouches[0].pageY;
            currentPosition.x = e.targetTouches[0].pageX;
            currentPosition.y = e.targetTouches[0].pageY;
            isLongPress = false;

            if (isWebkit) {
              for (let i = 0; i < e.targetTouches.length; i++) {
                f = e.changedTouches[i].force;
                if (f >= 0.8 && !preventTap) {
                  target = e.changedTouches[i].target;

                  if (target.getAttribute('ref') === 'epubjs-mk') {
                    return;
                  }

                  clearTimeout(longPressTimer);

                  cfi = contents.cfiFromNode(target).toString();

                  sendMessage({
                    method: 'longpress',
                    position: currentPosition,
                    cfi: cfi,
                  });
                  isLongPress = false;
                  preventTap = true;
                }
              }
            }

            const now = Date.now();
            if (lastTap && now - lastTap < touchduration && !doubleTap) {
              let imgSrc = null;
              if (e.changedTouches[0].target.hasAttribute('src')) {
                imgSrc = e.changedTouches[0].target.getAttribute('src');
              }
              doubleTap = true;
              preventTap = true;
              cfi = contents.cfiFromNode(e.changedTouches[0].target).toString();

              sendMessage({
                method: 'dblpress',
                position: currentPosition,
                cfi: cfi,
                imgSrc: imgSrc,
              });
            } else {
              lastTap = now;
            }

            longPressTimer = setTimeout(function () {
              target = e.targetTouches[0].target;

              if (target.getAttribute('ref') === 'epubjs-mk') {
                return;
              }

              cfi = contents.cfiFromNode(target).toString();

              sendMessage({
                method: 'longpress',
                position: currentPosition,
                cfi: cfi,
              });
              preventTap = true;
            }, touchduration);
          }

          function touchMoveHandler(e) {
            currentPosition.x = e.targetTouches[0].pageX;
            currentPosition.y = e.targetTouches[0].pageY;
            clearTimeout(longPressTimer);
          }

          function touchEndHandler(e) {
            let cfi;
            clearTimeout(longPressTimer);

            if (preventTap) {
              preventTap = false;
              return;
            }

            if (
              Math.abs(startPosition.x - currentPosition.x) < 2 &&
              Math.abs(startPosition.y - currentPosition.y) < 2
            ) {
              const target = e.changedTouches[0].target;

              if (
                target.getAttribute('ref') === 'epubjs-mk' ||
                target.getAttribute('ref') === 'epubjs-hl' ||
                target.getAttribute('ref') === 'epubjs-ul'
              ) {
                return;
              }

              cfi = contents.cfiFromNode(target).toString();

              if (isLongPress) {
                sendMessage({
                  method: 'longpress',
                  position: currentPosition,
                  cfi: cfi,
                });
                isLongPress = false;
              } else {
                setTimeout(function () {
                  if (preventTap || doubleTap) {
                    preventTap = false;
                    isLongPress = false;
                    doubleTap = false;
                    return;
                  }
                  sendMessage({
                    method: 'press',
                    position: currentPosition,
                    cfi: cfi,
                  });
                }, touchduration);
              }
            }
          }

          function touchForceHandler(e) {
            const f = e.changedTouches[0].force;
            if (f >= 0.8 && !preventTap) {
              const target = e.changedTouches[0].target;

              if (target.getAttribute('ref') === 'epubjs-mk') {
                return;
              }

              clearTimeout(longPressTimer);

              cfi = contents.cfiFromNode(target).toString();

              sendMessage({
                method: 'longpress',
                position: currentPosition,
                cfi: cfi,
              });
              isLongPress = false;
              preventTap = true;
              doubleTap = false;
            }
          }

          doc.addEventListener('touchstart', touchStartHandler, false);

          doc.addEventListener('touchmove', touchMoveHandler, false);

          doc.addEventListener('touchend', touchEndHandler, false);

          doc.addEventListener('touchforcechange', touchForceHandler, false);
        }.bind(this),
      );

      rendition.on('relocated', function (location) {
        sendMessage({ method: 'relocated', location: location });
      });

      rendition.on('selected', function (cfiRange) {
        sendMessage({ method: 'selected', cfiRange: cfiRange });
      });

      rendition.on('markClicked', function (cfiRange, data) {
        sendMessage({ method: 'markClicked', cfiRange: cfiRange, data: data });
      });

      rendition.on('rendered', function (section) {
        sendMessage({ method: 'rendered', sectionIndex: section.index });
      });

      rendition.on('added', function (section) {
        sendMessage({ method: 'added', sectionIndex: section.index });
      });

      rendition.on('removed', function (section) {
        sendMessage({ method: 'removed', sectionIndex: section.index });
      });

      rendition.on('resized', function (size) {
        sendMessage({ method: 'resized', size: size });
      });

      // replay messages
      rendition.started.then(function () {
        let msg;
        for (let i = 0; i < q.length; i++) {
          msg = q.shift();
          handleMessage(msg);
        }
      });

      book.ready.then(function () {
        _isReady = true;

        sendMessage({ method: 'ready' });
      });

      window.addEventListener('unload', function () {
        book && book.destroy();
      });
    }

    window.addEventListener('message', onMessage);
    // React native uses document for postMessages
    document.addEventListener('message', onMessage);

    sendMessage({ method: 'loaded', value: true });
  }

  if (document.readyState === 'complete') {
    _ready();
  } else {
    window.addEventListener('load', _ready, false);
  }
})();

// Object.assign polyfill -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, 'assign', {
    value: function assign(target, varArgs) {
      // .length of function is 2
      'use strict';
      if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      const to = Object(target);

      for (let index = 1; index < arguments.length; index++) {
        // eslint-disable-next-line prefer-rest-params
        const nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) {
          for (const nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true,
  });
}
