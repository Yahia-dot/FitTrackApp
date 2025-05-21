import { StyleSheet, View } from 'react-native';
import React from 'react';

const Spacer = ({ 
  size = 'medium', // or 'small', 'large', 'xlarge'
  horizontal = false,
  style 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'medium':
        return 16;
      case 'large':
        return 24;
      case 'xlarge':
        return 40;
      default:
        if (typeof size === 'number') {
          return size;
        }
        return 16;
    }
  };
  
  return (
    <View
      style={[
        horizontal
          ? { width: getSize() }
          : { height: getSize() },
        style
      ]}
    />
  );
};

export default Spacer;

const styles = StyleSheet.create({});
