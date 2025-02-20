import axios from 'axios';
import {url} from '../../utils/constant';

export const fetchProductData = async (token, setProducts, setLoading) => {
  console.log('Product APIs called..');
  try {
    setLoading(true);
    const productResponse = await axios.get(`${url}/product/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Product API Response :->",productResponse);
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

export const fetchBatchData = async (setBatches, setLoading, token, product_id) => {
  console.log('Batch APIs called..');
  try {
    setLoading(true);
    const batchResponse = await axios.get(`${url}/batch/${product_id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Batch API Response :", batchResponse)
    const {batches} = batchResponse?.data?.data;
    //console.log('Batche Res :', batches);

    if (batches) {
      const fetchedBatches = batches.map(batch => ({
        label: batch.batch_no,
        value: batch.id,
      }));
      setBatches(fetchedBatches);
      console.log('batches data:', batches);
    } else {
      console.error('No batches data available');
    }
  } catch (error) {
    console.error('Error Fetching batch data', error);
  } finally {
    setLoading(false);
  }
};

export const fetchCountryCode = async (
  setCountryCode,
  selectedProduct,
  setLoading,
  token,
) => {
    try {
      setLoading(true);
      console.log('token in c ', token);
      const response = await axios.get(
        `${url}/product/countrycode/${selectedProduct.value}`,
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