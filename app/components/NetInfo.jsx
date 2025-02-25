import React, {useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {Text, View} from 'react-native';
function GetNetInfo() {
  const [isNetConnected, setIsNetConnected] = useState();
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection Type :', state.type);
      console.log('Is connected :', state.isConnected);
      setIsNetConnected(state.isConnected);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <View>
      <Text>NoInternet: {isNetConnected}</Text>
    </View>
  );
}
export default GetNetInfo;
