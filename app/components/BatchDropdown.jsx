import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';

function BatchDropdownComponent() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
