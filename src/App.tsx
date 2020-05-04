import { StacksProvider } from '@mobily/stacks';
import React from 'react';
import {
  DefaultTheme,
  Provider as PaperProvider,
  Theme,
} from 'react-native-paper';

import { NEXUS7_WIDTH } from './common/consts';
import Navigation from './navigation';

const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FFEE58',
    accent: '#FF5722',
    text: '#4CAF50',
    background: '#C9BC1F',
    placeholder: '#9CCC65',
    error: '#C41C00',
  },
};

const App = () => {
  return (
    <PaperProvider theme={lightTheme}>
      <StacksProvider spacing={4} breakpoints={{ tablet: NEXUS7_WIDTH }}>
        <Navigation />
      </StacksProvider>
    </PaperProvider>
  );
};

export default App;
