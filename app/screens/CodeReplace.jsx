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

function CodeReplaceScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({
    id: null,
    name: null,
  });
  const [selectedBatch, setSelectedBatch] = useState({id: null, name: null});
  const [isFocusProduct, setIsFocusProduct] = useState(false);
  const [isFocusBatch, setIsFocusBatch] = useState(false);
  const [products, setProducts] = useState([]);
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
          fetchProductData(storedToken);
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
      // console.log('Current Scanned data :', event.data);
      // console.log('Country code is ', countryCode);
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
    if (selectedProduct?.id) {
      (async () => {
        await fetchCountryCode();
      })();
    }
    return () => {};
  }, [selectedProduct?.id, text]);

  const fetchProductData = async token => {
    try {
      setLoading(true);
      const productResponse = await axios.get(`${url}/product/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const {products} = productResponse.data.data; //destructuring objects
      console.log('products ', products);
      //console.log('This is products Data :', products)
      //console.log("ProductID :-", products[0].product_id);

      if (products) {
        //console.log("Dropdown Products :", products)
        const fetchedProducts = products.map(product => ({
          name: product.product_name,
          id: product.id,
        }));
        // console.log("value :",value);
        setProducts(fetchedProducts);
      } else {
        console.error('No products data available');
      }
    } catch (error) {
      console.error('Error fetching Product data for Code Replace :', error);
    } finally {
      setLoading(false);
    }
  };

  console.log(selectedBatch);
  const fetchBatchData = async product_id => {
    try {
      setLoading(true);
      const batchResponse = await axios.get(`${url}/batch/${product_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Batch Response :', batchResponse.data);

      if (batchResponse?.data?.success) {
        const fetchedBatches = batchResponse.data.data?.batches?.map(batch => {
          console.log('batch id ', batch.id);
          return {
            id: batch.id,
            name: batch.batch_no,
          };
        });
        console.log(fetchedBatches);
        setBatches(fetchedBatches);
        //console.log("Store for select :", batches)
      } else {
        console.error('No batches data available');
      }
    } catch (error) {
      console.error('Error Fetching batch data for Code Replace ', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryCode = async () => {
    try {
      setLoading(true);
      console.log('token in c ', token);
      const response = await axios.get(
        `${url}/product/countrycode/${selectedProduct.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Get country code Response :', response.data);

      if (response.data?.success) {
        console.log('settting country code ', response.data.data.country_code);
        setCountryCode(response.data.data.country_code.toString());
      } else {
        console.error('No coutryt code data available');
      }
    } catch (error) {
      console.error('Error Fetching country code ', error);
    } finally {
      setLoading(false);
    }
  };

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
    setSelectedProduct({id: item.id, name: item.name});
    setIsFocusProduct(false);
    await fetchBatchData(item.id);
  };

  const handleCodeReplace = () => {
    if (!selectedProduct?.id || !selectedBatch?.id) {
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
      product_id: selectedProduct.id,
      batch_id: selectedBatch.id,
      code: scanCode,
      replace_code: text,
    });
    const codereplaceRes = await axios.post(
      `${url}/code-replace`,
      {
        product_id: selectedProduct.id,
        batch_id: selectedBatch.id,
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
      setSelectedProduct({id: null, name: null});
      setSelectedBatch({id: null, name: null});
      onToggleSnackBar(codereplaceRes.data.message, 200);
      //navigation.navigate('Home');
    } else {
      onToggleSnackBar(codereplaceRes?.data?.message);
    }
    setText('')
    
  };

  const cancel = () => {
    console.log('code replace cancel btn press ');
    setVisible(false);
    navigation.navigate('Home');
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
                  labelField="name"
                  valueField="id"
                  placeholder="Select Product"
                  //placeholder={!isFocusProduct ? 'Select Product' : '...'}
                  //searchPlaceholder="Search..."
                  value={selectedProduct?.id}
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
                  labelField="name"
                  valueField="id"
                  placeholder="Select Batch"
                  //placeholder={!isFocusBatch ? 'Select Batch' : '...'}
                  //searchPlaceholder="Search..."
                  value={selectedBatch?.id}
                  onFocus={() => setIsFocusBatch(true)}
                  onBlur={() => setIsFocusBatch(false)}
                  onChange={item => {
                    console.log(item);
                    setSelectedBatch({id: item.id, name: item.name});
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
                disabled={!selectedProduct?.id || !selectedBatch?.id}
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
