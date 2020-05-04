import AsyncStorage from '@react-native-community/async-storage';
import ePub, { Book, EpubCFI, Layout } from 'epubjs';
import type { default as Locations } from 'epubjs/types/locations';
import type { Location } from 'epubjs/types/rendition';
import type { NavItem } from 'epubjs/types/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Dimensions } from 'react-native';
import type { AppStateStatus, StyleProp, ViewStyle } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import Rendition from './Rendition';
import type { Flow } from './Rendition';

if (!(global as any).Blob) {
  (global as any).Blob = RNFetchBlob.polyfill.Blob;
}

(global as any).JSZip = (global as any).JSZip || require('jszip');

(global as any).URL = require('epubjs/libs/url/url-polyfill.js');

if (!(global as any).btoa) {
  (global as any).btoa = require('base-64').encode;
}

const core = require('epubjs/lib/utils/core');
const Path = require('epubjs/lib/utils/path');
const Uri = require('epubjs/lib/utils/url');

interface Props {
  base64?: any;
  backgroundColor?: string;
  beforeViewRemoved?: (sectionIndex: number) => void;
  color?: string;
  flow?: Flow;
  font?: string;
  fontSize?: number;
  gap?: number;
  generateLocations?: boolean;
  height?: number;
  javascript?: any;
  location?: any;
  locationsCharBreak?: number;
  minSpreadWidth?: number;
  onDblPress?: (cfi: any, position: any, imgSrc: any) => void;
  onDisplayed?: () => void;
  onError?: (error: any) => void;
  onLocationChange?: (location: Location) => void;
  onLocationsReady?: (locations: Locations) => void;
  onLongPress?: (cfi: any) => void;
  onMarkClicked?: (cfiRange: any, data: any) => void;
  onNavigationReady?: (toc: NavItem[]) => void;
  onPress?: (cfi: any, position: any) => void;
  onReady?: (book: Book) => void;
  onRelocated?: (location: Location) => void;
  onSelected?: (cfiRange: any) => void;
  onViewAdded?: (sectionIndex: number) => void;
  orientation?: any;
  origin?: any;
  regenerateLocations?: boolean;
  renderError?: (
    errorDomain: string | undefined,
    errorCode: number,
    errorDesc: string,
  ) => React.ReactElement;
  renderLoading?: () => React.ReactElement;
  resizeOnOrientationChange?: boolean;
  script?: string;
  size?: any;
  src?: any;
  style?: StyleProp<ViewStyle>;
  stylesheet?: string;
  theme?: any;
  themes?: any;
  webviewContainerStyle?: StyleProp<ViewStyle>;
  webviewStyle?: StyleProp<ViewStyle>;
  webviewStylesheet?: string;
  width?: number;
}

const window = Dimensions.get('window');

const Epub: React.FC<Props> = (props) => {
  const renditionRef = useRef<Rendition>(null);
  const activeRef = useRef<boolean>(true);
  const bookRef = useRef<Book>();
  const isMountedRef = useRef<boolean>(true);
  const needsOpenRef = useRef<[string, boolean?]>();
  const [, setToc] = useState<NavItem[]>([]);
  const destroy = () => {
    if (!bookRef.current) {
      return;
    }
    bookRef.current.destroy();
  };
  const loadBook = (bookUrl: string) => {
    bookRef.current = ePub({
      replacements: props.base64 || 'none',
    });
    return openBook(bookUrl);
  };
  const loadLocations = async () => {
    if (!bookRef.current) {
      return;
    }
    try {
      await bookRef.current.ready;
      const key = bookRef.current.key() + '-locations';
      const stored = await AsyncStorage.getItem(key);
      if (props.regenerateLocations !== true && stored !== null) {
        return bookRef.current.locations.load(stored);
      }
      const locations = bookRef.current.locations.generate(
        props.locationsCharBreak || 600,
      );
      await AsyncStorage.setItem(key, bookRef.current.locations.save());
      return locations;
    } catch (err) {
      console.log('EpubReader.loadLocations', err);
      return Promise.reject(err);
    }
  };
  const onRelocated = (visibleLocation: Location) => {
    props.onLocationChange?.(visibleLocation);
  };
  const openBook = async (bookUrl: string, useBase64?: boolean) => {
    // const type = useBase64 ? 'useBase64' : null;
    if (!renditionRef.current) {
      needsOpenRef.current = [bookUrl, useBase64];
      return;
    }
    if (!bookRef.current) {
      return;
    }
    try {
      await bookRef.current.open(bookUrl);
      await bookRef.current.ready;
      props.onReady?.(bookRef.current);
      const nav = await bookRef.current.loaded.navigation;
      if (activeRef.current && isMountedRef.current) {
        setToc(nav.toc);
        props.onNavigationReady?.(nav.toc);
      }
      if (props.generateLocations !== false) {
        const locations = await loadLocations();
        renditionRef.current.setLocations(locations);
        props.onLocationsReady?.(bookRef.current.locations);
      }
    } catch (err) {
      console.log('EpubReader.openBook', err);
    }
  };
  useEffect(() => {
    activeRef.current = true;
    isMountedRef.current = true;
    const handleAppStateChange = (state: AppStateStatus) => {
      if (state === 'active') {
        activeRef.current = true;
      } else if (state === 'background') {
        activeRef.current = false;
      } else if (state === 'inactive') {
        activeRef.current = false;
      }
    };
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      isMountedRef.current = false;
      AppState.removeEventListener('change', handleAppStateChange);
      destroy();
    };
  }, []);
  useEffect(() => {
    if (!props.src) {
      bookRef.current?.destroy();
      return;
    }
    loadBook(props.src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.src]);
  return (
    <Rendition
      ref={renditionRef}
      url={props.src}
      beforeViewRemoved={props.beforeViewRemoved}
      display={props.location}
      flow={props.flow}
      font={props.font}
      fontSize={props.fontSize}
      gap={props.gap}
      height={props.height}
      minSpreadWidth={props.minSpreadWidth}
      onDblPress={props.onDblPress}
      onDisplayed={props.onDisplayed}
      onError={props.onError}
      onLongPress={props.onLongPress}
      onMarkClicked={props.onMarkClicked}
      onPress={props.onPress}
      onRelocated={onRelocated}
      onSelected={props.onSelected}
      onViewAdded={props.onViewAdded}
      renderError={props.renderError}
      renderLoading={props.renderLoading}
      resizeOnOrientationChange={props.resizeOnOrientationChange}
      script={props.script}
      style={props.style}
      stylesheet={props.stylesheet}
      theme={props.theme}
      themes={props.themes}
      webviewContainerStyle={props.webviewContainerStyle}
      webviewStyle={props.webviewStyle}
      webviewStylesheet={props.webviewStylesheet}
      width={props.width}
      // orientation={this.state.orientation}
    />
  );
};

function arePropsEqual(prevProps: Props, nextProps: Props) {
  if (
    nextProps.width !== prevProps.width ||
    nextProps.height !== prevProps.height
  ) {
    return false;
  }
  if (nextProps.color !== prevProps.color) {
    return false;
  }
  if (nextProps.backgroundColor !== prevProps.backgroundColor) {
    return false;
  }
  if (nextProps.size !== prevProps.size) {
    return false;
  }
  if (nextProps.flow !== prevProps.flow) {
    return false;
  }
  if (nextProps.origin !== prevProps.origin) {
    return false;
  }
  if (nextProps.orientation !== prevProps.orientation) {
    return false;
  }
  if (nextProps.src !== prevProps.src) {
    return false;
  }
  if (nextProps.onPress !== prevProps.onPress) {
    return false;
  }
  if (nextProps.onLongPress !== prevProps.onLongPress) {
    return false;
  }
  if (nextProps.onDblPress !== prevProps.onDblPress) {
    return false;
  }
  if (nextProps.stylesheet !== prevProps.stylesheet) {
    return false;
  }
  if (nextProps.javascript !== prevProps.javascript) {
    return false;
  }
  return true;
}

export default React.memo(Epub, arePropsEqual);
