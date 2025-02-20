//app/screens/Products.jsx
import React, {useState, useEffect} from 'react';
import {Text, View, Alert, TouchableOpacity, Image} from 'react-native';
import {Snackbar} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Dropdown} from 'react-native-element-dropdown';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import EsignPage from './Esign';
import {decodeAndSetConfig} from '../../utils/tokenUtils';
import {url} from '../../utils/constant';
import LoaderComponent from '../components/Loader';
import styles from '../../styles/aggregation';
import {fetchProductData, fetchBatchData} from '../components/fetchDetails';

function AggregationComponent() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [valueProduct, setValueProduct] = useState(null);
  const [valueBatch, setValueBatch] = useState(null);
  const [isFocusProduct, setIsFocusProduct] = useState(false);
  const [isFocusBatch, setIsFocusBatch] = useState(false);
  const [aggregateId, setAggregateId] = useState({});
  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [approveAPIName, setApproveAPIName] = useState();
  const [approveAPImethod, setApproveAPImethod] = useState();
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState();
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });

  useEffect(() => {
    const loadTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        //console.log("JWT token : ", storedToken);
        if (storedToken) {
          decodeAndSetConfig(setConfig, storedToken);
          setToken(storedToken);
          await fetchProductData(storedToken, setProducts, setLoading);
          console.log('product :-', products);
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
      setValueProduct(null);
      setValueBatch(null);
    };
  }, [isFocused]);
  const onDismissSnackBar = () =>
    setSnackbarInfo({visible: false, message: ''});

  const onToggleSnackBar = (message, code) => {
    const backgroundColor =
      code === 200 ? 'rgb(80, 189, 160)' : 'rgb(210, 43, 43)';

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: {backgroundColor},
    });
  };

  // Fetch products
  //console.log('Config :->', config);
  
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
          onToggleSnackBar('eSign has been rejected for add aggregate');
          closeApprovalModal();
        }
      };
      if (isApprover) {
        console.log('Approved is ', esignStatus === 'approved');
        if (esignStatus === 'approved') {
          onToggleSnackBar('eSign has been approved for add aggregate', 200);
          await addAggregrate('approved');

          closeApprovalModal();
        } else {
          onToggleSnackBar('eSign has been rejected for add aggregate');
          await addAggregrate('rejected');
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

  const addAggregrate = async esign_status => {
    console.log('Add Agregration....');
    console.log(valueProduct);
    console.log(valueBatch);

    const aggregationtransactionResponse = await axios.post(
      `${url}/aggregationtransaction/addaggregation`,
      {
        audit_log: {
          audit_log: config?.config?.audit_logs,
          performed_action: `Aggregation added for Product ID: ${valueProduct}, Batch ID: ${valueBatch} by User ID: ${config.userId}`,
          remarks: 'none',
        },
        productId: valueProduct,
        batchId: valueBatch,
        esign_status: esign_status,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(
      'aggregationtransactionResponse :',
      aggregationtransactionResponse,
    );
    // setAggregateId(aggregationtransactionResponse.data.data)
    // await processApproval(user,aggregationtransactionResponse.data.data.id)

    if (valueProduct && valueBatch) {
      const selectedProduct = products.find(p => p.value === valueProduct);
      const selectedBatch = batches.find(b => b.value === valueBatch);

      console.log('selected product :', selectedProduct.label);
      console.log('selected batch:', selectedBatch.label);
      console.log('PID :-', valueProduct);
      console.log('BID :-', valueBatch);
      await AsyncStorage.setItem('productId', valueProduct);
      await AsyncStorage.setItem('batchId', valueBatch);
      console.log(
        'aggregationtransactionResponse :',
        aggregationtransactionResponse.data,
      );
      console.log(aggregationtransactionResponse.data.code != 200);
      if (
        aggregationtransactionResponse.data.code != 200 &&
        aggregationtransactionResponse.data.code != 409
      ) {
        onToggleSnackBar(aggregationtransactionResponse.data.message);
      } else {
        onToggleSnackBar(aggregationtransactionResponse.data.message, 200);
        setTimeout(() => {
          navigation.navigate('ScanList');
        }, 2000);
      }
      console.log(aggregationtransactionResponse);
    } else {
      Alert.alert('Error', 'Please select both product and batch.');
    }
    resetForm();
  };

  const handleSubmit = async () => {
    console.log('Submit Product and Batch Id');
    console.log('selected valueProduct :', valueProduct);
    console.log('selected valueBatch :', valueBatch);
    console.log(config.config.esign_status, !openModal);

    if (config.config.esign_status && !openModal) {
      setOpenModal(true);
      setApproveAPIName('aggregated-transaction-create');
      setApproveAPImethod('POST');
      return;
    }
    addAggregrate('approved');
    // navigation.navigate('ScanList', {id: valueProduct, bid: valueBatch});
    setValueProduct(null);
    setValueBatch(null);
  };
  const resetForm = () => {
    setValueProduct(null);
    setValueBatch(null);
    setIsFocusProduct(false);
    setIsFocusBatch(false);
  };
  if (loading) {
    return <LoaderComponent />;
  }
  const handleDropdownProductChange = async item => {
    console.log('item.value', item.value);
    setValueProduct(item.value);
    console.log('selected Product Item :-', item);
    await fetchBatchData(setBatches, setLoading, token, item.value);
    setIsFocusProduct(false);
  };
  return (
    <>
      {/* <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
                <Appbar.Content title="Product" />
            </Appbar.Header> */}
      <View style={styles.imageView}>
        <Image
          source={require('../../assets/images/start_aggregation.png')}
          style={styles.img}
        />
      </View>
      <View>
        <Text style={styles.txt1}>Ready To Start Aggregation?</Text>
        <Text style={styles.txt1}>
          Select Your Product & Batch to Continue.
        </Text>
      </View>
      <View style={styles.container}>
        {/* {renderLabelProduct()} */}
        <View style={styles.dropdownContainer}>
          <Dropdown
            style={[styles.dropdown, {borderColor: 'rgb(80, 189, 160)'}]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            //inputSearchStyle={styles.inputSearchStyle}
            //iconStyle={styles.iconStyle}
            data={products}
            //search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select product"
            //placeholder={!isFocusProduct ? 'Select product' : '...'}
            //searchPlaceholder="Search..."
            value={valueProduct}
            //onFocus={() => setIsFocusProduct(true)}
            //onBlur={() => setIsFocusProduct(false)}
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

        {/* {renderLabelBatch()} */}
        <View style={styles.dropdownContainer}>
          <Dropdown
            style={[styles.dropdown, {borderColor: 'rgb(80, 189, 160)'}]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            //inputSearchStyle={styles.inputSearchStyle}
            //iconStyle={styles.iconStyle}
            data={batches}
            //search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select batch"
            //placeholder={!isFocusBatch ? 'Select batch' : '...'}
            //searchPlaceholder="Search..."
            value={valueBatch}
            //onFocus={() => setIsFocusBatch(true)}
            //onBlur={() => setIsFocusBatch(false)}
            onChange={item => {
              setValueBatch(item.value);
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

      <TouchableOpacity
        mode="contained"
        style={styles.btn}
        onPress={async () => {
          if (!valueBatch || !valueProduct) {
            onToggleSnackBar('Please select both product and batch.', 400);
            //Alert.alert('Error', 'Please select both product and batch.');
            return;
          }
          await handleSubmit();
        }}>
        <Text style={styles.submitBtnText}>Submit</Text>
      </TouchableOpacity>

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
        //style={styles.snackbar}>
        style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
        {snackbarInfo.message}
      </Snackbar>
    </>
  );
}

export default AggregationComponent;
