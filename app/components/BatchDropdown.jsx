import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {url} from '../../utils/constant';
import LoaderComponent from '../components/Loader';
import {decodeAndSetConfig} from '../../utils/tokenUtils';

function BatchDropdownComponent() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBatchData = async (token, product_id) => {
    console.log('Batch APIs called..');

    try {
      setLoading(true);
      const batchResponse = await axios.get(`${url}/batch/${product_id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      //console.log("Batch Response :", batchResponse)
      const {batches} = batchResponse?.data?.data;
      //console.log('Batche Res :', batches);

      if (batches) {
        const fetchedBatches = batches.map(batch => ({
          label: batch.batch_no,
          value: batch.id,
        }));
        setBatches(fetchedBatches);
        console.log('Store for select :', batches);
      } else {
        console.error('No batches data available');
      }
    } catch (error) {
      console.error('Error Fetching batch data', error);
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
    </>
  );
}
export default BatchDropdownComponent;

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
