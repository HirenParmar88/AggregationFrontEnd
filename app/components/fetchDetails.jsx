import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchProductData = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const backendUrl = await AsyncStorage.getItem('BackendUrl');

    const productResponse = await axios.get(`${backendUrl}/product/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Product API Response :->', productResponse.data);
    if (productResponse.data?.success) {
      const productData = productResponse.data?.data.products.map(product => ({
        label: product.product_name,
        value: product.id,
      }));
      return {success: true, data: productData, code: 200};
    } else if (productResponse.data.code === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('screens');
      return {success: false, data: [], code: 401};
    } else {
      console.error('No products data available');
      return {success: false, data: [], code: 500};
    }
  } catch (error) {
    console.error('Error fetching Product data:', error);
    return {success: false, data: [], code: 500};
  }
};

export const fetchBatchData = async productId => {
  console.log('Batch APIs called..', productId);
  try {
    const token = await AsyncStorage.getItem('authToken');
    const backendUrl = await AsyncStorage.getItem('BackendUrl');

    const batchResponse = await axios.get(`${backendUrl}/batch/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Batch API Response :', batchResponse.data);
    if (batchResponse.data?.success) {
      const batchData = batchResponse.data.data?.batches?.map(batch => ({
        label: batch.batch_no,
        value: batch.id,
      }));
      return {success: true, data: batchData, code: 200};
    } else if (batchResponse.data.code === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('screens');
      return {success: false, data: [], code: 401};
    } else {
      console.error('No batches data available');
      return {success: false, data: [], code: 500};
    }
  } catch (error) {
    console.error('Error Fetching batch data', error);
    return {success: false, data: [], code: 500};
  }
};

export const fetchCountryCode = async productId => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const backendUrl = await AsyncStorage.getItem('BackendUrl');
    
    const response = await axios.get(
      `${backendUrl}/product/countrycode/${productId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('Get country code Response :', response.data);
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.data.country_code.toString(),
        code: 200,
      };
    } else if (response.data.code === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('screens');
      return {success: false, data: [], code: 401};
    } else {
      console.error('No country data available');
      return {success: false, data: [], code: 500};
    }
  } catch (error) {
    console.error('Error Fetching country code ', error);
  }
};
