//app/components/screens/TrackCodeScreen.jsx
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  FlatList,
} from 'react-native';
import { Appbar, Text, TextInput, Snackbar, useTheme, List } from 'react-native-paper';
import { useLoading } from '../../context/LoadingContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import Feather from 'react-native-vector-icons/Feather';

function TrackCode() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { setLoading } = useLoading();
  const { colors } = useTheme();
  const [countryCode, setCountryCode] = useState(null);
  const [scanCode, setScanCode] = useState(undefined);
  const [trackCodes, setTrackCodes] = useState({
    childCodes: [],
    parentCode: null,
  })
  const [config, setConfig] = useState(null);
  const [token, setToken] = useState(null);
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
    snackbarStyle: { backgroundColor: colors.primary }
  });

  const onToggleSnackBar = (message, code = 500) => {
    const backgroundColor = code !== 200 ? colors.error : colors.primary;

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: { backgroundColor },
    });
  };
  const onDismissSnackBar = () =>
    setSnackbarInfo({ visible: false, message: '' });

  console.log("config :->", config);
  useEffect(() => {
    const loadTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        console.log("stored token :", storedToken);
        if (storedToken) {
          decodeAndSetConfig(setConfig, storedToken);
          setToken(storedToken);
          setTrackCodes('');
        } else {
          onToggleSnackBar("Token not found please login again", 500);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        setLoading(false);
      }
    };
    loadTokenAndData();
    const unsubscribe = navigation.addListener('blur', () => {
      setScanCode('');
    });
    return unsubscribe;
  }, [isFocused]);

  useEffect(() => {
    console.log('Is compatible:', HoneywellBarcodeReader.isCompatible);
    HoneywellBarcodeReader.register().then(claimed => {
      console.log(
        claimed ? 'Barcode reader is claimed' : 'Barcode reader is busy',
      );
    });
    HoneywellBarcodeReader.onBarcodeReadSuccess(async event => {
      const countryCode = event.data;
      if (countryCode) {
        const uniqueCode = event.data;
        console.log("scanned code :->", uniqueCode);
        if (uniqueCode) {
          setScanCode(uniqueCode);
          console.log("AAA");
        }
      }
    });
    HoneywellBarcodeReader.onBarcodeReadFail(() => {
      console.log('Barcode read failed');
      onToggleSnackBar('Barcode read failed')
    });
    HoneywellBarcodeReader.onTriggerStateChange(state => {
      console.log('onTriggerStateChange', state);
      set
    });
    HoneywellBarcodeReader.barcodeReaderInfo(details => {
      console.log('barcodeReaderClaimed', details);
    });
    return () => { };
  }, [countryCode, scanCode]);

  const trackCode = async (barcodeData) => {
    console.log('Track Code API call..');
    console.log("barcodeData", barcodeData);
    try {
      const backendUrl = await AsyncStorage.getItem("BackendUrl")
      console.log("backendUrl :->", backendUrl);
      console.log("scanCode :->", scanCode);
      console.log("token :->", token);
      const trackCodeRes = await axios.get(`${backendUrl}/track-code/${scanCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('track code GET APIs Res:', trackCodeRes.data);
      if (trackCodeRes.data.code === 200 && trackCodeRes.data.success === true) {
        onToggleSnackBar(trackCodeRes.data.message, 200);
        console.log("200", trackCodeRes.data.message);
        console.log(trackCodeRes.data.data.childCode);
        setTrackCodes({
          childCodes: trackCodeRes.data.data.childCode,
          parentCode: trackCodeRes.data.data.parentCode
        })
        console.log(trackCodeRes.data.data.parentCode);
        console.log("trackCodes.parentCode", trackCodes.parentCode);
        return trackCodeRes.data;
      } else if (trackCodeRes.data.code) {
        setTrackCodes('');
        console.log("400", trackCodeRes.data.message);
        onToggleSnackBar(trackCodeRes.data.message);
        return null;
      } else {
        console.log('error !');
      }
    } catch (error) {
      console.error('Error to Track Code API call', error);
    }
  };

  const handleSubmit = () => {
    console.log('handleSubmit function call..');
    trackCode();
    if (!scanCode) {
      onToggleSnackBar('Please scan or enter sscc code or Level 1 code', 400);
      return;
    }
  };

  // Add this function to dismiss keyboard
  const handleScroll = () => {
    Keyboard.dismiss();
  };

  return (
    <>
      <View style={styles.mainContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          <Appbar.Header style={{ backgroundColor: '#fff', elevation: 4, }}>
            <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
            <Appbar.Content title="Track code" />
          </Appbar.Header>

          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false} // Hide vertical scrollbar
            showsHorizontalScrollIndicator={false} // Hide horizontal scrollbar (optional)
            onScrollBeginDrag={handleScroll} // Add this prop
            keyboardDismissMode="on-drag" // Add this for iOS
          >
            <View style={styles.div1}>
              <Text style={styles.txtTitle}>Scan / Enter Code</Text>
              <TextInput
                label="Scan / Enter code"
                value={scanCode}
                mode="outlined"
                onChangeText={text => setScanCode(text)}
                style={styles.textInput}
              />
            </View>

            <View style={styles.div2}>
              <View style={styles.childCodeContainer}>
                <View style={styles.childCode}>
                  <Text style={styles.childTxtHeading}> Child Codes : [ {trackCodes?.childCodes?.length} ] </Text>
                </View>
                <View>
                  <List.Section style={{ flexDirection: 'column-reverse' }}>
                    <FlatList
                      data={trackCodes.childCodes}
                      renderItem={({ item }) => <List.Item
                        title={item}
                        left={() => (
                          <Feather name="package" size={25} style={{ paddingRight: 0 }} />
                        )}
                      />}
                      keyExtractor={({ item }) => item}
                      ListEmptyComponent={() => <Text style={{ fontSize: 16, fontWeight: 'bold' }}> - </Text>}
                    />
                  </List.Section>
                </View>
              </View>
              <View style={styles.parentCodeContainer}>
                <View style={styles.parentCode}>
                  <Text style={styles.parentTxtHeading}>Parent Code:</Text>
                </View>
                <View style={styles.dynamicParentCode}>
                  <Text style={styles.parentTxt}>
                    {trackCodes.parentCode ? trackCodes.parentCode : '-'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity
            mode="contained"
            style={styles.TrackCodeSubmitButton}
            onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>

          <Snackbar
            visible={snackbarInfo.visible}
            onDismiss={onDismissSnackBar}
            duration={3000}
            style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
            {snackbarInfo.message}
          </Snackbar>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
export default TrackCode;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  TrackCodeSubmitButton: {
    backgroundColor: 'rgb(80, 189, 160)',
    position: 'absolute', // Fix button to bottom
    bottom: 7,
    left: 0,
    right: 0,
    borderRadius: 10,
    marginHorizontal: 7,
  },
  submitBtnText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 18,
    color: '#fff',
  },
  div1: {
    paddingTop: 5,
  },
  txtTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#fff',
    marginHorizontal: 2,
    marginVertical: 5,
    width: '100%'
  },
  div2: {
    flex: 1,
    paddingBottom: 80,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  childCodeContainer: {
    marginVertical: 16,
  },
  parentCodeContainer: {
    marginVertical: 16,
  },
  childTxtHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  parentTxtHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  parentTxt: {
    fontSize: 16,
    marginBottom: 8,
  },
  childCodesText: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: 16,
  },
  dynamicParentCode: {
    padding: 10,
    borderRadius: 4,
    minHeight: 60,
  },
  snackbar: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 70,
  },
});