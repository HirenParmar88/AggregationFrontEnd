import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
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
} from 'react-native-paper';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {url} from '../../utils/constant';
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import LoaderComponent from '../components/Loader';
import Feather from 'react-native-vector-icons/Feather';
import EsignPage from './Esign';
import {decodeAndSetConfig} from '../../utils/tokenUtils';

function DropoutFun() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [selectedBatch, setSelectedBatch] = useState({id: null, name: null});
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
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
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });
  const [openModal, setOpenModal] = useState(false);
  const [approveAPIName, setApproveAPIName] = useState();
  const [approveAPImethod, setApproveAPImethod] = useState();
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState();

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

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({
    id: null,
    name: null,
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
      console.log('Received data :', event);
      console.log('Current Scanned data :', event.data);
      console.log('Token inside barcode codes drop :', token);

      console.log('Previous data is :', scannedCodes);
      const scanRes = await scanValidation(event.data);
      if (scanRes && scanRes.code === 200) {
        setScannedCodes(prevData => {
          const uniqueCode = getUniqueCode(event.data, countryCode);
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
  }, [selectedProduct, selectedBatch]);

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

  useEffect(() => {
    const loadTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        // console.log('JWT token : ', storedToken);
        if (storedToken) {
          setToken(storedToken);
          decodeAndSetConfig(setConfig, storedToken);
          fetchProductData(storedToken);
        } else {
          throw new Error('Token is missing');
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
    if (selectedProduct.id) {
      (async () => {
        await fetchBatchData();
        await fetchCountryCode();
      })();
    }

    return () => {};
  }, [selectedProduct]);

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

          closeApprovalModal();
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
      console.log('Token is scan Validation in Dropout :', token);
      const payload = {
        productId: selectedProduct.id,
        batchId: selectedBatch.id,
        uniqueCode: barcodeData,
      };
      console.log('Payload for scan/validation :', payload);
      const scanRes = await axios.post(`${url}/scan/validation`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('scan/validation APIs Res for DropOut :', scanRes.data);

      if (scanRes.data.code === 200 && scanRes.data.success === true) {
        onToggleSnackBar(scanRes.data.message, 200);
        console.log(scanRes.data.message, 200);
        return scanRes.data;
      } else if (scanRes.data.code === 401) {
        console.log(scanRes.data.message);
        onToggleSnackBar(scanRes.data.message, 401);
        return null;
      } else if (scanRes.data.code === 500) {
        console.log(scanRes.data.message);
        onToggleSnackBar(scanRes.data.message, 500);
        return null;
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
      //   console.log('This is products Data :', products);
      if (products) {
        const fetchedProducts = products?.map(product => {
          //console.log('id ', product.id);
          return {
            id: product.id,
            name: product.product_name,
          };
        });
        // console.log('Fetched Products for Dropout :', fetchedProducts);

        setProducts(fetchedProducts);
      } else {
        console.error('No products data available');
      }
    } catch (error) {
      console.error('Error fetching Product data for dropout :', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchData = async () => {
    try {
      setLoading(true);
      console.log('product is ', selectedProduct.id);
      const batchResponse = await axios.get(
        `${url}/batch/${selectedProduct.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Batch Response :', batchResponse.data);

      if (batchResponse.data.success) {
        const fetchedBatches = batchResponse.data.data?.batches.map(batch => {
          console.log('batch id ', batch.id);
          return {
            id: batch.id,
            name: batch.batch_no,
          };
        });
        console.log('Fetched Batches for Dropout :', fetchedBatches);

        setBatches(fetchedBatches);
      } else if (batchResponse.data.code === 401) {
        await AsyncStorage.removeItem('authToken');
      } else {
        console.error('No batches data available');
      }
    } catch (error) {
      console.error('Error Fetching batch data for dropout ', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryCode = async () => {
    try {
      setLoading(true);
      console.log(selectedProduct);
      const response = await axios.get(
        `${url}/product/countrycode/${selectedProduct.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Get country code API Response :', response.data);

      if (response.data?.success === true && response.data.code === 200) {
        //onToggleSnackBar(response.data.message, 200);
        console.log('settting country code :', response.data.data.country_code);
        setCountryCode(response.data.data.country_code.toString());
      } else if (response.data.code === 401) {
        await AsyncStorage.removeItem('authToken');
      } else {
        console.error('No code data available');
      }
    } catch (error) {
      console.error('Error Fetching country code ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownProductChange = async item => {
    console.log('product id select ', item);
    setSelectedProduct({id: item.id, name: item.name});
    setBatches([]);
  };

  const handleDropdownBatchChange = item => {
    setSelectedBatch({id: item.id, name: item.name});
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
    if (!selectedProduct.id || !selectedBatch.id) {
      onToggleSnackBar('Please select both product and batch.', 400);
      //Alert.alert('Error', 'Please select both product and batch.');
      return;
    }
    // Alert.alert(
    //     "Selected Data",
    //     `Product: ${products.find(p => p.value === productId)?.label}\nBatch: ${selectedBatch.name}`,
    //     [{ text: "OK" }]
    // );
    console.log('Dropout Selected Product :', selectedProduct.id);
    console.log('Dropout Selected Batch :', selectedBatch.id);
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
    const batchDropRes = await axios.post(
      `${url}/dropout/wholebatch`,
      {
        audit_log: {
          audit_log: config?.config?.audit_logs,
          performed_action: `Dropout whole of this Product ID: ${selectedProduct?.id}, Batch ID: ${selectedBatch?.id} by User ID: ${config.userId}`,
          remarks: 'none',
        },
        product_id: selectedProduct.id,
        batch_id: selectedBatch.id,
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
      setSelectedBatch({id: null, value: null});
      setSelectedProduct({id: null, value: null});
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
    }
    const codesDropRes = await axios.post(
      `${url}/dropout/codes`,
      {
        audit_log: {
          audit_log: config?.config?.audit_logs,
          performed_action: `Dropped ${scannedCodes.length} codes for Product ID: ${selectedProduct?.id}, Batch ID: ${selectedBatch?.id}, by User ID: ${config.userId}.`,
          remarks: 'none',
        },
        product_id: selectedProduct.id,
        batch_id: selectedBatch.id,
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
      setSelectedBatch({id: null, value: null});
      setSelectedProduct({id: null, value: null});
      setDropoutReason('');
      setScannedCodes([]);
    } else if (codesDropRes.data.code === 500) {
      onToggleSnackBar(codesDropRes.data.message);
    }
    setVisibleConfirmCodes(false); // Close the confirm dropout modal
  };

  const onDropoutReasonChange = item => {
    console.log('reason to drop out....', item.value);
    setDropoutReason(item.value);
  };

  //const onToggleSnackBar = message => setSnackbarInfo({visible: true, message});

  if (loading) {
    return <LoaderComponent />;
  }

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
                labelField="name"
                valueField="id"
                placeholder={'Select Product'}
                value={selectedProduct.id}
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
                labelField="name"
                valueField="id"
                placeholder={'Select Batch'}
                value={selectedBatch.id}
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

          <Text style={styles.showResultLabel}>
            Show Results ({scannedCodes.length})
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
                Batch: {selectedBatch.name}
              </Text>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                Product: {selectedProduct.name}
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
                    if (config.config.esign_status && !openModal) {
                      setOpenModal(true);
                      setApproveAPIName('dropout-approve');
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
                  Batch: {selectedBatch.name}
                </Text>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                  Product: {selectedProduct.name}
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
                    placeholder={!isFocusP ? 'Select Batch for Dropout' : 'Select Reason'}
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
                    if (config.config.esign_status && !openModal) {
                      setOpenModal(true);
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
        <Snackbar
          visible={snackbarInfo.visible}
          onDismiss={onDismissSnackBar}
          duration={3000}
          style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
          {snackbarInfo.message}
        </Snackbar>
      </KeyboardAvoidingView>
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
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  submitView: {
    //position: 'absolute',
    //justifyContent: 'end',
    display: 'flex',
    bottom: 0,
  },
  container: {
    flex: 1,
    //backgroundColor:'red'
  },
  dropdownConfirmBatchDropoutContainer: {
    marginTop: 35,
    height: 70,
  },
  containerConfirmBatchDropoutItem: {
    padding: 10,
  },
  containerDropdownItem: {
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  submitBtn: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  btn: {
    padding: 20,
    backgroundColor: 'rgb(80, 189, 160)',
  },
  radioGroups: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioItem1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  radioItem2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 25,
  },
  confirmCodesDropoutContainer: {
    //backgroundColor:'yellow',
    //width:270,
    flex: 1,
  },
  coderDropoutModalBody:{
    //backgroundColor:'yellow',
    paddingLeft:20,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 10,
    marginTop: 5,
    alignItems: 'center',
    //backgroundColor:'red'
  },
  modalBatchHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    //marginBottom: 10,
    marginTop: 5,
    alignItems: 'center',
    //backgroundColor:'red'
  },
  modalConfirmBatchHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  modalBatchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  batchDropoutContainer: {
    //backgroundColor:'red',
    flex: 1,
  },
  modalConfirmBatchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    //color: 'red',
  },
  modalBatchContent: {
    fontSize: 18,
    fontWeight:'bold',
    //textAlign: 'center',
    marginVertical: 10,
    paddingLeft:10,
    //color:'red'
  },
  modalFooter: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalBatchFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap:5,
    //backgroundColor:'red'
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 2,
  },
  modalBatchButton: {
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 2,
  },
  confirmButton: {
    backgroundColor: 'rgb(80, 189, 160)',
  },
  cancelButton: {
    backgroundColor: '#878f99',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  icons: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
    //backgroundColor:'orange'
  },
  codesList: {
    marginVertical: 8,
    padding: 6,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 50, // Extra space from the bottom if needed
  },
  showResultLabel: {
    fontSize: 18,
    marginTop: 6,
    fontWeight: 'bold',
    paddingLeft: 8,
    //backgroundColor:'yellow'
  },
  modalCodesContent: {
    //backgroundColor: 'red',
    fontSize: 16,
    fontWeight:'bold',
  },
});

export default DropoutFun;
