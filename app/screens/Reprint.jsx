//app/components/screens/Reprint.jsx

import React, {useState, useEffect} from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Appbar,
  Text,
  TextInput,
  Modal,
  Portal,
  Divider,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import DeviceInfo from 'react-native-device-info';
import {decodeAndSetConfig} from '../../utils/tokenUtils';
import styles from '../../styles/reprint';
import EsignPage from './Esign';
import {fetchProductData, fetchBatchData} from '../components/fetchDetails';

function Reprint({route}) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [config, setConfig] = useState(null);
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
  const [visible, setVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [apiData, setApiData] = useState({
    apiName: null,
    apiMethod: null,
    apiEndpoint: null,
  });
  const {colors} = useTheme();
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
    snackbarStyle: {backgroundColor: colors.primary},
  });
  const {setIsAuthenticated} = route.params;

  const onToggleSnackBar = (message, code = 500) => {
    const backgroundColor = code !== 200 ? colors.error : colors.primary;

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: {backgroundColor},
    });
  };
  const onDismissSnackBar = () =>
    setSnackbarInfo({visible: false, message: ''});
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
          setToken(storedToken);
          decodeAndSetConfig(setConfig, storedToken);
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
          onToggleSnackBar('Token not found please login again', 500);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        setLoading(false);
      }
    };

    loadTokenAndData();

    return () => {
      setSelectedProduct({value: null, label: null});
      setSelectedBatch({value: null, label: null});
      setText('');
    };
  }, [isFocused]);

  useEffect(() => {
    console.log('Is compatible:', HoneywellBarcodeReader.isCompatible);

    HoneywellBarcodeReader.register().then(claimed => {
      console.log(
        claimed ? 'Barcode reader is claimed' : 'Barcode reader is busy',
      );
    });

    HoneywellBarcodeReader.onBarcodeReadSuccess(event => {
      console.log('Current Scanned data :', event.data);
      setText(event.data);
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

  useEffect(() => {
    const productId = selectedProduct.value;
    console.log('useffect after select product', productId);
    if (productId) {
      (async () => {
        setLoading(true);
        const resBatch = await fetchBatchData(productId);
        setLoading(false);

        if (resBatch.success) {
          setBatches(resBatch.data);
        } else if (resBatch.code === 401) {
          setIsAuthenticated(false);
        } else {
          onToggleSnackBar('Internal server error', 500);
        }
      })();
    }
    return () => {};
  }, [selectedProduct.value]);

  const getUniqueCode = (url, format) => {
    const formatParts =
      format.split('/').length > 1 ? format.split('/') : format.split(' ');
    const trimFormat = formatParts.map(i => i.trim());
    const inputParts = url.split('/');
    console.log('inputParts ', inputParts);
    console.log('trimFormat ', trimFormat);

    const uniqueCodeIndex = trimFormat.indexOf('uniqueCode');
    console.log('uniqueCodeIndex ', uniqueCodeIndex);

    const uniqueCode =
      format.split('/').length > 1
        ? inputParts[uniqueCodeIndex]
        : inputParts[0].slice(-15);
    console.log('Unique Code:', uniqueCode);
    return uniqueCode;
  };

  const handleDropdownProductChange = async item => {
    setSelectedProduct({value: item.value, label: item.label});
    setIsFocusProduct(false);
    //setBatches([]);
    console.log('selected Product Item in reprint:-', item);
    console.log('item.value Product', item.value);
    const backendUrl = await AsyncStorage.getItem('BackendUrl');
    await fetchBatchData(setBatches, setLoading, token, item.value, backendUrl);
  };

  const handleReprint = () => {
    if (!selectedProduct.value || !selectedBatch.value) {
      onToggleSnackBar('Please select both product and batch.');
      return;
    }
    if (!text) {
      onToggleSnackBar('Please scan or enter sscc code');
      return;
    }
    setVisible(true); //modal open
  };

  const print = async () => {
    //console.log('Reprint success.');
    const backendUrl = await AsyncStorage.getItem('BackendUrl');
    const reprintRes = await axios.post(
      `${backendUrl}/reprint`,
      {
        audit_log: {
          audit_log: config?.config?.audit_logs,
          performed_action: `Reprint this ${text} sscc code with Product ID: ${selectedProduct?.id}, Batch ID: ${selectedBatch?.id} by User ID: ${config.userId}`,
          remarks: 'none',
        },
        product_id: selectedProduct.value,
        batch_id: selectedBatch.value,
        SsccCode: text,
        mac_address: await DeviceInfo.getUniqueId(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('Response of reprint code ', reprintRes.data);
    if (reprintRes.data.success === true && reprintRes.data.code === 200) {
      setText('');
      setSelectedProduct({value: null, label: null});
      setSelectedBatch({value: null, label: null});
      onToggleSnackBar(reprintRes.data.message, 200);
      //navigation.navigate('Home');
    } else {
      onToggleSnackBar(reprintRes.data.message, reprintRes.data.code);
    }
    hideModal();
  };

  const cancel = () => {
    console.log('reprint cancel btn press ');
    setVisible(false);
    //navigation.navigate('Home');
  };

  const handleAuthResult = async (
    isAuthenticated,
    user,
    isApprover,
    esignStatus,
    remarks,
  ) => {
    console.log('handle auth resutl call ', {
      isAuthenticated,
      user,
      isApprover,
      esignStatus,
      remarks,
    });

    try {
      const resetState = () => {
        setApiData({apiName: null, apiMethod: null, apiEndpoint: null});
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
          await print();
        } else {
          onToggleSnackBar('E-sign rejected by approver');
          resetState();
        }
      } else {
        setOpenModal(false);
        onToggleSnackBar('E-sign approved by creater.', 200);
        setTimeout(() => {
          setApiData({
            apiName: 'reprint-approve',
            apiMethod: 'PATCH',
            apiEndpoint: '/api/v1/reprint',
          });
          setOpenModal(true);
        }, 1500);
      }
    } catch (err) {
      console.log('Error in handle esign ', err);
      onToggleSnackBar('Error to handle esign');
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor:'#fff'}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Appbar.Header style={{backgroundColor:'#fff', elevation:4}}>
          <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
          <Appbar.Content title="Reprint" />
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
                  value={selectedBatch.value}
                  onFocus={() => setIsFocusBatch(true)}
                  onBlur={() => setIsFocusBatch(false)}
                  onChange={item => {
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
                Scan or write a code
              </Text>
              <TextInput
                disabled={!selectedProduct?.value || !selectedBatch?.value}
                label="Enter sscc code for reprint"
                value={text}
                mode="outlined"
                onChangeText={text => setText(text)}
                style={styles.textInput}
              />
            </View>
          </View>
        </ScrollView>
        <View>
          <TouchableOpacity
            mode="contained"
            //labelStyle={{ fontSize: 20 }}
            style={styles.reprintButton}
            onPress={handleReprint}>
            <Text style={styles.reprintText}>Reprint</Text>
          </TouchableOpacity>
        </View>

        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeader}>Reprint</Text>
              </View>
              <Divider />
              <View style={styles.modalBody}>
                <Text style={styles.bodyTxt}>
                  Are you sure you want to reprint this code ?
                </Text>
                <Text style={styles.bodyTxt}> {text}</Text>
              </View>
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.printbtn}
                  mode="contained"
                  onPress={() => {
                    if (config.config.esign_status && !openModal) {
                      setVisible(false);
                      setOpenModal(true);
                      setApiData({
                        apiName: 'reprint-create',
                        apiMethod: 'POST',
                        apiEndpoint: '/api/v1/reprint',
                      });
                    } else {
                      print();
                    }
                  }}>
                  <Text style={styles.btnText}>Reprint</Text>
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
            apiData={apiData}
            openModal={openModal}
            setOpenModal={setOpenModal}
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
export default Reprint;
