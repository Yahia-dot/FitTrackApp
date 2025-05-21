import { StyleSheet, Text, View, SafeAreaView, ImageBackground, Image, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import ThemedView from '../../components/ThemedView';
import { useProfile } from '../../hooks/useProfile';
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedLogo from '../../components/ThemedLogo';
import Header from '../../components/Header';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';

const Profile = () => {
  return (
    <ThemedView>
      <Text>Profile</Text>
    </ThemedView>
  )
}

export default Profile

const styles = StyleSheet.create({})