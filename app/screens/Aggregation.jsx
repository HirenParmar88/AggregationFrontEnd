//app/screens/Products.jsx
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import EsignPage from './Esign';
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import styles from '../../styles/aggregation';
import { fetchProductData, fetchBatchData, fetchCountryCode } from '../components/fetchDetails';
import { useLoading } from '../../context/LoadingContext';

function AggregationComponent({ route }) {
  const { setLoading } = useLoading();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [valueProduct, setValueProduct] = useState(null);
  const [valueBatch, setValueBatch] = useState(null);
  const [isFocusProduct, setIsFocusProduct] = useState(false);
  const [isFocusBatch, setIsFocusBatch] = useState(false);
  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [token, setToken] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [apiData, setApiData] = useState({ apiName: null, apiMethod: null, apiEndpoint: null });
  const { colors } = useTheme();
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
    snackbarStyle: { backgroundColor: colors.primary }
  });
  const [countryCode, setCountryCode] = useState(null);
  const { setIsAuthenticated } = route.params;

  useEffect(() => {
    const loadTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        //console.log("JWT token : ", storedToken);
        if (storedToken) {
          decodeAndSetConfig(setConfig, storedToken);
          setToken(storedToken);
          setLoading(true);
          const resProd = await fetchProductData();
          if (resProd.success) {
            setProducts(resProd.data)
          } else if (resProd.code === 401) {
            console.log('navigate to login');
            setIsAuthenticated(false);
          } else {
            onToggleSnackBar("Internal server error", 401);
          }
          setLoading(false);
        } else {
          onToggleSnackBar("Token not found please login again", 401);
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
    setSnackbarInfo({ visible: false, message: '' });

  const onToggleSnackBar = (message, code=500) => {
    const backgroundColor = code !== 200 ? colors.error : colors.primary;

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: { backgroundColor },
    });
  };

  const handleAuthResult = async (
    isAuthenticated,
    user,
    isApprover,
    esignStatus,
    remarks,
  ) => {
    console.log("handle auth resutl call ", { isAuthenticated, user, isApprover, esignStatus, remarks });
    
    try {
      const resetState = () => {
        setApiData({ apiName: null, apiMethod: null, apiEndpoint: null });
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
          await addAggregrate('approved');
        } else {
          onToggleSnackBar('E-sign rejected by approver');
          resetState();
        }
      } else {
        setOpenModal(false);
        onToggleSnackBar("E-sign approved by creater.", 200);
        setTimeout(() => {
          setApiData({ apiName: 'aggregation-transaction-approve', apiMethod: 'PATCH', apiEndpoint: '/api/v1/aggregation'});
          setOpenModal(true);
        }, 1500);
      }
    } catch (err) {
      console.log("Error in handle esign ", err);
      onToggleSnackBar("Error to handle esign");
    }
  };

  const addAggregrate = async esign_status => {
    if (valueProduct && valueBatch) {
      const backendUrl = await AsyncStorage.getItem('BackendUrl');
      console.log('Add aggregation palyload ', { valueProduct, valueBatch, backendUrl });
      
      const res = await axios.post(
        `${backendUrl}/aggregationtransaction/addaggregation`,
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
      console.log('aggregationtransaction Response :', res.data);
      await AsyncStorage.setItem('productId', valueProduct);
      await AsyncStorage.setItem('batchId', valueBatch);
      if(res.data?.code === 200){
        onToggleSnackBar(res.data.message, 200);
        resetForm();
        setTimeout(async () => {
          navigation.navigate('ScanList', { "backendUrl": backendUrl, productId: valueProduct, batchId: valueBatch, countryCode });
        }, 2000);
      } else {
        onToggleSnackBar(res.data.message);
      }
    } else {
      onToggleSnackBar("Select both product and batch")
    }
    resetForm();
  };

  const handleSubmit = async () => {
    console.log('Aggregation start ', { valueProduct, valueBatch });

    if (config.config.esign_status && !openModal) {
      setTimeout(() => {
        setApiData({ apiName: 'aggregation-transaction-create', apiMethod: 'POST', apiEndpoint: '/api/v1/aggregation' })
        setOpenModal(true);
      }, 1000)
      return;
    }
    addAggregrate('approved');
  };

  const resetForm = () => {
    setValueProduct(null);
    setValueBatch(null);
    setIsFocusProduct(false);
    setIsFocusBatch(false);
  };

  const handleDropdownProductChange = async item => {
    // console.log('item.value', item.value);
    setValueProduct(item.value);
    setLoading(true);
    const resBatch = await fetchBatchData(item.value);
    const resCountry = await fetchCountryCode(item.value);
    
    if (resBatch.success) {
      setBatches(resBatch.data)
    } else if (resBatch.code === 401) {
      setIsAuthenticated(false);
    } else {
      onToggleSnackBar("Internal server error", 401);
    }
    if (resCountry.success) {
      setCountryCode(resCountry.data)
    } else if (resCountry.code === 401) {
      setIsAuthenticated(false);
    } else {
      onToggleSnackBar("Internal server error", 401);
    }
    setLoading(false);
    setIsFocusProduct(false);
  };

  return (
    <>
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
            style={[styles.dropdown, { borderColor: 'rgb(80, 189, 160)' }]}
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
            style={[styles.dropdown, { borderColor: 'rgb(80, 189, 160)' }]}
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
    </>
  );
}

export default AggregationComponent;
