import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import axios from 'axios';
import {url} from '../../utils/constant';
import LoaderComponent from '../components/Loader';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {decodeAndSetConfig} from '../../utils/tokenUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ProductDropdownComponent({valueProduct,handleDropdownProductChange,setValueProduct}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  //   const [valueProduct, setValueProduct] = useState(null);
  const [isFocusProduct, setIsFocusProduct] = useState(false);
  
  useEffect(() => {
    const loadTokenAndData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        //console.log("JWT token : ", storedToken);
        if (storedToken) {
          decodeAndSetConfig(setConfig, storedToken);
          setToken(storedToken);
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
      setValueProduct(null);
    };
  }, []);

  const fetchProductData = async token => {
    console.log('Product APIs called..');

    try {
      setLoading(true);
      const productResponse = await axios.get(`${url}/product/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      //console.log("Product API Response :->",productResponse);

      const {products} = productResponse.data.data; //destructuring objects
      //console.log('This is products Data :', products);
      //console.log('product_id :-', products[0].product_id);

      if (products) {
        //console.log("Dropdown Products :", products)
        const fetchedProducts = products.map(product => ({
          label: product.product_name,
          value: product.id,
        }));
        setProducts(fetchedProducts);
      } else {
        console.error('No products data available');
      }
    } catch (error) {
      console.error('Error fetching Product data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoaderComponent />
    );
  }

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
