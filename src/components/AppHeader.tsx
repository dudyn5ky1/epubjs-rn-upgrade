import { Columns, Column } from '@mobily/stacks';
import { StackHeaderProps } from '@react-navigation/stack';
import React from 'react';
import { Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface Props {
  headerLeft?: () => React.ReactElement;
  headerCenter?: () => React.ReactElement;
  headerRight?: () => React.ReactElement;
  style?: StyleProp<ViewStyle>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const AppHeader: React.FC<StackHeaderProps> = ({ scene }) => {
  const { options } = scene.descriptor;
  return (
    <Columns space={1} alignX="between">
      <Column align="center" width="1/5">
        {options.headerLeft?.({})}
      </Column>
      <Column align="center">
        {typeof options.headerTitle === 'string' ? (
          <Text>{options.headerTitle}</Text>
        ) : (
          options.headerTitle?.({ onLayout: noop })
        )}
      </Column>
      <Column align="center" width="1/5">
        {options.headerRight?.({})}
      </Column>
    </Columns>
  );
};

export default AppHeader;
