import React, { useState } from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import {TextInput, Button} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

function UrlScreen() {
  const navigation=useNavigation();

  const [text, setText] = useState('');
  
  const handleNextBtn=async()=>{
    console.log('Next btn pressed..');
    if(!text){
      console.log("Empty !!");
      Alert.alert("Please Enter URL !!");
      return;
    }
    if(isValidUrl(text)){
      try {
        await AsyncStorage.setItem('BackendUrl', text);
        console.log('URL successfully saved to AsyncStorage:', text);
        
        navigation.navigate('Home');
        Alert.alert('success');
      } catch (error) {
        console.error('Error to store Url :',error);
      }
    }else{
      console.log('Please enter a valid URL');
    }
  }

  const isValidUrl=(url)=>{
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.textbox}>
          <TextInput
            label="Back-End URL"
            style={styles.input}
            placeholder="Enter Back-End URL"
            value={text}
            onChangeText={setText}
          />
        </View>
      </View>
      <View><Text>{setText}</Text></View>
      <TouchableOpacity
        style={styles.TouchableBtn}
        labelStyle={{fontSize: 15}}
        mode="contained"
        onPress={handleNextBtn}
      >
        <Text style={styles.btnGroupsText}>Next</Text>
      </TouchableOpacity>
    </>
  );
}
export default UrlScreen;

const styles = StyleSheet.create({
  container: {
    //backgroundColor: 'yellow',
    flex: 1,
    //borderWidth: 2,
    //borderColor: 'red',
  },
  textbox: {
    marginTop: 250,
    marginLeft: 6,
    marginRight: 6,
  },
  input: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  btnContainer: {
    backgroundColor: 'red',
    margin: 100,
  },
  btn: {
    borderRadius: 4,
    padding: 5,
  },
  TouchableBtn: {
    backgroundColor: 'rgb(80, 189, 160)',
    bottom: 0,
  },
  btnGroupsText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 18,
    color: '#fff',
  },
});
