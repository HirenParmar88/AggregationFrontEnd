//app/components/screens/Remap.jsx
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
function RemapScreen() {
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
  const [batches, setBatches] = useState([]);
  const [countryCode, setCountryCode] = useState(null);
  const [scanCode,setScanCode]=useState(undefined)
  const [visible, setVisible] = useState(false);
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
          console.log('JWT token : ', storedToken);
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
      setSelectedProduct({id: null, name: null});
      setSelectedBatch({id: null, name: null});
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
      console.log('Country code is ', countryCode);
      setScanCode(event.data)
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
  }, [countryCode,isFocused]);

  useEffect(() => {
    if (selectedProduct.id) {
      (async () => {
        await fetchCountryCode();
        await fetchBatchData();
      })();
    }
    return () => {};
  }, [selectedProduct.id, isFocused]);

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
      console.error('Error fetching Product data for Remap :', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchData = async () => {
    try {
      setLoading(true);
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

      if (batchResponse?.data?.success) {
        const fetchedBatches = batchResponse.data.data?.batches?.map(batch => {
          console.log('batch id ', batch.id);
          return {
            id: batch.id,
            name: batch.batch_no,
          };
        });
        setBatches(fetchedBatches);
        //console.log("Store for select :", batches)
      } else {
        console.error('No batches data available');
      }
    } catch (error) {
      console.error('Error Fetching batch data for Remap ', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryCode = async () => {
    console.log("Remap Api called..");
    
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

  const handleDropdownProductChange = async item => {
    setSelectedProduct({id: item.id, name: item.name});
    setIsFocusProduct(false);
    setBatches([]);
  };

  const handleRemap = () => {
    if (!selectedProduct.id || !selectedBatch.id) {
      Alert.alert('Error', 'Please select both product and batch.');
      return;
    }
    if (!scanCode) {
      Alert.alert('Error', 'Please scan or enter unique code');
      return;
    }

    setVisible(true); //modal open
    console.log('Remap pressed..');
  };

  if (loading) {
    return <LoaderComponent />;
  }

  const print = async () => {
    console.log('Remap success.');
    const remapRes = await axios.post(
      `${url}/code-remap`,
      {
        product_id: selectedProduct.id,
        batch_id: selectedBatch.id,
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
      setSelectedProduct({id: null, name: null});
      setSelectedBatch({id: null, name: null});
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

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
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
                  value={selectedProduct.id}
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
                  value={selectedBatch.id}
                  onFocus={() => setIsFocusBatch(true)}
                  onBlur={() => setIsFocusBatch(false)}
                  onChange={item => {
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
                Scan or write a code
              </Text>
              <TextInput
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownContainer: {
    marginTop: 20,
  },
  labelText: {
    paddingLeft: 20,
    paddingTop: 15,
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
  label: {
    position: 'absolute',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  textInput: {
    margin: 18,
  },
  txtInputStyle: {
    marginTop: 0,
  },
  remapButton: {
    borderRadius: 0,
    padding: 20,
    backgroundColor: 'rgb(80, 189, 160)',
  },
  remapText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    position: 'relative',
  },
  modalHeader: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight:'bold'
  },
  modalBody: {
    //height: 20,
    //backgroundColor:'yellow'
  },
  bodyTxt: {
    fontSize: 18,
    //textAlign: 'center',
    //paddingTop: 10,
    fontWeight:'bold'
    //backgroundColor:'red'
  },
  footer: {
    //backgroundColor:'orange',
    bottom: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop:50
  },
  btnText: {
    fontSize: 20,
  },
  printbtn: {
    backgroundColor: 'rgb(80, 189, 160)',
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 4,
  },
  cancelbtn: {
    backgroundColor: 'gray',
    padding: 15,
    borderRadius: 4,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 70, // Extra space from the bottom if needed
  },
  iconStyleQr: {
    position:'absolute',
    top:100,
    right:100,
    // paddingRight: 50,
    justifyContent: 'center',
  },
});
