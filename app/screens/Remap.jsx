//app/components/screens/Remap.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Appbar,
  Text,
  TextInput,
  Modal,
  Portal,
  PaperProvider,
  Divider,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../../styles/remap';
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import EsignPage from './Esign';
import { fetchProductData, fetchBatchData, fetchCountryCode } from '../components/fetchDetails';
import { useLoading } from '../../context/LoadingContext';

function RemapScreen({ route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [text, setText] = useState('');
  const { setLoading } = useLoading();
  const [token, setToken] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({
    value: null,
    label: null,
  });
  const [selectedBatch, setSelectedBatch] = useState({
    value: null,
    label: null,
  });
  const [isFocusProduct, setIsFocusProduct] = useState(false);
  const [isFocusBatch, setIsFocusBatch] = useState(false);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [valueProduct, setValueProduct] = useState('');
  const [valueBatch, setValueBatch] = useState('');
  const [countryCode, setCountryCode] = useState(null);
  const [scanCode, setScanCode] = useState(undefined);
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [approveAPIName, setApproveAPIName] = useState();
  const [approveAPImethod, setApproveAPImethod] = useState();
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState();
  const { colors } = useTheme();
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
    snackbarStyle: { backgroundColor: colors.primary }
  });
  const { setIsAuthenticated } = route.params;

  const onToggleSnackBar = (message, code=500) => {
    const backgroundColor = code !== 200 ? colors.error : colors.primary;

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: { backgroundColor },
    });
  };
  const onDismissSnackBar = () =>
    setSnackbarInfo({ visible: false, message: '' });
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);


  const containerStyle = {
    backgroundColor: 'white',
    padding: 20,
    height: 250,
    width: 250,
    marginLeft: 55,
    borderRadius: 6,
  };

  useEffect(() => {
    const loadTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          decodeAndSetConfig(setConfig, storedToken);
          setToken(storedToken);
          setLoading(true);
          const resProd = await fetchProductData();
          setLoading(false);
          if (resProd.success) {
            setProducts(resProd.data);
          } else if (resProd.code === 401) {
            setIsAuthenticated(false);
          } else {
            onToggleSnackBar('Internal server error', 500);
          }
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
      setSelectedProduct({ value: null, label: null });
      setSelectedBatch({ value: null, label: null });
      setScanCode('');
      setText('');
    });
    return unsubscribe;
  }, [isFocused]);

  useEffect(() => {
    //console.log('Is compatible:', HoneywellBarcodeReader.isCompatible);
    HoneywellBarcodeReader.register().then(claimed => {
      console.log(
        claimed ? 'Barcode reader is claimed' : 'Barcode reader is busy',
      );
    });
    HoneywellBarcodeReader.onBarcodeReadSuccess(async event => {
      console.log('Current Scanned data :', event.data);
      console.log('Country code is ', countryCode);
      if (countryCode) {
        const uniqueCode = getUniqueCode(event.data, countryCode);
        if (uniqueCode) {
          const scanRes = await scanValidation(uniqueCode);
          if (scanRes && scanRes.code === 200) {
            setScanCode(uniqueCode);
          }
        }
      }
    });
    HoneywellBarcodeReader.onBarcodeReadFail(() => {
      console.log('Barcode read failed');
      onToggleSnackBar('Barcode read failed')
    });
    HoneywellBarcodeReader.onTriggerStateChange(state => {
      console.log('onTriggerStateChange', state);
    });
    HoneywellBarcodeReader.barcodeReaderInfo(details => {
      console.log('barcodeReaderClaimed', details);
    });
    return () => { };
  }, [countryCode, isFocused, selectedProduct, selectedBatch]);

  useEffect(() => {
    if (selectedProduct.value) {
      (async () => {
        setLoading(true);
        const resCountry = await fetchCountryCode(selectedProduct.value);
        const resBatch = await fetchBatchData(selectedProduct.value);
        setLoading(false);
        if (resBatch.success) {
          setBatches(resBatch.data)
        } else if (resBatch.code === 401) {
          setIsAuthenticated(false);
        } else {
          onToggleSnackBar('Internal server error', 500);
        }
        if (resCountry.success) {
          setCountryCode(resCountry.data)
        } else if (resCountry.code === 401) {
          setIsAuthenticated(false);
        } else {
          onToggleSnackBar('Internal server error', 500);
        }
      })();
    }
    return () => { };
  }, [selectedProduct.value, isFocused, countryCode]);

  const getUniqueCode = (url, format) => {
    const formatParts = format.split('/').length > 1 ? format.split('/') : format.split(' ');
    const trimFormat = formatParts.map(i=> i.trim());
    const inputParts = url.split('/')?.length > 1 ? url.split('/') : url;
    const uniqueCodeIndex = trimFormat.indexOf('uniqueCode');
    const uniqueCode = format.split('/').length > 1 ? Array.isArray(inputParts) ? inputParts[uniqueCodeIndex] : inputParts: inputParts[0].slice(-15);
    // console.log({ formatParts, trimFormat, inputParts, uniqueCodeIndex, uniqueCode });
    return uniqueCode;
  };

  const handleDropdownProductChange = async item => {
    console.log('selected Product Item in remap:-', item);
    setSelectedProduct({ value: item.value, label: item.label });
    setIsFocusProduct(false);
    setLoading(true);
    const resBatch = await fetchBatchData(item.value);
    setLoading(false);
    if (resBatch.success) {
      setBatches(resBatch.data)
    } else if (resBatch.code === 401) {
      setIsAuthenticated(false);
    } else {
      onToggleSnackBar('Internal server error', 500);
    }
  };

  const scanValidation = async barcodeData => {
    console.log('scan validation API call for remap ..');
    try {
      const payload = {
        productId: selectedProduct.value,
        batchId: selectedBatch.value,
        uniqueCode: barcodeData,
      };
      console.log('Payload for scan/validation/remap :', payload);
      const backendUrl = await AsyncStorage.getItem("BackendUrl")
      const scanRes = await axios.post(`${backendUrl}/scan/validation/remap`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('scan/validation APIs Res for Remap :', scanRes.data);
      if (scanRes.data.code === 200 && scanRes.data.success === true) {
        onToggleSnackBar(scanRes.data.message, 200);
        console.log(scanRes.data.message, 200);
        return scanRes.data;
      } else if (scanRes.data.code) {
        console.log(scanRes.data.message);
        onToggleSnackBar(scanRes.data.message, 401);
        return null;
      } else {
        console.log('error !');
      }
    } catch (error) {
      console.error('Error to scan validation API call', error);
    }
  };

  const handleRemap = () => {
    if (!selectedProduct.value || !selectedBatch.value) {
      onToggleSnackBar('Please select both product and batch.', 400);
      //Alert.alert('Error', 'Please select both product and batch.');
      return;
    }
    if (!scanCode) {
      onToggleSnackBar('Please scan or enter sscc code');
      //Alert.alert('Error', 'Please scan or enter unique code');
      return;
    }
    console.log(config.config.esign_status, !openModal);
    if (config.config.esign_status && !openModal) {
      setOpenModal(true);
      setApproveAPIName('code-remap-create');
      setApproveAPImethod('POST');
      return;
    } else {
      setVisible(true); //modal open
      console.log('Remap pressed..');
    }
  };


  const print = async () => {
    console.log('Remap success.');
    const backendUrl = await AsyncStorage.getItem("BackendUrl")
    const remapRes = await axios.post(
      `${backendUrl}/code-remap`,
      {
        product_id: selectedProduct.value,
        batch_id: selectedBatch.value,
        code: scanCode,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('Response of remap code ', remapRes.data);
    if (remapRes.data.success === true && remapRes.data.code === 200) {
      setScanCode('');
      setSelectedProduct({ value: null, label: null });
      setSelectedBatch({ value: null, label: null });
      onToggleSnackBar(remapRes.data.message, 200);
    } else {
      onToggleSnackBar(remapRes.data.message, remapRes.data.code);
    }
    hideModal();
  };

  const cancel = () => {
    console.log('remap cancel btn press ');
    setVisible(false);
    navigation.navigate('Home');
  };

  //for E-sign
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
          onToggleSnackBar('eSign has been rejected for code remap');
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
        console.log("approveAPIName ", approveAPIName, openModal)
        setOpenModal(false)
        onToggleSnackBar('eSign has been approved for code remap', 200);
        if (approveAPIName === "code-remap-create") {
          setTimeout(() => {
            setOpenModal(true)
            setApproveAPIName('code-remap-approve');
            setApproveAPImethod('POST')
          }, 1000)
          return
        }
        if (esignStatus === 'approved') {
          onToggleSnackBar('eSign has been approved for code remap', 200);
          setVisible(true);

          closeApprovalModal();
        } else {
          onToggleSnackBar('eSign has been rejected for code remap');
          if (esignStatus === 'rejected') closeApprovalModal();
        }
      } else {
        console.log('dfdfdsffxddf');
        handleEsignStatus();
      }
      resetState();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
          <Appbar.Content title="Remap" />
        </Appbar.Header>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.dropdownContainer}>
              {/* <Text variant="titleMedium" style={styles.labelText}>Product</Text> */}
              <View style={styles.containerDropdownItem}>
                <Dropdown
                  style={[styles.dropdown, { borderColor: 'rgb(80, 189, 160)' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  //iconStyle={styles.iconStyle}
                  data={products}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Product"
                  //placeholder={!isFocusProduct ? 'Select Product' : '...'}
                  //searchPlaceholder="Search..."
                  value={selectedProduct.value}
                  onFocus={() => setIsFocusProduct(true)}
                  onBlur={() => setIsFocusProduct(false)}
                  onChange={handleDropdownProductChange}
                  renderLeftIcon={() => (
                    <AntDesign
                      style={styles.icon}
                      color={isFocusProduct ? 'rgb(80, 189, 160)' : 'black'}
                      //name="Safety"
                      size={20}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.dropdownContainer}>
              {/* <Text variant="titleMedium" style={styles.labelText}>Batch</Text> */}
              <View style={styles.containerDropdownItem}>
                <Dropdown
                  style={[styles.dropdown, { borderColor: 'rgb(80, 189, 160)' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  //iconStyle={styles.iconStyle}
                  data={batches}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Batch"
                  //placeholder={!isFocusBatch ? 'Select Batch' : '...'}
                  //searchPlaceholder="Search..."
                  value={selectedBatch.value}
                  onFocus={() => setIsFocusBatch(true)}
                  onBlur={() => setIsFocusBatch(false)}
                  onChange={item => {
                    setSelectedBatch({ value: item.value, label: item.label });
                    setIsFocusBatch(false);
                  }}
                  renderLeftIcon={() => (
                    <AntDesign
                      style={styles.icon}
                      color={isFocusBatch ? 'rgb(80, 189, 160)' : 'black'}
                      //name="Safety"
                      size={20}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.txtInputStyle}>
              <Text variant="titleMedium" style={styles.labelText}>
                Scan or write a code
              </Text>
              <TextInput
                disabled={!selectedProduct?.value || !selectedBatch?.value}
                label="Enter remap  sscc code"
                value={scanCode?.toString()}
                mode="outlined"
                onChangeText={text => setScanCode(text)}
                style={styles.textInput}
                right={
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={10}
                    color="#000"
                    style={styles.iconStyleQr}
                    onPress={() => console.log('QR Code Icon Pressed')} // Optional action
                  />
                }
              />
              {/* <MaterialCommunityIcons
                name="qrcode-scan"
                size={25}
                color="#000"
                style={{paddingRight: 0}} // Optional: adjust padding
              /> */}
            </View>
          </View>
        </ScrollView>
        <View>
          <TouchableOpacity
            mode="contained"
            //labelStyle={{ fontSize: 20 }}
            style={styles.remapButton}
            onPress={handleRemap}>
            <Text style={styles.remapText}>Remap</Text>
          </TouchableOpacity>
        </View>

        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeader}>Remap</Text>
              </View>
              <Divider />
              <View style={styles.modalBody}>
                <Text style={styles.bodyTxt}>
                  Are you sure want to remap this sscc code : {scanCode}
                </Text>
              </View>
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.printbtn}
                  mode="contained"
                  onPress={print}>
                  <Text style={styles.btnText}>Remap</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelbtn}
                  mode="contained"
                  onPress={cancel}>
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Portal>
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
          style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
          {snackbarInfo.message}
        </Snackbar>
      </KeyboardAvoidingView>
    </>
  );
}
export default RemapScreen;
