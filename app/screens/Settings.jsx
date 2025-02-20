import React, {useState, useEffect} from 'react';
import {ScrollView, Text, View, TouchableOpacity} from 'react-native';
import {Appbar, TextInput, Snackbar} from 'react-native-paper';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {url} from '../../utils/constant';
import styles from '../../styles/settings';
import {decodeAndSetConfig} from '../../utils/tokenUtils';
import EsignPage from './Esign';

function SettingScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [printerIP, setPrinterIP] = useState('');
  const [printerPort, setPrinterPort] = useState(0);
  const [variables, setVariables] = useState('');

  const [config, setConfig] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [approveAPIName, setApproveAPIName] = useState();
  const [approveAPImethod, setApproveAPImethod] = useState();
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState();

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
      snackbarStyle: {backgroundColor},
    });
  };
  const onDismissSnackBar = () =>
    setSnackbarInfo({visible: false, message: ''});

  useEffect(() => {
    //getData();
    getApiSettings();
    (async () =>
      await decodeAndSetConfig(
        setConfig,
        await AsyncStorage.getItem('authToken'),
      ))();
    return () => {};
  }, [isFocused]);
  const handleAuthResult = async (
    isAuthenticated,
    user,
    isApprover,
    esignStatus,
    remarks,
    eSignStatusId,
  ) => {
    try {
      console.log('handleAuthResult');
      console.log('handleAuthResult', {
        isAuthenticated,
        isApprover,
        esignStatus,
        user,
      });
      console.log(isApprover, isAuthenticated);
      const closeApprovalModal = () => setOpenModal(false);
      const resetState = () => {
        setApproveAPIName('');
        setApproveAPImethod('');
        setApproveAPIEndPoint('');
        setOpenModal(false);
      };
      if (!isAuthenticated && config.esignStatus) {
        resetState();
        return;
      }

      const handleEsignStatus = async () => {
        if (esignStatus === 'rejected') {
          onToggleSnackBar('eSign has been rejected for settings');
          closeApprovalModal();
        } else {
          onToggleSnackBar(
            'You do not have permission to access e-sign. Please request approval from a user with e-sign permissions.',
            401,
          );
        }
      };
      if (isApprover) {
        console.log('Approved is ', esignStatus === 'approved');
        if (esignStatus === 'approved') {
          onToggleSnackBar('eSign has been approved for settings', 200);
          setVisible(true);

          closeApprovalModal();
        } else {
          onToggleSnackBar('eSign has been rejected for settings');
          if (esignStatus === 'rejected') closeApprovalModal();
        }
      } else {
        handleEsignStatus();
      }
      resetState();
    } catch (err) {
      console.log(err);
    }
  };

  //Get Device Info
  const getData = async () => {
    console.log('getUniqueId :', await DeviceInfo.getUniqueId());
    // console.log('getAndroidId :', await DeviceInfo.getAndroidId());
    // console.log('getDeviceId :', await DeviceInfo.getDeviceId());
    // console.log('getMacAddress :', await DeviceInfo.getMacAddress());
    // console.log('getMacAddressSync :', await DeviceInfo.getMacAddressSync());
    // console.log('getIpAddress :', await DeviceInfo.getIpAddress());
    // console.log('getManufacturer :', await DeviceInfo.getManufacturer());
    // console.log('getFingerprint :', await DeviceInfo.getFingerprint());
    // console.log('getDisplay :', await DeviceInfo.getDisplay());
    // console.log('getDeviceToken :', await DeviceInfo.getDeviceToken());
    // console.log('getHost :', await DeviceInfo.getHost());
    // console.log('getInstanceId :', await DeviceInfo.getInstanceId());
  };

  // GET APIs for Settings Screen
  const getApiSettings = async () => {
    console.log('GET Api call.');
    // const token = await AsyncStorage.getItem('authToken');
    // console.log("Token use for getApiSettings:",token);
    console.log('URL', url);
    const settingGetRes = await axios.get(
      `${url}/printerallocation/${await DeviceInfo.getUniqueId()}`,
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
    console.log('URL in settings', url);

    const settingRes = await axios.post(
      `${url}/printerallocation/`,
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
    } else if (settingRes.data.success === true && settingRes.data.code === 201) {
      onToggleSnackBar(settingRes.data.message, 201);
      //navigation.navigate('Home');
    } else {
      onToggleSnackBar(settingRes.data.message, settingRes.data.code);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Appbar.Header>
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
          <View style={styles.body2}>
            <TextInput
              label="No of variables*"
              value={variables}
              mode="outlined"
              onChangeText={variables => setVariables(variables)}
              style={styles.textInputVariables}
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
                setApproveAPIName('printerAllocation-approve');
                setApproveAPImethod('POST');
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
          approveAPIName={approveAPIName}
          approveAPImethod={approveAPImethod}
          approveAPIEndPoint={approveAPIEndPoint}
          openModal={openModal}
          setOpenModal={setOpenModal}
          setStatus={setStatus}
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
