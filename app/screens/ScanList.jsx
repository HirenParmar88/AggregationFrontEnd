'use client';
import React, {useState, useEffect} from 'react';
import {
  AppState,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import {url} from '../../utils/constant';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import DeviceInfo from 'react-native-device-info';
import {decodeAndSetConfig} from '../../utils/tokenUtils';

function ScanList() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [data, setData] = useState([]);
  const [parentModalVisible, setParentModalVisible] = useState(false);
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);

  const [quantity, setQuantity] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [totalLevel, setTotalLevel] = useState(0);
  const [packageNo, setPackageNo] = useState(0);
  const [totalProduct, setTotalProduct] = useState(0);
  const [perPackageProduct, setPerPackageProduct] = useState(0);
  const [transactionId, setTransactionId] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPackageLevel, setCurrentPackageLevel] = useState(0);
  const [ssccNumber, setSsccNumber] = useState();
  const [config, setConfig] = useState(null);
  const [serialNumber, setSerialNumber] = useState();

  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });

  useEffect(() => {
    if (!packageNo && !quantity) {
      handleScannedData();
    }
    //scanValidation();
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
      console.log('Received data :', event);
      console.log('Current Scanned data :', event.data);
      console.log('Previous data is :', data);

      const scanRes = await scanValidation(event.data);
      //console.log('Inside BarcodeRead Callback ', scanRes);
      if (scanRes && scanRes.code === 200) {
        await codeScan(event.data); //codeScan API call
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

    return () => {};
  }, [
    transactionId,
    quantity,
    currentIndex,
    currentLevel,
    packageNo,
    perPackageProduct,
    totalLevel,
    totalProduct,
    currentPackageLevel,
    isFocused
  ]);

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
      const productId = await AsyncStorage.getItem('productId');
      const batchId = await AsyncStorage.getItem('batchId');

      const payload = {
        productId: productId,
        batchId: batchId,
        uniqueCode: barcodeData,
        //packageLevel: currentPackageLevel,
      };
      console.log('Payload for scan/validation :', payload);

      const scanRes = await axios.post(`${url}/scan/validation`, payload, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('scan/validation APIs Res :', scanRes.data);

      if (scanRes.data.code === 200 && scanRes.data.success === true) {
        //onToggleSnackBar(scanRes.data.message, 200);
        console.log(scanRes.data.message, 200);
        return scanRes.data;
      } else if (scanRes.data.code === 409) {
        console.log('Invalid scan res :', scanRes.data.message);
        //Alert.alert(scanRes.data.message);
        onToggleSnackBar(scanRes.data.message, 409);
        return null;
      } else if (scanRes.data.code === 404) {
        console.log('404 : ', scanRes.data.message);
        //Alert.alert(scanRes.data.message);
        onToggleSnackBar(scanRes.data.message, 404);
        return null;
      } else if (scanRes.data.code === 400) {
        console.log('Invalid packege level :  ', scanRes.data.message);
        //Alert.alert(scanRes.data.message);
        onToggleSnackBar(scanRes.data.message, 400);
        return null;
      } else {
        console.log('error !');
      }
    } catch (error) {
      console.error('Error to scan validation API call', error);
    }
  };

  //packaging Hierarchy API
  const handleScannedData = async () => {
    decodeAndSetConfig(setConfig, await AsyncStorage.getItem('authToken'));
    try {
      const productId = await AsyncStorage.getItem('productId');
      const response = await axios.post(
        `${url}/packagingHierarchy`,
        {
          audit_log: {
            audit_log: config?.config?.audit_logs,
            remarks: 'none',
          },
          productId: productId,
          currentLevel: currentLevel,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        },
      );
      console.log('Packaging Hierarchy API Res :', response.data);
      AsyncStorage.setItem('quantity',response.data.data.quantity)
      if (response.data.success) {
        setQuantity(response.data.data.quantity);
        setPackageNo(response.data.data.packageNo);
        setCurrentLevel(response.data.data.currentLevel);
        setTotalLevel(response.data.data.totalLevel);
        setTotalProduct(response.data.data.totalProduct);
        setPerPackageProduct(response.data.data.perPackageProduct);
        setTransactionId(response.data.data.transactionId);
      } else {
        onToggleSnackBar(response.data.message, 400);
      }
    } catch (err) {
      console.log('Error :', err);
    }
  };

  //codescan API
  const codeScan = async barcodeData => {
    console.log('code scan Api called......');
    try {
      const payload = {
        uniqueCode: barcodeData,
        transactionId: transactionId,
        packageNo: packageNo,
        currentPackageLevel: currentPackageLevel,
        quantity: quantity,
        perPackageProduct: perPackageProduct,
        totalLevel: totalLevel,
        totalProduct: totalProduct,
        currentIndex: currentIndex,
      };
      if (totalProduct == 1) {
        payload['audit_log'] = {
          audit_log: config?.config?.audit_logs,
          performed_action: `Scan transaction completed with Transaction ID: ${transactionId}, Product ID: ${await AsyncStorage.getItem(
            'productId',
          )}, Batch ID: ${await AsyncStorage.getItem(
            'batchId',
          )}, and scanned by User ID: ${config.userId}.`,
          remarks: 'none',
        };
      }

      if(currentLevel>0){
        payload['totalQuantity']=await AsyncStorage.getItem('quantity')
      }
      console.log('Payload for codeScan api req :', payload);
      const codeScanResponse = await axios.post(
        `${url}/scan/codeScan`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('codeScan APIs Response :', codeScanResponse.data);

      if (codeScanResponse.data.success && codeScanResponse.data.code === 200) {
        setData(prevData => {
          const alreadyExist = prevData.find(item => item === barcodeData);
          if (!alreadyExist) {
            return [...prevData, barcodeData];
          } else {
            return [...prevData];
          }
        });
        onToggleSnackBar(codeScanResponse.data.message, 200);
        console.log('Transaction ID :', transactionId);
        setTransactionId(codeScanResponse.data.data.transactionId);
        setPackageNo(codeScanResponse.data.data.packageNo);
        setPerPackageProduct(codeScanResponse.data.data.perPackageProduct);
        setQuantity(codeScanResponse.data.data.quantity);
        setCurrentIndex(codeScanResponse.data.data.currentIndex);

        setTotalLevel(codeScanResponse.data.data.totalLevel);
        setTotalProduct(codeScanResponse.data.data.totalProduct);
        setCurrentPackageLevel(codeScanResponse.data.data.currentPackageLevel); //set current level value
        console.log('Updated..');

        if (codeScanResponse.data.data.quantity === 0) {
          setCurrentPackageLevel(0);
          setSerialNumber(codeScanResponse.data.data.serialNo);
          setSsccNumber(codeScanResponse.data.data.sscc_code);
          handleScannedData();
          setData([]);
        }
      } else if (codeScanResponse.data.code === 400) {
        onToggleSnackBar(codeScanResponse.data.message);
      } else if (codeScanResponse.data.code === 500) {
        onToggleSnackBar(codeScanResponse.data.message);
      }
    } catch (error) {
      console.error('Error to code scan API call..', error);
    }
  };

  const handleEndTransaction = () => {
    console.log('End transaction button pressed..');
    setParentModalVisible(true); // Show parent modal asking for confirmation
  };

  const handleParentModalDismiss = async confirmed => {
    setParentModalVisible(false); // Close the parent modal
    setTransactionStatus(confirmed ? 'completed' : 'failed'); // Set status for child modal
    console.log(confirmed);
    if (
      confirmed &&
      (ssccNumber != undefined || ssccNumber?.trim()) != '' &&
      serialNumber != 0 &&
      typeof serialNumber == 'number'
    ) {
      await handlePrintCode(ssccNumber, parseInt(serialNumber));
    }
    // Show the corresponding child modal (completed or failed)
  };

  const handleChildModalDismiss = () => {
    setChildModalVisible(false); // Close the child modal
  };

  //Print SSCC codes API
  const handlePrintCode = async (SsccCode, SerialNo) => {
    try {
      const res = await axios.post(
        `${url}/print`,
        {
          SsccCode,
          SerialNo,
          mac_address: await DeviceInfo.getUniqueId(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        },
      );
      console.log('Response of handle print ', res.data);

      if (res.data.success === true && res.data.code === 200) {
        setChildModalVisible(true);
      } else {
        onToggleSnackBar(res.data.message, res.data.code);
      }
    } catch (error) {
      console.log('Error to print code for ', SsccCode);
    }
  };

  AppState.addEventListener('change', async currentState => {
    console.log(currentState);
    try {
      // if (state === 'inactive' || state === 'background') {
        const res = await axios.post(
          `${url}/aggregationtransaction/handleAggregatedTransactionScanState`,
          {
            aggregatedTransactionId: transactionId,
            packageNo: packageNo,
            currentPackageLevel: currentPackageLevel,
            quantity: quantity,
            perPackageProduct: perPackageProduct,
            totalLevel: totalLevel,
            totalProduct: totalProduct,
            currentIndex: currentIndex,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${await AsyncStorage.getItem(
                'authToken',
              )}`,
            },
          },
        );
        console.log(
          'Response for handleAggregatedTransactionScanState ',
          res.data,
        );

        if (res.data.success === true && res.data.code === 200) {
          onToggleSnackBar(res.data.message, res.data.code);
        } else {
          onToggleSnackBar(res.data.message, res.data.code);
        }
      // }
    } catch (error) {
      console.log(
        'Error to Aggregated Transaction Scan State code for ',
        SsccCode,
      );
    }
  });

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
            <Text style={styles.label2}>{currentPackageLevel}</Text>
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
        {/* <View> */}

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

        {/* </View> */}

        <Divider />

        <Snackbar
          visible={snackbarInfo.visible}
          onDismiss={onDismissSnackBar}
          duration={3000}
          //style={styles.snackbar}>
          style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
          {snackbarInfo.message}
        </Snackbar>

        <TouchableOpacity
          mode="contained"
          //labelStyle={{ fontSize: 20 }}
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
                onPress={handleChildModalDismiss} // OK button action to close the modal
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
                onPress={handleChildModalDismiss} // OK button action to close the modal
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingLeft: 20,
    //paddingHorizontal: 10,
    //paddingBottom: 0,
    //backgroundColor: 'yellow',
    //height:200,
  },
  formContainer: {
    marginTop: 0,
    padding: 10,
    backgroundColor: 'rgba(80, 189, 160,0.7)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
    width: 110,
    color: '#fff',
  },
  label2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 25,
    color: '#333',
    //width: 110,
    color: '#fff',
  },
  label3: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 25,
    color: '#333',
    //width: 110,
    color: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 30,
    fontWeight: 'bold',
  },
  submitButton: {
    //position: 'absolute',
    //bottom: 0,
    //paddingVertical: 10,
    borderRadius: 0,
    padding: 20,
    backgroundColor: 'rgb(80, 189, 160)',
  },
  endTranTxt: {
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
    //padding: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 40,
    height: 250,
    borderRadius: 6,
    justifyContent: 'space-between',
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 10,
  },
  modalConfirmButton: {
    width: '48%',
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    width: '48%',
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#878f99',
  },
  modalOKButton: {
    width: '48%',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modelRetryButton: {
    width: '48%',
    borderRadius: 4,
    backgroundColor: 'red',
  },
  modalSuccessText: {
    //color: "green",
    fontSize: 18,
    textAlign: 'center',
  },
  modalFailedText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
  childModalFooter: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ListSubheader: {
    fontWeight: 'bold',
    fontSize: 16,
    paddingLeft: 10,
    marginBottom: 5,
    marginTop: 15,
    zIndex: 1,
    position: 'relative',
    top: 0,
  },
  ListSubheaderView: {
    shadowRadius: 3,
    opacity: 3,
    borderRadius: 2,
  },
  SnackbarDispaly: {
    flex: 1,
    justifyContent: 'space-between',
  },
  statusSuccess: {
    textAlign: 'center',
    //backgroundColor:'red'
  },
  snackbar: {
    //backgroundColor: "red",
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 10, // Extra space from the bottom if needed
  },
});
