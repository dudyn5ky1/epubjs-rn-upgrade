import { Stack } from '@mobily/stacks';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useSafeArea } from 'react-native-safe-area-context';

import { HomeScreenNavigationProp } from '../navigation/types';

const MOBY_DICK = 'https://s3.amazonaws.com/epubjs/books/moby-dick.epub';

const A =
  'http://epubtest.org/books/Fundamental-Accessibility-Tests-Basic-Functionality-v1.0.0.epub';

const HomeScreen: React.FC<{}> = () => {
  const insets = useSafeArea();
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  return (
    <Stack space={8} align="center" style={{ paddingTop: insets.top }}>
      <Text style={{ color: theme.colors.text }}>HomeScreen</Text>
      <Button
        labelStyle={{ color: theme.colors.text }}
        mode="contained"
        onPress={() => {
          navigation.navigate('Reader', {
            url: A,
          });
        }}
        theme={theme}
      >
        Go to epub reader
      </Button>
    </Stack>
  );
};

export default HomeScreen;
