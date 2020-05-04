import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import AppHeader from '../components/AppHeader';
import EpubReader from '../screens/EpubReader';
import HomeScreen from '../screens/HomeScreen';
import { RootStackParamList } from './types';

const RootStack = createStackNavigator<RootStackParamList>();

const Navigation: React.FC<{}> = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <RootStack.Screen
          name="Reader"
          component={EpubReader}
          options={{
            header: AppHeader,
            headerShown: true,
            headerTransparent: true,
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
