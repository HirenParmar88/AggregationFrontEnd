import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {Appbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

function LoaderComponent() {
  const navigation= useNavigation();

  return (
    <>
      {/* <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title="Loader" />
      </Appbar.Header> */}

      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, styles.horizontal]}>
          <ActivityIndicator size="large" />
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}
export default LoaderComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    // backgroundColor: 'yellow',
    // borderWidth: 2,
    // borderColor: 'red',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});
