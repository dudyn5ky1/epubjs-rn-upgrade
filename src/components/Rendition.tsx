import type { Location } from 'epubjs/types/rendition';
import EventEmitter from 'event-emitter';
import React, { Component, createRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import type {
  WebViewErrorEvent,
  WebViewMessageEvent,
} from 'react-native-webview/lib/WebViewTypes';

import { EMBEDDED_HTML } from '../common/consts';
import type { ReaderScreenNavigationProp } from '../navigation/types';
import type { Flow, WebviewMessages } from '../types';

export type { Flow, WebviewMessages };

interface Props {
  beforeViewRemoved?: (sectionIndex: number) => void;
  display?: any;
  flow: Flow;
  font?: string;
  fontSize?: number;
  gap: number;
  height?: number;
  minSpreadWidth: number;
  navigation: ReaderScreenNavigationProp;
  onDblPress?: (cfi: any, position: any, imgSrc: any) => void;
  onDisplayed?: () => void;
  onError?: (error: any) => void;
  onLongPress?: (cfi: any) => void;
  onMarkClicked?: (cfiRange: any, data: any) => void;
  onPress?: (cfi: any, position: any) => void;
  onRelocated?: (location: Location) => void;
  onSelected?: (cfiRange: any) => void;
  onViewAdded?: (sectionIndex: number) => void;
  renderError?: (
    errorDomain: string | undefined,
    errorCode: number,
    errorDesc: string,
  ) => React.ReactElement;
  renderLoading?: () => React.ReactElement;
  resizeOnOrientationChange?: boolean;
  script?: string;
  style?: StyleProp<ViewStyle>;
  stylesheet?: string;
  theme?: any;
  themes?: any;
  url: string;
  webviewContainerStyle?: StyleProp<ViewStyle>;
  webviewStyle?: StyleProp<ViewStyle>;
  webviewStylesheet?: string;
  width?: number;
}

class Rendition extends Component<Props> {
  _webviewRef: React.RefObject<WebView>;
  _isWebviewLoaded: boolean;
  _isReady: boolean;
  _isMounted: boolean;
  locations: any;
  static defaultProps: Partial<Props> = {
    flow: 'paginated',
    gap: 5,
    minSpreadWidth: 815,
    style: {},
    webviewContainerStyle: {},
    webviewStyle: {},
  };
  constructor(props: Props) {
    super(props);
    this._isMounted = false;
    this._isReady = false;
    this._isWebviewLoaded = false;
    this._webviewRef = createRef();

    this.destroy.bind(this);
    this.display.bind(this);
    this.flow.bind(this);
    this.font.bind(this);
    this.fontSize.bind(this);
    this.gap.bind(this);
    this.generateInjectedJSFunction.bind(this);
    this.highlight.bind(this);
    this.load.bind(this);
    this.mark.bind(this);
    this.next.bind(this);
    // this.onMessageFromWebview.bind(this);
    this.override.bind(this);
    this.prev.bind(this);
    this.reportLocation.bind(this);
    this.resize.bind(this);
    this.sendMessageToWebview.bind(this);
    this.setLocations.bind(this);
    this.theme.bind(this);
    this.themes.bind(this);
    this.underline.bind(this);
    this.unhighlight.bind(this);
    this.unmark.bind(this);
    this.ununderline.bind(this);
  }
  componentDidMount() {
    this._isMounted = true;
    if (!this.props.url) {
      return;
    }
    this.load(this.props.url);
  }
  componentDidUpdate(prevProps: Props) {
    if (prevProps.url !== this.props.url) {
      this.load(this.props.url);
    }
    if (prevProps.display !== this.props.display) {
      this.display(this.props.display);
    }
    // if (prevProps.orientation !== this.props.orientation) {
    //   // this.setState({ loaded: false });
    // }
    if (prevProps.flow !== this.props.flow) {
      this.flow(this.props.flow);
    }
    if (prevProps.font !== this.props.font) {
      this.font(this.props.font);
    }
    if (prevProps.fontSize !== this.props.fontSize) {
      this.fontSize(this.props.fontSize);
    }
    if (prevProps.themes !== this.props.theme) {
      this.theme(this.props.theme);
    }
    if (prevProps.themes !== this.props.themes) {
      this.themes(this.props.themes);
    }
    if (
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height
    ) {
      this.resize(this.props.width, this.props.height);
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
    this.destroy();
  }
  destroy() {
    console.log('Rendition.destroyed');
  }
  display(target?: any) {
    if (!this._isWebviewLoaded) {
      return;
    }
    const spine = typeof target === 'number' && target;
    console.log('Rendition.display', spine, target);
    if (spine) {
      this.sendMessageToWebview('display', [{ spine }]);
    } else if (target) {
      this.sendMessageToWebview('display', [{ target }]);
    } else {
      this.sendMessageToWebview('display');
    }
  }
  flow(f: Flow) {
    this.sendMessageToWebview('flow', [f]);
  }
  font(f: any) {
    this.sendMessageToWebview('font', [f]);
  }
  fontSize(f: any) {
    this.sendMessageToWebview('fontSize', [f]);
  }
  gap(gap: number) {
    this.sendMessageToWebview('gap', [gap]);
  }
  generateInjectedJSFunction(data: any) {
    return `(function() {
      document.dispatchEvent(new MessageEvent('message', {data: '${JSON.stringify(
        data,
      )}'}));
      window.dispatchEvent(new MessageEvent('message', {data: '${JSON.stringify(
        data,
      )}'}));
      setTimeout(() => {
        // window.ReactNativeWebView &&
        //   window.ReactNativeWebView.postMessage(
        //     '${JSON.stringify(data)}', '*'
        //   );
        window.postMessage('${JSON.stringify(data)}', '*')
      }, 100);
    })();
    true;
    `;
  }
  highlight(cfiRange: any, data: any, cb: any, className: any, style: any) {
    this.sendMessageToWebview('highlight', [
      cfiRange,
      data,
      cb,
      className,
      style,
    ]);
  }
  load(bookUrl: string) {
    if (!this._isWebviewLoaded) {
      return;
    }
    const config: Pick<
      Props,
      | 'flow'
      | 'gap'
      | 'height'
      | 'minSpreadWidth'
      | 'resizeOnOrientationChange'
      | 'script'
      | 'stylesheet'
      | 'webviewStylesheet'
      | 'width'
    > & {
      fullsize: boolean;
    } = {
      flow: this.props.flow,
      fullsize: true,
      gap: this.props.gap,
      minSpreadWidth: this.props.minSpreadWidth,
    };
    this.props.height && (config.height = this.props.height);
    this.props.resizeOnOrientationChange &&
      (config.resizeOnOrientationChange = this.props.resizeOnOrientationChange);
    this.props.script && (config.script = this.props.script);
    this.props.stylesheet && (config.stylesheet = this.props.stylesheet);
    this.props.webviewStylesheet &&
      (config.webviewStylesheet = this.props.webviewStylesheet);
    this.props.width && (config.width = this.props.width);

    console.log('Rendition.load');
    this.sendMessageToWebview('open', [bookUrl, config]);
    console.log('Rendition.load - open webview');
    this.display(this.props.display);
    console.log('Rendition.load - display');

    this.props.font && this.font(this.props.font);
    this.props.fontSize && this.fontSize(this.props.fontSize);
    this.props.theme && this.themes(this.props.theme);
    this.props.themes && this.themes(this.props.themes);
  }
  mark(cfiRange: any, data: any) {
    this.sendMessageToWebview('mark', [cfiRange, data]);
  }
  next() {
    this.sendMessageToWebview('next');
  }
  onMessageFromWebview = (e: WebViewMessageEvent) => {
    const msg = e.nativeEvent.data;
    const decodedMsg: WebviewMessages =
      typeof msg === 'string' ? JSON.parse(msg) : msg;
    if (decodedMsg.method === 'log') {
      console.log(decodedMsg.value);
      return;
    }
    if (decodedMsg.method === 'error') {
      if (this.props.onError) {
        this.props.onError(decodedMsg.value);
      } else {
        console.error(decodedMsg.value);
      }
      return;
    }
    if (decodedMsg.method === 'loaded') {
      // HANDLED THIS CASE WITH onLoadEnd prop in WebView
      return;
    }
    if (decodedMsg.method === 'rendered') {
      // HANDLED THIS CASE WITH renderLoading prop in WebView
      return;
    }
    if (decodedMsg.method === 'relocated') {
      this.props.onRelocated && this.props.onRelocated?.(decodedMsg.location);
      return;
    }
    if (decodedMsg.method === 'resized') {
      const { height, width } = decodedMsg.size;
      console.log(`resized - height: ${height}, width: ${width}`);
      return;
    }
    if (decodedMsg.method === 'press') {
      this.props.onPress &&
        this.props.onPress?.(decodedMsg.cfi, decodedMsg.position);
      return;
    }
    if (decodedMsg.method === 'longpress') {
      this.props.onLongPress && this.props.onLongPress?.(decodedMsg.cfi);
      return;
    }
    if (decodedMsg.method === 'dblpress') {
      this.props.onDblPress &&
        this.props.onDblPress?.(
          decodedMsg.cfi,
          decodedMsg.position,
          decodedMsg.imgSrc,
        );
      return;
    }
    if (decodedMsg.method === 'selected') {
      this.props.onSelected && this.props.onSelected?.(decodedMsg.cfiRange);
      return;
    }
    if (decodedMsg.method === 'markClicked') {
      this.props.onMarkClicked &&
        this.props.onMarkClicked?.(decodedMsg.cfiRange, decodedMsg.data);
      return;
    }
    if (decodedMsg.method === 'added') {
      this.props.onViewAdded &&
        this.props.onViewAdded?.(decodedMsg.sectionIndex);
      return;
    }
    if (decodedMsg.method === 'removed') {
      this.props.beforeViewRemoved &&
        this.props.beforeViewRemoved?.(decodedMsg.sectionIndex);
      return;
    }
    if (decodedMsg.method === 'ready') {
      this._isReady = true;
      if (this.locations) {
        this.sendMessageToWebview('setLocations', [this.locations]);
      }
      this.props.onDisplayed && this.props.onDisplayed?.();
      return;
    }
    return console.log('msg', decodedMsg);
  };
  override(name: string, value: any, priority: any) {
    this.sendMessageToWebview('override', [name, value, priority]);
  }
  prev() {
    this.sendMessageToWebview('prev');
  }
  reportLocation() {
    if (!this._isReady) {
      return;
    }
    this.sendMessageToWebview('reportLocation');
  }
  resize(w?: number, h?: number) {
    if (!w || !h) {
      return;
    }
    this.sendMessageToWebview('resize', [w, h]);
  }
  sendMessageToWebview(method: string, args?: any[], promiseId?: string) {
    const params = {
      method,
      args,
      promise: promiseId,
    };
    this._webviewRef.current?.injectJavaScript(
      this.generateInjectedJSFunction(params),
    );
  }
  setLocations(locations: any) {
    this.locations = locations;
    if (!this._isReady) {
      return;
    }
    this.sendMessageToWebview('setLocations', [this.locations]);
  }
  theme(t: string) {
    this.sendMessageToWebview('theme', [t]);
  }
  themes(t: string) {
    this.sendMessageToWebview('themes', [t]);
  }
  underline(cfiRange: any, data: any) {
    this.sendMessageToWebview('underline', [cfiRange, data]);
  }
  unhighlight(cfiRange: any) {
    this.sendMessageToWebview('removeAnnotation', [cfiRange, 'highlight']);
  }
  unmark(cfiRange: any) {
    this.sendMessageToWebview('removeAnnotation', [cfiRange, 'mark']);
  }
  ununderline(cfiRange: any) {
    this.sendMessageToWebview('removeAnnotation', [cfiRange, 'underline']);
  }
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <WebView
          ref={this._webviewRef}
          source={{ html: EMBEDDED_HTML, baseUrl: this.props.url }}
          containerStyle={[
            styles.webviewContainer,
            this.props.webviewContainerStyle,
          ]}
          javaScriptEnabled={true}
          scalesPageToFit={false}
          onError={this.props.onError}
          onLoadEnd={(e) => {
            if ((e as WebViewErrorEvent).nativeEvent.code) {
              // ERROR;
              console.warn(
                `Rendition.onLoadEnd - code: ${
                  (e as WebViewErrorEvent).nativeEvent.code
                }, description: ${(e as WebViewErrorEvent).nativeEvent}`,
              );
            } else {
              // LOAD;
              this._isWebviewLoaded = true;
              if (!this.props.url) {
                return;
              }
              this.load(this.props.url);
            }
          }}
          onMessage={this.onMessageFromWebview}
          originWhitelist={['*']}
          overScrollMode="never"
          pagingEnabled={true}
          renderError={this.props.renderError}
          renderLoading={this.props.renderLoading}
          startInLoadingState={true}
          style={[styles.webview, this.props.webviewStyle]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  webviewContainer: {
    flex: 0,
    alignSelf: 'stretch',
    height: '100%',
    width: '100%',
  },
  webview: {},
});

EventEmitter(Rendition.prototype);

export default Rendition;
