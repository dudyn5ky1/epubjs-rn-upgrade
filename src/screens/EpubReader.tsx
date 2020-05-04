import { Stack } from '@mobily/stacks';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { default as Book } from 'epubjs/types/book';
import type { NavItem } from 'epubjs/types/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

import Epub from '../components/Epub';
import type {
  ReaderScreenNavigationProp,
  ReaderScreenRouteProp,
} from '../navigation/types';
import StreamerService from '../services/streamer';

interface Props {}

const EpubReader: React.FC<Props> = (props) => {
  const navigation = useNavigation<ReaderScreenNavigationProp>();
  const route = useRoute<ReaderScreenRouteProp>();
  const theme = useTheme();
  const bookRef = useRef<Book>();
  const [lastLocation, setLastLocation] = useState('');
  const [origin, setOrigin] = useState('');
  const [toc, setToc] = useState<NavItem[]>([]);
  const [src, setSrc] = useState('');
  const renderError = (
    errorDomain: string | undefined,
    errorCode: number,
    errorDesc: string,
  ) => {
    return (
      <View style={[styles.container, styles.epubContainer]}>
        <Text style={{ color: theme.colors.error }}>{`${
          errorDomain || ''
        }, ${errorCode}, ${errorDesc}`}</Text>
      </View>
    );
  };
  const renderLoading = () => {
    return (
      <View style={[styles.container, styles.epubContainer]}>
        <ActivityIndicator
          animating={true}
          color={theme.colors.primary}
          size="large"
        />
      </View>
    );
  };
  useEffect(() => {
    const { asset, url } = route.params;
    if (asset) {
      setSrc(asset);
      return;
    }
    if (!url) {
      return;
    }
    StreamerService.start()
      .then((newOrigin) => {
        setOrigin(newOrigin);
        return StreamerService.get(url);
      })
      .then((newSrc) => {
        setSrc(newSrc);
      })
      .catch((err) => {
        console.warn(err);
      });
    return () => {
      StreamerService.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!src) {
    return null;
  }
  return (
    <Stack space={4}>
      <Epub
        src={src}
        renderError={renderError}
        renderLoading={renderLoading}
        location={lastLocation}
        style={styles.epubContainer}
        webviewContainerStyle={styles.epubWebviewContainer}
        webviewStyle={styles.epubWebview}
        beforeViewRemoved={(...args) => {
          console.log('beforeViewRemoved', ...args);
        }}
        onDblPress={(...args) => {
          console.log('onDblPress', ...args);
        }}
        onDisplayed={(...args) => {
          console.log('onDisplayed', ...args);
        }}
        onError={(...args) => {
          console.log('onError', ...args);
        }}
        onLocationChange={(newVisibleLocation) => {
          setLastLocation(newVisibleLocation.start.cfi);
          console.log('//-------------------------------//');
          console.log(newVisibleLocation.start);
          console.log(newVisibleLocation.end);
          console.log(
            `atStart: ${newVisibleLocation.atStart}, atEnd: ${newVisibleLocation.atEnd}`,
          );
          console.log(
            `${newVisibleLocation.start.displayed.page}/${newVisibleLocation.start.displayed.total}`,
          );
          console.log(
            `${newVisibleLocation.end.displayed.page}/${newVisibleLocation.end.displayed.total}`,
          );
        }}
        onLocationsReady={() => {
          //
        }}
        onLongPress={(...args) => {
          console.log('onLongPress', ...args);
        }}
        onMarkClicked={(...args) => {
          console.log('onMarkClicked', ...args);
        }}
        onNavigationReady={setToc}
        onPress={(...args) => {
          console.log('onPress', ...args);
        }}
        onReady={(book) => {
          bookRef.current = book;
        }}
        onRelocated={(...args) => {
          console.log('onRelocated', ...args);
        }}
        onSelected={(...args) => {
          console.log('onSelected', ...args);
        }}
        onViewAdded={(...args) => {
          console.log('onViewAdded', ...args);
        }}
      />
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  epubContainer: {
    // backgroundColor: 'rgba(220, 110, 90, 0.6)',
  },
  epubWebviewContainer: {
    // backgroundColor: 'rgba(130, 180, 90, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  epubWebview: {
    // backgroundColor: 'rgba(120, 110, 200, 0.6)',
  },
});

export default EpubReader;
