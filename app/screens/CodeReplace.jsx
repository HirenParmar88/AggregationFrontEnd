//app/components/screens/CodeReplace.jsx
import React, {useState, useEffect} from 'react';
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
} from 'react-native-paper';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {url} from '../../utils/constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import LoaderComponent from '../components/Loader';
import styles from '../../styles/codereplace';
import {decodeAndSetConfig} from '../../utils/tokenUtils';
import EsignPage from './Esign';
import {fetchProductData, fetchBatchData, fetchCountryCode} from '../components/fetchDetails';

function CodeReplaceScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({
    value: null,
    label: null,
  });
  const [selectedBatch, setSelectedBatch] = useState({value: null, label: null});
  const [isFocusProduct, setIsFocusProduct] = useState(false);
  const [isFocusBatch, setIsFocusBatch] = useState(false);
  const [products, setProducts] = useState([]);
  const [valueProduct, setValueProduct]=useState('');
  const [valueBatch, setValueBatch]=useState('');
  const [scannedCodes, setScannedCodes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [countryCode, setCountryCode] = useState(null);
  const [visible, setVisible] = useState(false);
  const [scanCode, setScanCode] = useState('');

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
  const showModal = () => setVisible(true);
  const hideModal = () => {
    // setText('');
    setVisible(false);
  };

  const containerStyle = {
    backgroundColor: 'white',
    padding: 0,
    height: 210,
    width: 280,
    marginLeft: 40,
    borderRadius: 6,
  };

  useEffect(() => {
    const resetValues = navigation.addListener('blur', () => {
      setScanCode('');
      setText('');
      setSelectedProduct(null);
      setSelectedBatch(null);
    });
    const loadTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          console.log('JWT token : ', storedToken);
          await decodeAndSetConfig(setConfig, token);
          fetchProductData(storedToken, setProducts, setLoading);
          console.log('product get in code replace:-', products);
        } else {
          throw new Error('Token is missing');
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        setLoading(false);
      }
    };
    loadTokenAndData();
    return () => {
      resetValues();
    };
  }, [isFocused]);

  useEffect(() => {
    console.log('Is compatible:', HoneywellBarcodeReader.isCompatible);
    HoneywellBarcodeReader.register().then(claimed => {
      console.log(
        claimed ? 'Barcode reader is claimed' : 'Barcode reader is busy',
      );
    });
    HoneywellBarcodeReader.onBarcodeReadSuccess(async event => {
      console.log('Current Scanned data :', event.data);
      console.log('Country code is ', countryCode);
      const uniqueCode = getUniqueCode(event.data, countryCode);
      console.log('Current Modal is visible ', visible);
      if (!visible) {
        setScanCode(uniqueCode);
      } else if (visible) {
        setText(uniqueCode);
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
  }, [countryCode, visible, scanCode, text]);

  useEffect(() => {
    //console.log(selectedProduct.value);
    if (selectedProduct?.value) {
      (async () => {
        await fetchCountryCode(
          setCountryCode,
          selectedProduct,
          setLoading,
          token,
        );
      })();
    }
    return () => {};
  }, [selectedProduct?.value, text]);

  const getUniqueCode = (url, format) => {
    const formatParts = format.split('/');
    const inputParts = url.split('/');
    console.log('formatParts ', formatParts);
    console.log('inputParts ', inputParts);

    const uniqueCodeIndex = formatParts.indexOf('uniqueCode');
    console.log('uniqueCodeIndex ', uniqueCodeIndex);

    const uniqueCode = inputParts[inputParts.length - 1];
    console.log('Unique Code:', uniqueCode);
    return uniqueCode;
  };

  const handleDropdownProductChange = async item => {
    setSelectedProduct({value: item.value, label: item.label});
    setIsFocusProduct(false);
    //await fetchBatchData(item.id);
    console.log('item.value', item.value);
    console.log('selected Product Item code replace:-', item);
    await fetchBatchData(setBatches, setLoading, token, item.value);
    console.log(item.value);
    console.log(item.label);
  };

  const handleCodeReplace = () => {
    console.log(valueProduct);
    console.log(valueBatch);
    if (!selectedProduct?.value || !selectedBatch?.value) {
      onToggleSnackBar('Please select both product and batch.', 400);
      //Alert.alert('Error', 'Please select both product and batch.');
      return;
    }
    if (!scanCode) {
      onToggleSnackBar('Please scan or enter unique code');
      //Alert.alert('Error', 'Please scan or enter unique code');
      return;
    }
    setVisible(true); //modal open
    console.log('Code Replace pressed..');
  };

  if (loading) {
    return <LoaderComponent />;
  }

  const print = async () => {
    console.log('Code Replace success.');
    console.log({
      product_id: selectedProduct.value,
      batch_id: selectedBatch.value,
      code: scanCode,
      replace_code: text,
    });
    const codereplaceRes = await axios.post(
      `${url}/code-replace`,
      {
        product_id: selectedProduct.value,
        batch_id: selectedBatch.value,
        code: scanCode,
        replace_code: text,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('Response of codereplace code ', codereplaceRes.data);
    if (
      codereplaceRes.data.success === true &&
      codereplaceRes.data.code === 200
    ) {
      setScanCode('');
      setSelectedProduct({value: null, label: null});
      setSelectedBatch({value: null, label: null});
      onToggleSnackBar(codereplaceRes.data.message, 200);
      //navigation.navigate('Home');
    } else {
      onToggleSnackBar(codereplaceRes?.data?.message);
    }
    setText('');
  };

  const cancel = () => {
    console.log('code replace cancel btn press ');
    setVisible(false);
    //navigation.navigate('Home');
  };

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
          onToggleSnackBar('eSign has been rejected for code replace');
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
          onToggleSnackBar('eSign has been approved for code replace', 200);
          await print();

          closeApprovalModal();
        } else {
          onToggleSnackBar('eSign has been rejected for code replace');
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

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
          <Appbar.Content title="Code Replace" />
        </Appbar.Header>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.dropdownContainer}>
              {/* <Text variant="titleMedium" style={styles.labelText}>Product</Text> */}
              <View style={styles.containerDropdownItem}>
                <Dropdown
                  style={[styles.dropdown, {borderColor: 'rgb(80, 189, 160)'}]}
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
                  value={selectedProduct?.value}
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
                  style={[styles.dropdown, {borderColor: 'rgb(80, 189, 160)'}]}
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
                  value={selectedBatch?.value}
                  onFocus={() => setIsFocusBatch(true)}
                  onBlur={() => setIsFocusBatch(false)}
                  onChange={item => {
                    console.log("Batch",item);
                    console.log("Batch",item.value);
                    console.log("Batch",item.label);
                    setSelectedBatch({value: item.value, label: item.label});
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
                Enter or Scan code to replace
              </Text>
              <TextInput
                disabled={!selectedProduct?.value || !selectedBatch?.value}
                label="Enter or Scan code"
                value={scanCode || ''}
                mode="outlined"
                onChangeText={text => setScanCode(text)}
                style={styles.textInput}
                onFocus={() => setScannedCodes('')}
              />
            </View>
          </View>
        </ScrollView>
        <View>
          <TouchableOpacity
            mode="contained"
            //labelStyle={{ fontSize: 20 }}
            style={styles.codeReplaceButton}
            onPress={handleCodeReplace}>
            <Text style={styles.codeReplaceText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderText}>Code Replace</Text>
              </View>
              <Divider />
              <View style={styles.modalBody}>
                <View style={styles.txtInputStyle}>
                  {/* <Text variant="titleMedium" style={styles.labelText}>
                    Scan or replace code
                  </Text> */}
                  <TextInput
                    label="Scan Replace Code"
                    value={text || ''}
                    mode="outlined"
                    onChangeText={text => setText(text)}
                    style={styles.textInput}
                  />
                </View>
              </View>
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.codeReplaceModalBtn}
                  mode="contained"
                  onPress={async () => {
                    console.log("Text ",text)

                    console.log(config.config.esign_status, !openModal);
                    hideModal();
                    if (config.config.esign_status && !openModal) {
                      setOpenModal(true);
                      setApproveAPIName('codeReplace-approve');
                      setApproveAPImethod('POST');
                      return;
                    }
                    await print();
                  }}>
                  <Text style={styles.codeReplaceModalBtnText}>Submit</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  style={styles.cancelbtn}
                  mode="contained"
                  onPress={cancel}>
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity> */}
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
export default CodeReplaceScreen;
