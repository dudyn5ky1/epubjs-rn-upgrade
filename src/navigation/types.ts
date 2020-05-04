import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Reader: { asset?: string; url?: string };
};

export type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export type ReaderScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Reader'
>;

export type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'Reader'>;
