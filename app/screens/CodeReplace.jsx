import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
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
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import LoaderComponent from '../components/Loader';
import styles from '../../styles/codereplace';
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import EsignPage from './Esign';
import { fetchProductData, fetchBatchData, fetchCountryCode } from '../components/fetchDetails';


function CodeReplaceScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({ value: null, label: null });
  const [selectedBatch, setSelectedBatch] = useState({ value: null, label: null });
  const [isFocusProduct, setIsFocusProduct] = useState(false);
  const [isFocusBatch, setIsFocusBatch] = useState(false);
  const [products, setProducts] = useState([]);
  const [valueProduct, setValueProduct] = useState('');
  const [valueBatch, setValueBatch] = useState('');
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
  const [snackbarInfo, setSnackbarInfo] = useState({ visible: false, message: '' });

  const onToggleSnackBar = (message, code) => {
    const backgroundColor = code === 200 ? 'rgb(80, 189, 160)' : 'rgb(210, 43, 43)';
    setSnackbarInfo({ visible: true, message, snackbarStyle: { backgroundColor } });
  };

  const onDismissSnackBar = () => setSnackbarInfo({ visible: false, message: '' });
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

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
          await decodeAndSetConfig(setConfig, storedToken);
          const backendUrl = await AsyncStorage.getItem("BackendUrl")
          console.log(backendUrl)
          await fetchProductData(storedToken, setProducts, setLoading, backendUrl);
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
    HoneywellBarcodeReader.register().then((claimed) => {
      console.log(claimed ? 'Barcode reader is claimed' : 'Barcode reader is busy');
    });

    HoneywellBarcodeReader.onBarcodeReadSuccess(async (event) => {
      const uniqueCode = getUniqueCode(event.data, countryCode);
      if (!visible) {
        setScanCode(uniqueCode);
      } else if (visible) {
        setText(uniqueCode);
      }
    });

    HoneywellBarcodeReader.onBarcodeReadFail(() => console.log('Barcode read failed'));
    HoneywellBarcodeReader.onTriggerStateChange((state) => console.log('onTriggerStateChange', state));
    HoneywellBarcodeReader.barcodeReaderInfo((details) => console.log('barcodeReaderClaimed', details));

    return () => { };
  }, [countryCode, visible]);

  useEffect(() => {
    if (selectedProduct?.value) {
      (async () => {
        const backendUrl = await AsyncStorage.getItem('BackendUrl')
        await fetchCountryCode(setCountryCode, selectedProduct, setLoading, token, backendUrl);
      })();
    }
  }, [selectedProduct?.value]);

  const getUniqueCode = (url, format) => {
    const formatParts = format.split('/');
    const inputParts = url.split('/');
    const uniqueCodeIndex = formatParts.indexOf('uniqueCode');
    const uniqueCode = inputParts[inputParts.length - 1];
    return uniqueCode;
  };

  const handleDropdownProductChange = async (item) => {
    setSelectedProduct({ value: item.value, label: item.label });
    setIsFocusProduct(false);
    const backendUrl = await AsyncStorage.getItem('BackendUrl')
    await fetchBatchData(setBatches, setLoading, token, item.value, backendUrl);
  };

  const handleCodeReplace = () => {
    if (!selectedProduct?.value || !selectedBatch?.value) {
      onToggleSnackBar('Please select both product and batch.', 400);
      return;
    }
    if (!scanCode) {
      onToggleSnackBar('Please scan or enter unique code');
      return;
    }
    setVisible(true);
  };

  if (loading) {
    return <LoaderComponent />;
  }

  const codeReplace = async () => {
    try {
      const backendUrl = await AsyncStorage.getItem('BackendUrl')
      const codereplaceRes = await axios.post(
        `${backendUrl}/code-replace`,
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
        }
      );
      if (codereplaceRes.data.success === true && codereplaceRes.data.code === 200) {
        setScanCode('');
        setSelectedProduct({ value: null, label: null });
        setSelectedBatch({ value: null, label: null });
        onToggleSnackBar(codereplaceRes.data.message, 200);
      } else {
        onToggleSnackBar(codereplaceRes?.data?.message);
      }
      setText('');
    } catch (error) {
      // console.error('Code replace failed:', error);
      onToggleSnackBar('An error occurred while processing your request.' + error.message);
    }
  };

  const cancel = () => {
    setVisible(false);
  };

  const handleAuthResult = async (
    isAuthenticated,
    user,
    isApprover,
    esignStatus,
    remarks,
    eSignStatusId
  ) => {
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
          401
        );
      }
    };

    if (isApprover) {
      onToggleSnackBar('eSign has been approve for code replace', 200);
      if (approveAPIName === "code-replace-create") {
        setTimeout(() => {
          setOpenModal(true)
          setApproveAPIName('code-replace-approve');
          setApproveAPImethod('POST')
        }, 1000)
        return
      }
      if (esignStatus === 'approved') {
        await codeReplace();
        closeApprovalModal();
      } else {
        onToggleSnackBar('eSign has been rejected for code replace');
        closeApprovalModal();
      }
    } else {
      handleEsignStatus();
    }
    resetState();
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
          <Appbar.Content title="Code Replace" />
        </Appbar.Header>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.dropdownContainer}>
              <View style={styles.containerDropdownItem}>
                <Dropdown
                  style={[styles.dropdown, { borderColor: 'rgb(80, 189, 160)' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  data={products}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Product"
                  value={selectedProduct?.value}
                  onFocus={() => setIsFocusProduct(true)}
                  onBlur={() => setIsFocusProduct(false)}
                  onChange={handleDropdownProductChange}
                  renderLeftIcon={() => (
                    <AntDesign
                      style={styles.icon}
                      color={isFocusProduct ? 'rgb(80, 189, 160)' : 'black'}
                      size={20}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.dropdownContainer}>
              <View style={styles.containerDropdownItem}>
                <Dropdown
                  style={[styles.dropdown, { borderColor: 'rgb(80, 189, 160)' }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  data={batches}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Batch"
                  value={selectedBatch?.value}
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
            style={styles.codeReplaceButton}
            onPress={handleCodeReplace}
          >
            <Text style={styles.codeReplaceText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <Portal>
          <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderText}>Code Replace</Text>
              </View>
              <Divider />
              <View style={styles.modalBody}>
                <View style={styles.txtInputStyle}>
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
                    hideModal();

                    if (config.config.esign_status && !openModal) {
                      setOpenModal(true);
                      setApproveAPIName('code-replace-create');
                      setApproveAPImethod('POST');
                      return;
                    }
                    await codeReplace();
                  }}
                >
                  <Text style={styles.codeReplaceModalBtnText}>Submit</Text>
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
          style={[styles.snackbar, snackbarInfo.snackbarStyle]}
        >
          {snackbarInfo.message}
        </Snackbar>
      </KeyboardAvoidingView>
    </>
  );
}

export default CodeReplaceScreen;
