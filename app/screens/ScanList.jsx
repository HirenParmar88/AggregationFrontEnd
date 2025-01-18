'use client';
import React, {useState, useEffect} from 'react';
import {
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
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // To handle token storage
import {url} from '../../utils/constant';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function ScanList() {
  const navigation = useNavigation();
  const router = useRoute();
  const isFocused = useIsFocused();
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);

  const [parentModalVisible, setParentModalVisible] = useState(false); // Parent modal (confirmation)
  const [childModalVisible, setChildModalVisible] = useState(false); // Child modal (completed or failed)
  const [transactionStatus, setTransactionStatus] = useState(null); // Track transaction status (completed or failed)
  const [text, setText] = useState('');

  const [quantity, setQuantity] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [totalLevel, setTotalLevel] = useState(0);
  const [packageNo, setPackageNo] = useState(0);

  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });
  const onToggleSnackBar = (message, code) => {
    const backgroundColor =
      code === 200
        ? 'green'  // Success color
        
        : 'red';   // Default color for others
  
    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: { backgroundColor },
    });
  };
  //const onToggleSnackBar = message => setSnackbarInfo({visible: true, message});
  const onDismissSnackBar = () =>
    setSnackbarInfo({visible: false, message: ''});

  //code scan validation
  const scanValidation = async barcodeData => {
    console.log('scan validation call....');
    console.log('scan validation call started with barcode :', barcodeData);

    try {
      const tokenToScanAPIs = await AsyncStorage.getItem('authToken');
      console.log('tokenToScanAPIs : ', tokenToScanAPIs);

      const payload = {
        productId: router.params?.id,
        //productId: router.params?.id,
        batchId: router.params?.bid,
        uniqueCode: barcodeData,
        packageLevel: currentLevel,
        package: packageNo,
        quantity: quantity,
      };
      console.log('Payload for scan validation :', payload);

      const scanRes = await axios.post(`${url}/scanvalidation`, payload, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Scan Validation APIs Res 2 :', scanRes.data);

      if (scanRes.data && scanRes.data.code === 200) {
        console.log('Scan validation successful:', scanRes.data.message);
        //Alert.alert(scanRes.data.message);
        onToggleSnackBar(scanRes.data.message, 200);
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
      console.error('Error to scan validation', error);
    }
  };

  const handleScannedData = async () => {
    try {
      const response = await axios.post(
        `${url}/packagingHierarchy`,
        {
          productId: router.params.id,
          currentLevel: currentLevel,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await AsyncStorage.getItem('authToken')}`,
          },
        },
      );
      console.log('handle Scan Res :', response.data);
      if (response.data.success) {
        const {packageNo, quantity, currentLevel, totalLevel} =
          response.data.data;
        setQuantity(quantity);
        setPackageNo(packageNo);
        setCurrentLevel(currentLevel);
        setTotalLevel(totalLevel);
        console.log('Success.');
        console.log('package level :', packageNo);
        console.log('Quantity :', quantity);
        console.log('Current level :', currentLevel);
        console.log('total level :', totalLevel);
      } else {
        Alert.alert('Authentication failed. Please try again.');
        return;
      }
    } catch (err) {
      console.log('Error :', err);
    }
  };

  //product table pid
  useEffect(() => {
    console.log('PID :- ', router.params?.id);
    console.log('BID :- ', router.params?.bid);
    handleScannedData();
    //scanValidation();
    return () => {};
  }, [isFocused]);

  useEffect(() => {
    console.log('Is compatible:', HoneywellBarcodeReader.isCompatible);

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

      if (scanRes && scanRes.code === 200) {
        setData(prevData => {
          const alreadyExist = prevData.find(item => item === event.data);
          if (!alreadyExist) {
            return [...prevData, event.data];
          } else {
            //console.log("Already exitst...")
            //Alert.alert("Items Already Exists!")
            return [...prevData];
          }
        });
      }
    });

    HoneywellBarcodeReader.onBarcodeReadFail(() => {
      console.log('Barcode read failed');
    });

    HoneywellBarcodeReader.onTriggerStateChange(state => {
      console.log('onTriggerStateChange', state);
    });

    HoneywellBarcodeReader.barcodeReaderInfo(details => {
      console.log('barcodeReaderClaimed', details);
    });

    return () => {};
  }, []);

  const handleEndTransaction = () => {
    console.log('End transaction button pressed..');
    setParentModalVisible(true); // Show parent modal asking for confirmation
  };

  const handleParentModalDismiss = confirmed => {
    setParentModalVisible(false); // Close the parent modal
    setTransactionStatus(confirmed ? 'completed' : 'failed'); // Set status for child modal
    setChildModalVisible(true); // Show the corresponding child modal (completed or failed)
  };

  const handleChildModalDismiss = () => {
    setChildModalVisible(false); // Close the child modal
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.navigate('Product')} />
          <Appbar.Content title="Scan List" />
        </Appbar.Header>

        <View style={styles.formContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Pack Level:</Text>
            <Text style={styles.label}>{currentLevel}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.label} keyboardType="numeric">
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
          <Text style={styles.ListSubheader}>{data.length} Show Results</Text>
        </View>
        {/* <Divider /> */}
        {/* <View> */}
        
        <ScrollView contentContainerStyle={styles.container}>
          <List.Section style={{flexDirection: 'column-reverse'}}>
            {data.map((item, index) => (
              <List.Item
                key={index}
                title={item}
                left={() => <List.Icon icon="barcode-scan" />}
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
            onDismiss={() => handleParentModalDismiss(false)} // Dismiss on Cancel
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
                onPress={() => handleParentModalDismiss(true)} // Confirm button action
                style={styles.modalConfirmButton}>
                Confirm
              </Button>
              <Button
                mode="contained"
                onPress={() => handleParentModalDismiss(false)} // Cancel button action
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
    paddingLeft:20,
    //paddingHorizontal: 10,
    //paddingBottom: 0,
    //backgroundColor: 'yellow',
    //height:200,
  },
  formContainer: {
    marginTop: 0,
    padding: 10,
    //backgroundColor:'red',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
    width: 110,
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
