import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {decodeAndSetConfig} from '../../utils/tokenUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProductData } from './fetchDetails';
import { useLoading } from '../../context/LoadingContext';

function ProductDropdownComponent({valueProduct,handleDropdownProductChange,setValueProduct}) {
  const [products, setProducts] = useState([]);
  const { setLoading } = useLoading();
  const [isFocusProduct, setIsFocusProduct] = useState(false);
  
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
          setLoading(false);
          if (resProd.success) {
            setProducts(resProd.data)
          } else if (resProd.code === 401) {
            navigation.navigate('Login')
          } else {
            setSnackbarInfo({ visible: true, message: "Internal server error"});
          }
        } else {
          setSnackbarInfo({ visible: true, message: "Token not found please login again"});
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        setLoading(false);
      }
    };

    loadTokenAndData();
    return () => {
      setValueProduct(null);
    };
  }, []);

  return (
    <>
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
    </>
  );
}
export default ProductDropdownComponent;

const styles = StyleSheet.create({
  dropdownContainer: {
    //backgroundColor:'red',
    width: '100%',
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 20,
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
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
