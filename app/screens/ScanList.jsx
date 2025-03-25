'use client';
import React, {useState, useEffect, useRef} from 'react';
import {
  AppState,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Appbar,
  Text,
  Button,
  List,
  Divider,
  Portal,
  Modal,
  Snackbar,
} from 'react-native-paper';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // To handle token storage
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import DeviceInfo from 'react-native-device-info';
import {decodeAndSetConfig} from '../../utils/tokenUtils';
import styles from '../../styles/scanlist';
import {useLoading} from '../../context/LoadingContext';
import { useFocusEffect } from '@react-navigation/native';

function ScanList({route}) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const {setLoading} = useLoading();
  const [data, setData] = useState([]);
  const [parentModalVisible, setParentModalVisible] = useState(false);
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [ssccNumber, setSsccNumber] = useState(null);
  const [config, setConfig] = useState(null);
  const [serialNumber, setSerialNumber] = useState(null);
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });
  /* Get the param */
  const { backendUrl, productId, batchId } = route.params;
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    (async () => {
      console.log('use effect ', backendUrl, productId, batchId, token);
      setData([]);
      const token = await AsyncStorage.getItem('authToken');
      setAuthToken(token);
      await handleScannedData();
    })();
    return () => {};
  }, [isFocused]);

  useEffect(() => {
    //console.log('Is compatible:', HoneywellBarcodeReader.isCompatible);
    HoneywellBarcodeReader.register().then(claimed => {
      console.log(
        claimed ? 'Barcode reader is claimed' : 'Barcode reader is busy',
      );
    });

    HoneywellBarcodeReader.onBarcodeReadSuccess(async event => {
      if (quantity > 0) {
        console.log('Current Scanned data :', event.data);
        console.log('Previous data is :', data);

        const scanRes = await scanValidation(event.data);
        console.log('Inside BarcodeRead Callback ', scanRes);
        if (scanRes) {
          await codeScan(event.data); //codeScan API call
        }
      } else {
        onToggleSnackBar(
          'All codes have been scanned. You may now complete the transaction.',
          400,
        );
      }
    });

    HoneywellBarcodeReader.onBarcodeReadFail(() => {
      console.log('Barcode read failed');
    });

    HoneywellBarcodeReader.onTriggerStateChange(state => {
      console.log('onTriggerStateChange', state);
    });

    HoneywellBarcodeReader.barcodeReaderInfo(details => {
      //console.log('barcodeReaderClaimed', details);
    });

    return async () => {};
  }, [transactionId, quantity, isFocused]);

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

  //scan Validation API
  const scanValidation = async barcodeData => {
    console.log('scan validation call....');
    try {
      const payload = {
        productId,
        batchId,
        uniqueCode: barcodeData,
      };
      console.log('Payload for scan/validation :', payload);
      setLoading(true);
      const scanRes = await axios.post(
        `${backendUrl}/scan/validation`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('scan/validation APIs Res :', scanRes.data);

      if (scanRes.data.success) {
        console.log(scanRes.data.message, 200);
        setLoading(false);
        return true;
      } else {
        console.log('Invalid scan res :', scanRes.data.message);
        onToggleSnackBar(scanRes.data.message);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error to scan validation API call', error);
      setLoading(false);
    }
  };

  //packaging Hierarchy API
  const handleScannedData = async () => {
    const token = await AsyncStorage.getItem('authToken');
    decodeAndSetConfig(setConfig, token);
    try {
      console.log('handlescanned data  :-', {productId, batchId});
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/product/packagingHierarchy`,
        {
          audit_log: {
            audit_log: config?.config?.audit_logs,
            remarks: 'none',
          },
          productId,
          batchId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Packaging Hierarchy API Res :', response.data);

      if (response.data.success === true && response.data.code === 200) {
        onToggleSnackBar(response.data.message, response.data.code);
        if (response?.data?.data?.scannedCodes?.length > 0) {
          setData(response?.data?.data?.scannedCodes);
        }
        setSsccNumber(response.data?.data?.ssccCode);
        setSerialNumber(response.data?.data?.serialNo);
        setQuantity(response.data.data?.quantity);
        setTransactionId(response.data.data?.transactionId);
        setLoading(false);
      } else {
        console.log(response.data.message);
        onToggleSnackBar(response.data.message, 400);
        setLoading(false);
      }
    } catch (err) {
      console.log('Error :', err);
      setLoading(false);
    }
  };
  //console.log('Total Quantity :', totalQuantity);

  //codescan API
  const codeScan = async barcodeData => {
    console.log('Code scan API called......');
    try {
      setLoading(true);
      const payload = {
        uniqueCode: barcodeData,
        transactionId,
        quantity,
      };
      if (config?.config?.audit_logs) {
        payload['audit_log'] = {
          audit_log: true,
          performed_action: `Scan transaction completed with Transaction ID: ${transactionId}, Product ID: ${productId}, Batch ID: ${batchId}, and scanned by User ID: ${config.userId}.`,
          remarks: 'none',
        };
      }
      console.log('Payload for codeScan API request:', payload);

      // Making the API call
      const codeScanResponse = await axios.post(
        `${backendUrl}/scan/codescan`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('codeScan API Response:', codeScanResponse.data);

      if (codeScanResponse.data.success && codeScanResponse.data.code === 200) {
        setData(prevData => {
          const alreadyExist = prevData.includes(barcodeData);
          return alreadyExist ? [...prevData] : [...prevData, barcodeData];
        });

        onToggleSnackBar(codeScanResponse.data.message, 200);
        console.log('Transaction ID:', transactionId);

        // Update state with new response data.
        const responseData = codeScanResponse.data.data;
        setTransactionId(responseData.transactionId);
        setQuantity(responseData.quantity);
        setSerialNumber(responseData.serialNo);
        setSsccNumber(responseData.sscc_code);
        setLoading(false);
      } else {
        onToggleSnackBar(
          codeScanResponse.data.message,
          codeScanResponse.data.code,
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during code scan API call:', error);
      setLoading(false);
    }
  };

  const handleEndTransaction = () => {
    console.log('End transaction button pressed..');
    setParentModalVisible(true);
  };

  const handleParentModalDismiss = async confirmed => {
    setParentModalVisible(false);
    setTransactionStatus(confirmed ? 'completed' : 'failed');

    if (confirmed && ssccNumber) {
      await handlePrintCode(ssccNumber, parseInt(serialNumber));
    }
  };

  const handleChildModalDismiss = () => {
    setChildModalVisible(false);
  };

  //Print SSCC codes API
  const handlePrintCode = async (ssccCode, serialNo) => {
    console.log('print payload ', {
      ssccCode,
      serialNo,
      macAddress: await DeviceInfo.getUniqueId(),
    });
    try {
      setLoading(true);
      const res = await axios.post(
        `${backendUrl}/print`,
        {
          ssccCode,
          serialNo,
          macAddress: await DeviceInfo.getUniqueId(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      console.log('Response of handle print ', res.data);

      if (res.data.success === true && res.data.code === 200) {
        if (res.data.data?.allTransactionDone) {
          onToggleSnackBar(
            'All transactions has been completed',
            res.data.code,
          );
          setData([]);
          setAuthToken(null);
          setSerialNumber(null);
          setSsccNumber(null);
          setTransactionId(null);
          setChildModalVisible(false);
          setQuantity(0)
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        } else {
          handleScannedData();
          setData([]);
          setChildModalVisible(true);
        }
        setLoading(true);
      } else {
        onToggleSnackBar(res.data.message, res.data.code);
        setLoading(true);
      }
    } catch (error) {
      console.log('Error to print code for ', error);
      setLoading(true);
    }
  };

  const handleAggregateState = async currentState => {
    console.log(currentState);

    const payload = {
      aggregatedTransactionId: transactionId,
      quantity: quantity,
      scannedCodes: data,
    };
    try {
      // if (state === 'inactive' || state === 'background') {
      // const res = await axios.post(
      //   `${backendUrl}/aggregationtransaction/handleAggregatedTransactionScanState`,
      //   {
      //     ...payload,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
      //     },
      //   }
      // );
      // console.log(
      //   "Response for handleAggregatedTransactionScanState ",
      //   res.data
      // );
      // if (res.data.success === true && res.data.code === 200) {
      //   onToggleSnackBar(res.data.message, res.data.code);
      // } else {
      //   onToggleSnackBar(res.data.message, res.data.code);
      // }
      // }
    } catch (error) {
      console.log(
        'Error to Aggregated Transaction Scan State code for ',
        SsccCode,
      );
    }
  };

  AppState.addEventListener(
    'change',
    async currentState =>
      currentState == 'background' && (await handleAggregateState()),
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => navigation.navigate('Aggregation')}
          />
          <Appbar.Content title="Scan List" />
        </Appbar.Header>

        <View style={styles.formContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Pack Level:</Text>
            <Text style={styles.label2}>{'1'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.label3} keyboardType="numeric">
              {quantity}
            </Text>
          </View>
        </View>

        {/* <View>
          <Text>PID : {router.params?.id}</Text>
          <Text>BID : {router.params?.bid}</Text>
        </View> */}

        <Divider />
        <View style={styles.ListSubheaderView}>
          <Text style={styles.ListSubheader}>{data.length} Scanned Codes</Text>
        </View>
        {/* <Divider /> */}

        <ScrollView contentContainerStyle={styles.container}>
          <List.Section style={{flexDirection: 'column-reverse'}}>
            {data.map((item, index) => (
              <List.Item
                key={index}
                title={item}
                left={() => (
                  <Feather name="package" size={25} style={{paddingRight: 0}} />
                )}
              />
            ))}
          </List.Section>
        </ScrollView>

        <Divider />

        <Snackbar
          visible={snackbarInfo.visible}
          onDismiss={onDismissSnackBar}
          duration={3000}
          style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
          {snackbarInfo.message}
        </Snackbar>
        <TouchableOpacity
          mode="contained"
          disabled={quantity !== 0}
          style={styles.submitButton}
          onPress={handleEndTransaction}>
          <Text style={styles.endTranTxt}>End Transaction</Text>
        </TouchableOpacity>

        {/* Parent Modal (Confirmation) */}
        <Portal>
          <Modal
            visible={parentModalVisible}
            onDismiss={async () => await handleParentModalDismiss(false)} // Dismiss on Cancel
            contentContainerStyle={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan List</Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View>
                <MaterialCommunityIcons
                  name="cloud-print"
                  size={50}
                  color="#000000"
                  style={styles.statusSuccess}
                />
              </View>
              <Text style={styles.modalText}>
                Shipper printing in progress..
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={async () => await handleParentModalDismiss(true)} // Confirm button action
                style={styles.modalConfirmButton}>
                Confirm
              </Button>
              <Button
                mode="contained"
                onPress={async () => await handleParentModalDismiss(false)} // Cancel button action
                style={styles.modalButton}>
                Cancel
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Child Modal (Printing Completed) */}
        <Portal>
          <Modal
            visible={childModalVisible && transactionStatus === 'completed'}
            onDismiss={handleChildModalDismiss} // Close the modal
            contentContainerStyle={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Status</Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View>
                <MaterialIcons
                  name="done"
                  size={50}
                  color="#000000"
                  style={styles.statusSuccess}
                />
              </View>
              <Text style={styles.modalSuccessText}>Printing Completed!</Text>
            </ScrollView>

            <View style={styles.childModalFooter}>
              <Button
                mode="contained"
                onPress={handleChildModalDismiss}
                style={styles.modalOKButton}>
                OK
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Child Modal (Printing Failed) */}
        <Portal>
          <Modal
            visible={childModalVisible && transactionStatus === 'failed'}
            onDismiss={handleChildModalDismiss} // Close the modal
            contentContainerStyle={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Status</Text>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View>
                <MaterialIcons
                  name="sms-failed"
                  size={50}
                  color="#000000"
                  style={styles.statusSuccess}
                />
              </View>
              <Text style={styles.modalFailedText}>
                Shipper printing Failed!
              </Text>
            </ScrollView>

            <View style={styles.childModalFooter}>
              <Button
                mode="contained"
                onPress={handleChildModalDismiss}
                style={styles.modelRetryButton}>
                Retry
              </Button>
            </View>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
    </>
  );
}

export default ScanList;
