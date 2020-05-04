import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import type { ScaledSize } from 'react-native';

const useWindowDimensions = () => {
  const [window, setWindow] = useState(() => Dimensions.get('window'));
  useEffect(() => {
    const onWindowDimensionsChange = ({ window }: { window: ScaledSize }) => {
      setWindow(window);
    };
    Dimensions.addEventListener('change', onWindowDimensionsChange);
    return () =>
      Dimensions.removeEventListener('change', onWindowDimensionsChange);
  }, []);
  return window;
};

export default useWindowDimensions;
