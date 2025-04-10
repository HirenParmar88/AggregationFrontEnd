import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { Appbar, TextInput, Snackbar } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../styles/settings';
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import EsignPage from './Esign';


function SettingScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [printerIP, setPrinterIP] = useState('');
  const [printerPort, setPrinterPort] = useState(0);
  const [config, setConfig] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [apiData, setApiData] = useState({ apiName: null, apiMethod: null, apiEndpoint: null });
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });
  const onToggleSnackBar = (message, code) => {
    const backgroundColor =
      code === 200 ? 'rgb(80, 189, 160)' : 'rgb(210, 43, 43)';
    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: { backgroundColor },
    });
  };
  const onDismissSnackBar = () =>
    setSnackbarInfo({ visible: false, message: '' });

  useEffect(() => {
    //getData();
    getApiSettings();
    (async () =>
      decodeAndSetConfig(
        setConfig,
        await AsyncStorage.getItem('authToken'),
      ))();
    return () => { };
  }, [isFocused]);
  
  const handleAuthResult = async (
    isAuthenticated,
    user,
    isApprover,
    esignStatus,
    remarks,
  ) => {
    console.log("handle auth resutl call ", { isAuthenticated, user, isApprover, esignStatus, remarks });
    
    try {
      const resetState = () => {
        setApiData({ apiName: null, apiMethod: null, apiEndpoint: null });
        setOpenModal(false);
      };
      if (!isAuthenticated && config.esignStatus) {
        resetState();
        return;
      }

      if (isApprover) {
        if (esignStatus === 'approved') {
          onToggleSnackBar('E-sign approved by approver', 200);
          resetState();
          await settings();
        } else {
          onToggleSnackBar('E-sign rejected by approver');
          resetState();
        }
      } else {
        setOpenModal(false);
        onToggleSnackBar("E-sign approved by creater.", 200);
        setTimeout(() => {
          setApiData({ apiName: 'settings-approve', apiMethod: 'PATCH', apiEndpoint: '/api/v1/printerallocation'});
          setOpenModal(true);
        }, 1500);
      }
    } catch (err) {
      console.log("Error in handle esign ", err);
      onToggleSnackBar("Error to handle esign");
    }
  };

  // GET APIs for Settings Screen
  const getApiSettings = async () => {
    console.log('GET Api call.');
    const backendUrl = await AsyncStorage.getItem("BackendUrl")

    console.log('URL', backendUrl);
    const settingGetRes = await axios.get(
      `${backendUrl}/printerallocation/${await DeviceInfo.getUniqueId()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
        },
      },
    );
    console.log('Response of GET Settngs APIs ', settingGetRes.data);

    if (
      settingGetRes.data.success === true &&
      settingGetRes.data.code === 200
    ) {
      onToggleSnackBar(settingGetRes.data.message, 200);
      setPrinterIP(settingGetRes.data.data.printer_ip);
      setPrinterPort(settingGetRes.data.data.printer_port);
      console.log(printerPort);
      //navigation.navigate('Home');
    } else {
      onToggleSnackBar(settingGetRes.data.message, settingGetRes.data.code);
      return null;
    }
  };

  // POST APIs for Settings Screen
  const settings = async () => {
    console.log('POST Api call..');
    const deviceUniqueId = await DeviceInfo.getUniqueId();
    console.log('connected Device UniqueId :', deviceUniqueId);

    const token = await AsyncStorage.getItem('authToken');
    console.log('Token for settings POST Api :', token);
    const backendUrl = await AsyncStorage.getItem("BackendUrl")
    const settingRes = await axios.post(
      `${backendUrl}/printerallocation/`,
      {
        printer_ip: printerIP,
        printer_port: printerPort,
        mac_address: deviceUniqueId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('Response of settngs APIs ', settingRes.data);

    if (settingRes.data.success === true && settingRes.data.code === 200) {
      onToggleSnackBar(settingRes.data.message, 200);
      //navigation.navigate('Home');
    } else if (
      settingRes.data.success === true &&
      settingRes.data.code === 201
    ) {
      onToggleSnackBar(settingRes.data.message, 201);
      //navigation.navigate('Home');
    } else {
      onToggleSnackBar(settingRes.data.message, settingRes.data.code);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor:'#fff', elevation:4 }}>
          <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
          <Appbar.Content title="Settings" />
        </Appbar.Header>
        <ScrollView>
          <View style={styles.body1}>
            <TextInput
              label="Printer IP*"
              value={printerIP || ''}
              mode="outlined"
              onChangeText={printerIP => setPrinterIP(printerIP)}
              style={styles.textInputIP}
            />
            <TextInput
              label="Port*"
              value={printerPort.toString() || ''}
              mode="outlined"
              onChangeText={newPort => setPrinterPort(newPort)}
              style={styles.textInputPort}
            />
          </View>
        </ScrollView>
        <View>
          <TouchableOpacity
            mode="contained"
            //labelStyle={{ fontSize: 20 }}
            style={styles.submitButton}
            onPress={async () => {
              console.log(config.config.esign_status, !openModal);
              if (config.config.esign_status && !openModal) {
                setOpenModal(true);
                setApiData({ apiName: 'settings-create', apiMethod: 'POST', apiEndpoint: '/api/v1/printerallcation'});
                return;
              }
              await settings();
            }}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {openModal && (
        <EsignPage
          config={config}
          handleAuthResult={handleAuthResult}
          apiData={apiData}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      )}

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
export default SettingScreen;
