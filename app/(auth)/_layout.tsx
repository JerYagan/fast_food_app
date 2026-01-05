import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Slot } from 'expo-router'

export default function AuthLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Slot />
    </SafeAreaView>
  );
}