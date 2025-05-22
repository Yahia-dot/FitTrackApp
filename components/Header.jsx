import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import ThemedText from './ThemedText';
import ThemedLogo from './ThemedLogo';

const Header = ({ 
  date, 
  style, 
  logoStyle, 
  titleStyle, 
  dateStyle,
  logoSize = 20,
  onPress // Add this prop
}) => {
  
  const HeaderContent = () => (
    <View style={[styles.headerWrapper, style]}>
      <View style={styles.headerContainer}>
        <ThemedLogo size={logoSize} style={[styles.logo, logoStyle]} />
        <ThemedText variant="title" style={[styles.appTitle, titleStyle]}>
          FitTrack
        </ThemedText>
      </View>
      
      {date && (
        <ThemedText variant="body" style={[styles.dateText, dateStyle]}>
          {date}
        </ThemedText>
      )}
    </View>
  );

  // If onPress is provided, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <HeaderContent />
      </TouchableOpacity>
    );
  }

  // Otherwise, return regular View
  return <HeaderContent />;
};

const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginRight: 8,
  },
  appTitle: {
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 13.5,
    marginTop: 1,
    opacity: 0.8,
  },
});

export default Header;