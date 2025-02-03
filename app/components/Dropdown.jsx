import React, { useState, useEffect } from "react";
import { Dropdown } from 'react-native-element-dropdown';

function Dropdown(){
    return(
        <>
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
        </>
    )
}
export default Dropdown;