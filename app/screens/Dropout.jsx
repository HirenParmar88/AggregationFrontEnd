import React, { useState } from "react";
import { StyleSheet, View, KeyboardAvoidingView, TouchableOpacity, ScrollView } from "react-native";
import { Appbar, Text, RadioButton, Modal, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function DropoutFun() {
    const navigation = useNavigation();

    // For dropdown Product
    const [valueP, setValueP] = useState(null);
    const [isFocusP, setIsFocusP] = useState(false);

    // For dropdown Batch
    const [valueB, setValueB] = useState(null);
    const [isFocusB, setIsFocusB] = useState(false);

    // For Radio buttons
    const [checkedBatch, setCheckedBatch] = useState('');
    const [checkedCodes, setCheckedCodes] = useState('');

    // Modal visibility states
    const [visibleBatch, setVisibleBatch] = useState(false);
    const [visibleCodes, setVisibleCodes] = useState(false);
    const [visibleConfirmBatch, setVisibleConfirmBatch] = useState(false);
    const [visibleConfirmCodes, setVisibleConfirmCodes] = useState(false); // Added for Codes Dropout Confirmation

    const containerStyle = { backgroundColor: 'white', height: 350, width: 290, marginLeft: 35, borderRadius: 2, display: 'grid', alignContent: 'space-between' };

    const dataProduct = [
        { label: 'Product 1', value: '1' },
        { label: 'Product 2', value: '2' },
        { label: 'Product 3', value: '3' },
        { label: 'Product 4', value: '4' },
        { label: 'Product 5', value: '5' },
        { label: 'Product 6', value: '6' },
        { label: 'Product 7', value: '7' },
        { label: 'Product 8', value: '8' },
    ];

    const dataBatch = [
        { label: 'Batch 1', value: '1' },
        { label: 'Batch 2', value: '2' },
        { label: 'Batch 3', value: '3' },
        { label: 'Batch 4', value: '4' },
        { label: 'Batch 5', value: '5' },
        { label: 'Batch 6', value: '6' },
        { label: 'Batch 7', value: '7' },
        { label: 'Batch 8', value: '8' },
    ];

    const dataConfirmDropout = [
        { label: 'Damage', value: '1' },
        { label: 'Defect', value: '2' },
        { label: 'Expired Good', value: '3' },
        { label: 'QA-Sample', value: '4' },
        { label: 'Product-Recall', value: '5' },
        { label: 'Market Complaint', value: '6' },
        { label: 'Product Testing', value: '7' },
        { label: 'demo-Sample', value: '8' },
    ];

    const handleSubmit = () => {
        // Check which radio button is selected and show the corresponding modal
        if (checkedBatch === 'batch') {
            setVisibleBatch(true); // Show Batch Dropout Modal
        } else if (checkedCodes === 'codes') {
            setVisibleCodes(true); // Show Codes Dropout Modal
        } else {
            console.log("No option selected");
        }
    };

    const radioBatchDropout = () => {
        setCheckedBatch('batch');
        setCheckedCodes(''); // Clear Codes selection
    };

    const radioCodesDropout = () => {
        setCheckedCodes('codes');
        setCheckedBatch(''); // Clear Batch selection
    };

    const handleBatchDropout = () => {
        console.log("Batch Dropout Confirmed!!");
        setVisibleBatch(false); // Hide the Batch modal
        setVisibleConfirmBatch(true); // Show Confirm Batch Dropout Modal
    };

    const handleConfirmBatchDropout = () => {
        console.log("Batch dropout confirmed in final step!");
        setVisibleConfirmBatch(false); // Close the confirm dropout modal
    };

    const handleCodesDropout = () => {
        console.log("Codes Dropout Confirmed!!");
        setVisibleCodes(false); // Hide the Codes modal
        setVisibleConfirmCodes(true); // Show Confirm Codes Dropout Modal
    };

    const handleConfirmCodesDropout = () => {
        console.log("Codes dropout confirmed in final step!");
        setVisibleConfirmCodes(false); // Close the confirm dropout modal
    };

    return (
        <>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
                    <Appbar.Content title="Dropout" />
                </Appbar.Header>

                <ScrollView style={styles.scrollView}>
                    <View style={styles.container}>

                        {/* Product Dropdown */}
                        <View style={styles.dropdownContainer}>
                            <View style={styles.containerDropdownItem}>
                                <Dropdown
                                    style={[styles.dropdown, isFocusP && { borderColor: 'rgb(80, 189, 160)' }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={dataProduct}
                                    search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={!isFocusP ? 'Select Product' : '...'}
                                    value={valueP}
                                    onFocus={() => setIsFocusP(true)}
                                    onBlur={() => setIsFocusP(false)}
                                    onChange={item => {
                                        setValueP(item.value);
                                        setIsFocusP(false);
                                    }}
                                    renderLeftIcon={() => (
                                        <AntDesign style={styles.icon} color={isFocusP ? 'rgb(80, 189, 160)' : 'black'} size={20} />
                                    )}
                                />
                            </View>
                        </View>

                        {/* Batch Dropdown */}
                        <View style={styles.dropdownContainer}>
                            <View style={styles.containerDropdownItem}>
                                <Dropdown
                                    style={[styles.dropdown, isFocusB && { borderColor: 'rgb(80, 189, 160)' }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={dataBatch}
                                    search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={!isFocusB ? 'Select Batch' : '...'}
                                    value={valueB}
                                    onFocus={() => setIsFocusB(true)}
                                    onBlur={() => setIsFocusB(false)}
                                    onChange={item => {
                                        setValueB(item.value);
                                        setIsFocusB(false);
                                    }}
                                    renderLeftIcon={() => (
                                        <AntDesign style={styles.icon} color={isFocusB ? 'rgb(80, 189, 160)' : 'black'} size={20} />
                                    )}
                                />
                            </View>
                        </View>

                        {/* Radio Buttons for Batch and Codes */}
                        <View style={styles.radioGroups}>
                            <View style={styles.radioItem1}>
                                <RadioButton
                                    value="batch"
                                    status={checkedBatch === 'batch' ? 'checked' : 'unchecked'}
                                    onPress={radioBatchDropout}
                                />
                                <Text style={{ fontSize: 16 }}>Batch Dropout</Text>
                            </View>
                            <View style={styles.radioItem2}>
                                <RadioButton
                                    value="codes"
                                    status={checkedCodes === 'codes' ? 'checked' : 'unchecked'}
                                    onPress={radioCodesDropout}
                                />
                                <Text style={{ fontSize: 16 }}>Codes Dropout</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.submitView}>
                    <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
                        <Text style={styles.submitBtn}>Submit</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal for Batch Dropout */}
                <Portal>
                    <Modal visible={visibleBatch} onDismiss={() => setVisibleBatch(false)} contentContainerStyle={containerStyle}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Batch Dropout</Text>
                        </View>
                        <Text style={styles.modalContent}>Are you sure you want to dropout?</Text>
                        <View style={{ padding: 50 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Batch: {valueB}</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Product: {valueP}</Text>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleBatchDropout}
                            >
                                <Text style={styles.modalButtonText}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setVisibleBatch(false)}
                            >
                                <Text style={styles.modalButtonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </Portal>

                {/* Modal for Confirm Batch Dropout */}
                <Portal>
                    <Modal visible={visibleConfirmBatch} onDismiss={() => setVisibleConfirmBatch(false)} contentContainerStyle={containerStyle}>
                        <View style={styles.modalConfirmBatchHeader}>
                            <Text style={styles.modalConfirmBatchTitle}>Confirm Batch Dropout</Text>
                        </View>
                        {/* <Text style={styles.modalContent}>Are you sure you want to confirm the dropout for Batch {valueB}?</Text> */}
                        
                        <View style={styles.dropdownContainer}>
                            <View style={styles.containerDropdownItem}>
                                <Dropdown
                                    style={[styles.dropdown, isFocusP && { borderColor: 'rgb(80, 189, 160)' }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={dataConfirmDropout}
                                    search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={!isFocusP ? 'Select Product' : '...'}
                                    value={valueP}
                                    onFocus={() => setIsFocusP(true)}
                                    onBlur={() => setIsFocusP(false)}
                                    onChange={item => {
                                        setValueP(item.value);
                                        setIsFocusP(false);
                                    }}
                                    renderLeftIcon={() => (
                                        <AntDesign style={styles.icon} color={isFocusP ? 'rgb(80, 189, 160)' : 'black'} size={20} />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirmBatchDropout}
                            >
                                <Text style={styles.modalButtonText}>Submit</Text>
                            </TouchableOpacity>
                            
                        </View>
                    </Modal>
                </Portal>

                {/* Modal for Codes Dropout */}
                <Portal>
                    <Modal visible={visibleCodes} onDismiss={() => setVisibleCodes(false)} contentContainerStyle={containerStyle}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Codes Dropout</Text>
                        </View>
                        <Text style={styles.modalContent}>Are you sure you want to dropout?</Text>
                        <View style={{ padding: 50 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Batch: {valueB}</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Product: {valueP}</Text>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleCodesDropout}
                            >
                                <Text style={styles.modalButtonText}>Submit</Text>
                            </TouchableOpacity>
                        
                        </View>
                    </Modal>
                </Portal>

                {/* Modal for Confirm Codes Dropout */}
                <Portal>
                    <Modal visible={visibleConfirmCodes} onDismiss={() => setVisibleConfirmCodes(false)} contentContainerStyle={containerStyle}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Confirm Codes Dropout</Text>
                        </View>
                        <Text style={styles.icons}><MaterialCommunityIcons name="alert" size={80}/></Text>
                        <Text style={styles.modalContent}>Security Check</Text>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleConfirmCodesDropout}
                            >
                                <Text style={styles.modalButtonText}>Ok</Text>
                            </TouchableOpacity>
                            
                        </View>
                    </Modal>
                </Portal>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    submitView: {
        //position: 'absolute',
        //justifyContent: 'end',
        display: 'flex',
        bottom: 0,
    },
    container: {
        flex: 1,
        marginTop: 70,
    },
    dropdownContainer: {
        marginTop: 0,
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
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    submitBtn: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
        
    },
    btn: {
        padding: 20,
        backgroundColor: 'rgb(80, 189, 160)',
    },
    radioGroups: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioItem1: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    radioItem2: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 25,
    },
    modalHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    modalConfirmBatchHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
        marginBottom: 10,
        alignItems: 'center',
        backgroundColor:'yellow',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        
    },
    modalConfirmBatchTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color:'red'
    },
    modalContent: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
    },
    confirmButton: {
        backgroundColor: 'rgb(80, 189, 160)',
    },
    cancelButton: {
        backgroundColor: '#ddd',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
    icons:{
        textAlign:'center',
    }
});

export default DropoutFun;
