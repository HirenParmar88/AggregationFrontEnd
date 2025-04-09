import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { TextInput, Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import styles from '../../styles/urlscreen';

function UrlScreen() {
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });

  const onDismissSnackBar = () =>
    setSnackbarInfo({ visible: false, message: '' });

  const onToggleSnackBar = (message, code) => {
    const backgroundColor =
      code === 200 ? 'rgb(80, 189, 160)' : 'rgb(210, 43, 43)';

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: { backgroundColor },
    });
  };

  const handleNextBtn = async () => {
    if (!text) {
      onToggleSnackBar('Please enter Dynamic Backend Url !');
      return;
    }
    if (isValidUrl(text)) {
      try {
        await AsyncStorage.setItem('BackendUrl', text);
        console.log('URL successfully saved to AsyncStorage:', text);
        onToggleSnackBar('URL successfully saved', 200);
        setTimeout(() => {
          navigation.navigate('Login');
        }, 3000);
      } catch (error) {
        console.error('Error to store Url :', error);
        Alert.alert('Error', 'Failed to save URL. Please try again.');
      }
    } else {
      console.log('Please enter a valid URL');
      Alert.alert('Invalid URL', 'The URL you entered is not valid.');
    }
  };

  const isValidUrl = url => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.textbox}>
            <TextInput
              mode="outlined"
              label="Back-End URL"
              style={styles.input}
              placeholder="http://example.com/"
              value={text}
              onChangeText={setText}
            />
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.TouchableBtn}
          labelStyle={{ fontSize: 15 }}
          mode="contained"
          onPress={handleNextBtn}>
          <Text style={styles.btnGroupsText}>Next</Text>
        </TouchableOpacity>
      </View>

      <Snackbar
        visible={snackbarInfo.visible}
        onDismiss={onDismissSnackBar}
        duration={3000}
        //style={styles.snackbar}>
        style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
        {snackbarInfo.message}
      </Snackbar>
    </>
  );
}

export default UrlScreen;