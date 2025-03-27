import React, {useState, useEffect} from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Appbar,
  Text,
  RadioButton,
  List,
  Modal,
  Portal,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import Feather from 'react-native-vector-icons/Feather';
import EsignPage from './Esign';
import {decodeAndSetConfig} from '../../utils/tokenUtils';
import styles from '../../styles/dropout';
import {
  fetchProductData,
  fetchBatchData,
  fetchCountryCode,
} from '../components/fetchDetails';
import { useLoading } from '../../context/LoadingContext';

function DropoutFun({ route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [selectedBatch, setSelectedBatch] = useState({
    value: null,
    label: null,
  });
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const { setLoading } = useLoading();
  const [wholeBatch, setWholeBatch] = useState(true);
  const [dropoutReason, setDropoutReason] = useState('');
  const [isFocusP, setIsFocusP] = useState([]);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [countryCode, setCountryCode] = useState(null);
  const [visibleBatch, setVisibleBatch] = useState(false);
  const [visibleCodes, setVisibleCodes] = useState(false);
  const [visibleConfirmBatch, setVisibleConfirmBatch] = useState(false);
  const [visibleConfirmCodes, setVisibleConfirmCodes] = useState(false); // Added for Codes Dropout Confirmation
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(undefined);
  const { colors } = useTheme();
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
    snackbarStyle: { backgroundColor: colors.primary }
  });
  const [openModal, setOpenModal] = useState(false);
  const [approveAPIName, setApproveAPIName] = useState();
  const [approveAPImethod, setApproveAPImethod] = useState();
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState();
  const { setIsAuthenticated } = route.params;

  const onToggleSnackBar = (message, code=500) => {
    const backgroundColor = code !== 200 ? colors.error : colors.primary;

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: {backgroundColor},
    });
  };
  const onDismissSnackBar = () =>
    setSnackbarInfo({visible: false, message: ''});
  const [token, setToken] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({
    value: null,
    label: null,
  });

  const containerStyle = {
    backgroundColor: 'white',
    height: 250,
    width: 250,
    marginLeft: 54,
    borderRadius: 6,
    display: 'grid',
    alignContent: 'space-between',
    display: 'flex',
    justifyContent: 'row',
    // alignItems:'center'
  };

  const dataConfirmDropout = [
    {label: 'Damage', value: 'Damage'},
    {label: 'Defect', value: 'Defect'},
    {label: 'Expired Good', value: 'Expired Good'},
    {label: 'QA-Sample', value: 'QA-Sample'},
    {label: 'Product-Recall', value: 'Product-Recall'},
    {label: 'Market Complaint', value: 'Market Complaint'},
    {label: 'Product Testing', value: 'Product Testing'},
    {label: 'Demo-Sample', value: 'Demo-Sample'},
  ];

  useEffect(() => {
    console.log('Is compatible:', HoneywellBarcodeReader.isCompatible);
    HoneywellBarcodeReader.register().then(claimed => {
      console.log(
        claimed ? 'Barcode reader is claimed' : 'Barcode reader is busy',
      );
    });
    HoneywellBarcodeReader.onBarcodeReadSuccess(async event => {
      console.log('Current Scanned data :', event.data);
      console.log('countryCode ### ', countryCode);
      if (countryCode) {
        const uniqueCode = getUniqueCode(event.data, countryCode);
        console.log('Unique data is :', uniqueCode);
        if (uniqueCode) {
          const scanRes = await scanValidation(uniqueCode);
          if (scanRes && scanRes.code === 200) {
            setScannedCodes(prevData => {
              const alreadyExist = prevData.find(item => item === uniqueCode);
              if (!alreadyExist) {
                // onToggleSnackBar("scanned successfully..",200)
                return [...prevData, uniqueCode];
              } else {
                console.log('Already exitst...');
                onToggleSnackBar('Items Already Exists!', 400);
                //Alert.alert('Items Already Exists!');
                return [...prevData];
              }
            });
          }
        }
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
  }, [countryCode, selectedProduct, selectedBatch]);

  const getUniqueCode = (url, format) => {
    const formatParts = format.split('/').length > 1 ? format.split('/') : format.split(' ');
    const trimFormat = formatParts.map(i=> i.trim());
    const inputParts = url.split('/')?.length > 1 ? url.split('/') : url;
    const uniqueCodeIndex = trimFormat.indexOf('uniqueCode');
    const uniqueCode = format.split('/').length > 1 ? Array.isArray(inputParts) ? inputParts[uniqueCodeIndex] : inputParts: inputParts[0].slice(-15);
    // console.log({ formatParts, trimFormat, inputParts, uniqueCodeIndex, uniqueCode });
    return uniqueCode;
  };

  useEffect(() => {
    const loadTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        // console.log('JWT token : ', storedToken);
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
          console.log('product get in dropout Page :-', products);
        } else {
          onToggleSnackBar('Token not found please login again', 500);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        setLoading(false);
      }
    };
    if (isFocused) {
      loadTokenAndData();
    }
    return () => {};
  }, [isFocused]);

  useEffect(() => {
    if (selectedProduct.value) {
      (async () => {
        setLoading(true);
        const resBatch = await fetchBatchData(selectedProduct.value);
        const resCountry = await fetchCountryCode(selectedProduct.value);
        setLoading(false);
        if (resBatch.success) {
          setBatches(resBatch.data);
        } else if (resBatch.code === 401) {
          setIsAuthenticated(false);
        } else {
          onToggleSnackBar("Internal server error", 500);
        }
        if (resCountry.success) {
          setCountryCode(resCountry.data)
        } else if (resCountry.code === 401) {
          setIsAuthenticated(false);
        } else {
          onToggleSnackBar("Internal server error", 500);
        }
      })();
    }

    return () => {};
  }, [selectedProduct, countryCode]);

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
      const resetState = () => {
        setApproveAPIName('');
        setApproveAPImethod('');
        setApproveAPIEndPoint('');
        setOpenModal(false);
      };
      const closeApprovalModal = () => setOpenModal(false);
      if (!isAuthenticated) {
        onToggleSnackBar('Authentication failed, Please try again.', 400);
        //Alert.alert('Authentication failed, Please try again.');
        resetState();
        return;
      }

      const handleEsignStatus = async () => {
        if (esignStatus === 'rejected') {
          if (wholeBatch) {
            await handleConfirmBatchDropout('rejected');
          } else {
            await handleConfirmCodesDropout('rejected');
          }
          closeApprovalModal();
        }
      };
      if (isApprover) {
        console.log('Approved is ', esignStatus === 'approved');
        if (esignStatus === 'approved') {
          console.log('approveAPIName ', approveAPIName, openModal);
          setOpenModal(false);
          onToggleSnackBar(
            'eSign has been approved for dropout whole batch',
            200,
          );
          if (approveAPIName === 'dropout-create') {
            setTimeout(() => {
              setOpenModal(true);
              setApproveAPIName('dropout-approve');
              setApproveAPImethod('POST');
            }, 1000);
            return;
          }
          if (wholeBatch) {
            onToggleSnackBar(
              'eSign has been approved for dropout whole batch',
              200,
            );
            await handleConfirmBatchDropout('approved');
          } else {
            onToggleSnackBar(
              'eSign has been approved for dropout code scan',
              200,
            );
            await handleConfirmCodesDropout('approved');
          }
        } else {
          if (esignStatus === 'rejected') {
            if (wholeBatch) {
              onToggleSnackBar(
                'eSign has been rejected for dropout whole batch',
              );
              await handleConfirmBatchDropout('rejected');
            } else {
              onToggleSnackBar('eSign has been rejected for dropout code scan');
              await handleConfirmCodesDropout('rejected');
            }
            closeApprovalModal();
          }
        }
      } else {
        handleEsignStatus();
      }
      resetState();
    } catch (err) {
      console.log(err);
    }
  };

  //scan Validation API
  const scanValidation = async barcodeData => {
    console.log('scan validation API call for dropout ..');
    try {
      const payload = {
        productId: selectedProduct.value,
        batchId: selectedBatch.value,
        uniqueCode: barcodeData,
      };
      console.log('Payload for scan/validation/dropout :', payload);
      const backendUrl = await AsyncStorage.getItem('BackendUrl');
      const scanRes = await axios.post(
        `${backendUrl}/scan/validation/dropout`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('scan/validation APIs Res for DropOut :', scanRes.data);
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

  const handleDropdownProductChange = async item => {
    console.log('product id select ', item);
    setSelectedProduct({value: item.value, label: item.label});
    setLoading(true);
    const resBatch = await fetchBatchData(item.value);
    setLoading(false);
    if (resBatch.success) {
      setBatches(resBatch.data);
    } else if (resBatch.code === 401) {
      setIsAuthenticated(false);
    } else {
      onToggleSnackBar("Internal server error", 500);
    }
  };

  const handleDropdownBatchChange = item => {
    setSelectedBatch({value: item.value, label: item.label});
  };

  const radioBatchDropout = () => {
    console.log('radio btn batch dropout');
    setWholeBatch(true);
  };

  const radioCodesDropout = () => {
    console.log('radio btn codes dropout');
    setWholeBatch(false);
  };

  const handleSubmit = () => {
    if (!selectedProduct.value || !selectedBatch.value) {
      onToggleSnackBar('Please select both product and batch.', 400);
      return;
    }
    console.log('Dropout Selected Product :', selectedProduct.value);
    console.log('Dropout Selected Batch :', selectedBatch.value);
    console.log('Radio Item selected :', wholeBatch ? 'Batch' : 'code');
    if (wholeBatch) {
      setVisibleBatch(true);
    } else {
      scannedCodes?.length > 0
        ? setVisibleCodes(true)
        : onToggleSnackBar('Please scan code for dropout.');
    }
  };

  const handleBatchDropout = () => {
    console.log('Batch Dropout Confirmed!!');
    setVisibleBatch(false); // Hide the Batch modal
    setVisibleConfirmBatch(true); // Show Confirm Batch Dropout Modal
  };

  const handleConfirmBatchDropout = async esign_status => {
    console.log('Batch dropout confirmed in final step!');
    if (!dropoutReason) {
      onToggleSnackBar('Select dropout reason');
    }
    const backendUrl = await AsyncStorage.getItem('BackendUrl');
    const batchDropRes = await axios.post(
      `${backendUrl}/dropout/wholebatch`,
      {
        audit_log: {
          audit_log: config?.config?.audit_logs,
          performed_action: `Dropout whole of this Product ID: ${selectedProduct?.value}, Batch ID: ${selectedBatch?.value} by User ID: ${config.userId}`,
          remarks: 'none',
        },
        product_id: selectedProduct.value,
        batch_id: selectedBatch.value,
        dropout_reason: dropoutReason,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('Response of batch dropout ', batchDropRes.data);
    if (batchDropRes.data.success === true && batchDropRes.data.code === 200) {
      onToggleSnackBar(batchDropRes.data.message, 200);
      setDropoutReason('');
      setSelectedBatch({value: null, label: null});
      setSelectedProduct({value: null, label: null});
    } else if (batchResponse.data.code === 401) {
      await AsyncStorage.removeItem('authToken');
    }
    setVisibleConfirmBatch(false);
  };

  const handleCodesDropout = () => {
    // console.log('Codes Dropout Confirmed!!');
    setDropoutReason('');
    setVisibleCodes(false); // Hide the Codes modal
    setVisibleConfirmCodes(true); // Show Confirm Codes Dropout Modal
  };

  const handleConfirmCodesDropout = async () => {
    console.log('Codes dropout confirmed in final step!');
    if (!dropoutReason) {
      onToggleSnackBar('Select dropout reason');
      return;
    }
    const backendUrl = await AsyncStorage.getItem('BackendUrl');
    const codesDropRes = await axios.post(
      `${backendUrl}/dropout/codes`,
      {
        audit_log: {
          audit_log: config?.config?.audit_logs,
          performed_action: `Dropped ${scannedCodes.length} codes for Product ID: ${selectedProduct?.value}, Batch ID: ${selectedBatch?.value}, by User ID: ${config.userId}.`,
          remarks: 'none',
        },
        product_id: selectedProduct.value,
        batch_id: selectedBatch.value,
        dropout_reason: dropoutReason,
        dropoutCodes: scannedCodes,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('Response of codes dropout: ', codesDropRes.data);
    if (codesDropRes.data.success && codesDropRes.data.code === 200) {
      onToggleSnackBar(codesDropRes.data.message, 200);
      setSelectedBatch({value: null, label: null});
      setSelectedProduct({value: null, label: null});
      setDropoutReason('');
      setScannedCodes([]);
    } else if (codesDropRes.data.code === 500) {
      onToggleSnackBar(codesDropRes.data.message);
    }
    setVisibleConfirmCodes(false);
  };

  const onDropoutReasonChange = item => {
    console.log('reason to drop out....', item.value);
    setDropoutReason(item.value);
  };


  return (
    <>
      <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
          <Appbar.Content title="Dropout" />
        </Appbar.Header>

        <View style={styles.container}>
          {/* Product Dropdown */}
          <View style={styles.dropdownContainer}>
            <View style={styles.containerDropdownItem}>
              <Dropdown
                style={[styles.dropdown, {borderColor: 'rgb(80, 189, 160)'}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={products}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'Select Product'}
                value={selectedProduct.value}
                onChange={handleDropdownProductChange}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={'rgb(80, 189, 160)'}
                    size={20}
                  />
                )}
              />
            </View>
          </View>

          {/* Batch Dropdown */}
          <View style={styles.dropdownContainer}>
            <View style={styles.containerDropdownItem}>
              <Dropdown
                style={[styles.dropdown, {borderColor: 'rgb(80, 189, 160)'}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={batches}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={'Select Batch'}
                value={selectedBatch.value}
                onChange={handleDropdownBatchChange}
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color={'rgb(80, 189, 160)'}
                    size={20}
                  />
                )}
              />
            </View>
          </View>

          {/* Radio Buttons for Batch and Codes */}
          <View style={styles.radioGroups}>
            <View style={styles.radioItem1}>
              <RadioButton
                value="batch"
                status={wholeBatch ? 'checked' : 'unchecked'}
                onPress={radioBatchDropout}
              />
              <Text style={{fontSize: 16}}>Batch Dropout</Text>
            </View>
            <View style={styles.radioItem2}>
              <RadioButton
                value="codes"
                status={!wholeBatch ? 'checked' : 'unchecked'}
                onPress={radioCodesDropout}
              />
              <Text style={{fontSize: 16}}>Codes Dropout</Text>
            </View>
          </View>
          {!wholeBatch && (
            <>
              <Text style={styles.showResultLabel}>
                {' '}
                Total Scan Results ({scannedCodes.length})
              </Text>

              <ScrollView>
                {!wholeBatch && (
                  <List.Section style={{flexDirection: 'column-reverse'}}>
                    {scannedCodes.map((item, index) => (
                      <List.Item
                        key={index}
                        title={item}
                        left={() => (
                          <Feather
                            name="package"
                            size={25}
                            style={{marginLeft: 5}}
                          />
                        )}
                      />
                    ))}
                  </List.Section>
                )}
              </ScrollView>
            </>
          )}
        </View>

        <View style={styles.submitView}>
          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.submitBtn}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Batch Dropout */}
        <Portal>
          <Modal
            visible={visibleBatch}
            onDismiss={() => setVisibleBatch(false)}
            contentContainerStyle={containerStyle}>
            <View style={styles.modalBatchHeader}>
              <Text style={styles.modalBatchTitle}>Batch Dropout</Text>
            </View>
            <Text style={styles.modalBatchContent}>
              Are you sure you want to dropout?
            </Text>
            <View style={{padding: 10}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                Batch: {selectedBatch.label}
              </Text>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                Product: {selectedProduct.label}
              </Text>
            </View>
            <View style={styles.modalBatchFooter}>
              <TouchableOpacity
                style={[styles.modalBatchButton, styles.confirmButton]}
                onPress={handleBatchDropout}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBatchButton, styles.cancelButton]}
                onPress={() => setVisibleBatch(false)}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>

        {/* Modal for Confirm Batch Dropout */}
        <Portal>
          <Modal
            visible={visibleConfirmBatch}
            onDismiss={() => setVisibleConfirmBatch(false)}
            contentContainerStyle={containerStyle}>
            <View style={styles.batchDropoutContainer}>
              <View style={styles.modalConfirmBatchHeader}>
                <Text style={styles.modalConfirmBatchTitle}>
                  Confirm Batch Dropout
                </Text>
              </View>
              {/* <Text style={styles.modalContent}>Are you sure you want to confirm the dropout for Batch {valueB}?</Text> */}

              <View style={styles.dropdownConfirmBatchDropoutContainer}>
                <View style={styles.containerConfirmBatchDropoutItem}>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocusP && {borderColor: 'rgb(80, 189, 160)'},
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={dataConfirmDropout}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={
                      !isFocusP ? 'Select Batch for Dropout' : 'select reason'
                    }
                    value={dropoutReason}
                    onFocus={() => setIsFocusP(true)}
                    onBlur={() => setIsFocusP(false)}
                    onChange={onDropoutReasonChange}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusP ? 'rgb(80, 189, 160)' : 'black'}
                        size={20}
                      />
                    )}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={async () => {
                    setVisibleConfirmBatch(false);
                    if (config.config.esign_status && !openModal) {
                      setOpenModal(true);
                      setApproveAPIName('dropout-create');
                      setApproveAPImethod('POST');
                      return;
                    }
                    await handleConfirmBatchDropout('approved');
                  }}>
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Portal>

        {/* Modal for Codes Dropout */}
        <Portal>
          <Modal
            visible={visibleCodes}
            onDismiss={() => setVisibleCodes(false)}
            contentContainerStyle={containerStyle}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Codes Dropout</Text>
            </View>

            <View style={styles.coderDropoutModalBody}>
              <Text style={styles.modalCodesContent}>
                Are you sure you want to dropout?
              </Text>
              <View style={{paddingTop: 25}}>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                  Batch: {selectedBatch.label}
                </Text>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                  Product: {selectedProduct.label}
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCodesDropout}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>

        {/* Modal for Confirm Codes Dropout */}
        <Portal>
          <Modal
            visible={visibleConfirmCodes}
            onDismiss={() => setVisibleConfirmCodes(false)}
            contentContainerStyle={containerStyle}>
            <View style={styles.confirmCodesDropoutContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm Codes Dropout</Text>
              </View>
              <View style={styles.dropdownConfirmBatchDropoutContainer}>
                <View style={styles.containerConfirmBatchDropoutItem}>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocusP && {borderColor: 'rgb(80, 189, 160)'},
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={dataConfirmDropout}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={
                      !isFocusP ? 'Select Batch for Dropout' : 'Select Reason'
                    }
                    value={dropoutReason}
                    onFocus={() => setIsFocusP(true)}
                    onBlur={() => setIsFocusP(false)}
                    onChange={onDropoutReasonChange}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocusP ? 'rgb(80, 189, 160)' : 'black'}
                        size={20}
                      />
                    )}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={async () => {
                    setVisibleConfirmCodes(false);
                    if (config.config.esign_status && !openModal) {
                      setOpenModal(true);
                      setApproveAPIName('dropout-create');
                      setApproveAPImethod('POST');
                      return;
                    }
                    await handleConfirmCodesDropout('approved');
                  }}>
                  <Text style={styles.modalButtonText}>Confirm</Text>
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

export default DropoutFun;
