import React, { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Appbar, Text, RadioButton, Modal, Portal } from 'react-native-paper';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { url } from "../../utils/constant";

function DropoutFun() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    //dynamic product and batch fetch
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState({ id: null, name: null });
    const [selectedBatch, setSelectedBatch] = useState({ id: null, name: null });
    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);
    const [wholeBatch, setWholeBatch] = useState(true);

    //temporary use
    const [isFocusP, setIsFocusP] = useState([]);
    // Modal visibility states
    const [visibleBatch, setVisibleBatch] = useState(false);
    const [visibleCodes, setVisibleCodes] = useState(false);
    const [visibleConfirmBatch, setVisibleConfirmBatch] = useState(false);
    const [visibleConfirmCodes, setVisibleConfirmCodes] = useState(false); // Added for Codes Dropout Confirmation

    const containerStyle = { backgroundColor: 'white', height: 350, width: 290, marginLeft: 35, borderRadius: 2, display: 'grid', alignContent: 'space-between' };

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

    useEffect(() => {
        const loadTokenAndData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("authToken");
                console.log("JWT token : ", storedToken);
                if (storedToken) {
                    setToken(storedToken);
                    fetchProductData(storedToken);

                } else {
                    throw new Error("Token is missing");
                }
            } catch (error) {
                console.error("Error fetching token:", error);
                setLoading(false);
            }
        };
        if (isFocused) {
            loadTokenAndData();
        }
        return () => {
            // setSelectedProduct(null)
            // setSelectedBatch(null)
            // setProducts([])
            // setBatches([])
        }

    }, [isFocused]);

    useEffect(() => {
        if (selectedProduct.id) {
            fetchBatchData();
        }

        return () => {
        }
    }, [selectedProduct])


    const fetchProductData = async (token) => {
        try {
            setLoading(true);
            const productResponse = await axios.get(`${url}/product/`, {
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const { products } = productResponse.data.data; //destructuring objects
            console.log('This is products Data :', products);
            if (products) {
                const fetchedProducts = products?.map(product => {
                    console.log("id ", product.id)
                    return {
                        id: product.id,
                        name: product.product_name,
                    }
                });
                console.log("Fetched Products for Dropout :", fetchedProducts);

                setProducts(fetchedProducts);
            } else {
                console.error("No products data available");
            }
        } catch (error) {
            console.error("Error fetching Product data for dropout :", error);
        } finally {
            setLoading(false);
        }
    };
    //Fetch batch
    const fetchBatchData = async () => {
        try {
            setLoading(true)
            console.log("product is ", selectedProduct.id)
            const batchResponse = await axios.get(`${url}/batch/${selectedProduct.id}`, {
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Batch Response :", batchResponse.data)

            if (batchResponse.data.success) {
                const fetchedBatches = batchResponse.data.data?.batches.map(batch => {
                    console.log('batch id ', batch.id)
                    return {
                        'id': batch.id,
                        'name': batch.batch_no
                    }
                });
                console.log("Fetched Batches for Dropout :", fetchedBatches);

                setBatches(fetchedBatches);
            } else {
                console.error("No batches data available");
            }
        }
        catch (error) {
            console.error("Error Fetching batch data for dropout ", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDropdownProductChange = async (item) => {
        console.log("product id select ", item)
        setSelectedProduct({ id: item.id, name: item.name });
        setBatches([]);
    };

    const handleDropdownBatchChange = (item) => {
        setSelectedBatch({ id: item.id, name: item.name });
    };

    const radioBatchDropout = () => {
        console.log("radio btn batch dropout");
        setWholeBatch(true);
    };

    const radioCodesDropout = () => {
        console.log("radio btn codes dropout");
        setWholeBatch(false);
    };

    const handleSubmit = () => {
        if (!selectedProduct.id || !selectedBatch.id) {
            Alert.alert("Error", "Please select both product and batch.");
            return;
        }
        // Alert.alert(
        //     "Selected Data",
        //     `Product: ${products.find(p => p.value === productId)?.label}\nBatch: ${selectedBatch.name}`,
        //     [{ text: "OK" }]
        // );
        console.log("Dropout Selected Product :", selectedProduct.id);
        console.log("Dropout Selected Batch :", selectedBatch.id);
        console.log("RAdio select :", wholeBatch ? "Batch" : "code");
        wholeBatch ? setVisibleBatch(true) : setVisibleCodes(true);
    };

    const handleBatchDropout = () => {
        console.log("Batch Dropout Confirmed!!");
        setVisibleBatch(false); // Hide the Batch modal
        setVisibleConfirmBatch(true); // Show Confirm Batch Dropout Modal
    };

    const handleConfirmBatchDropout = async () => {
        console.log("Batch dropout confirmed in final step!");
        setVisibleConfirmBatch(false); // Close the confirm dropout modal
        //TODO: API CALL BATCH DROPOUT
        const batchDropRes = await axios.post(`${url}/dropout/wholebatch`, {
            product_id: selectedProduct.id,
            batch_id: selectedBatch.id
        }, {
            headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Response of batch dropout ", batchDropRes.data);

    };

    const handleCodesDropout = () => {
        console.log("Codes Dropout Confirmed!!");
        setVisibleCodes(false); // Hide the Codes modal
        setVisibleConfirmCodes(true); // Show Confirm Codes Dropout Modal
    };

    const handleConfirmCodesDropout = async () => {
        console.log("Codes dropout confirmed in final step!");
        setVisibleConfirmCodes(false); // Close the confirm dropout modal
        //TODO: API CALL CODES DROPOUT
        const codesDropRes = await axios.post(`${url}/dropout/codes`, {
            product_id: selectedProduct.id,
            batch_id: selectedBatch.id,
            codes: []
        }, {
            headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Response of codes dropout ", codesDropRes.data);
    };

    const onDropoutReasonChange = (item) => {
        console.log("reason to drop out....", item.label)
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

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
                                    style={[styles.dropdown, { borderColor: 'rgb(80, 189, 160)' }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={products}
                                    maxHeight={300}
                                    labelField="name"
                                    valueField="id"
                                    placeholder={'Select Product'}
                                    value={selectedProduct.id}
                                    onChange={handleDropdownProductChange}
                                    renderLeftIcon={() => (
                                        <AntDesign style={styles.icon} color={'rgb(80, 189, 160)'} size={20} />
                                    )}
                                />
                            </View>
                        </View>

                        {/* Batch Dropdown */}
                        <View style={styles.dropdownContainer}>
                            <View style={styles.containerDropdownItem}>
                                <Dropdown
                                    style={[styles.dropdown, { borderColor: 'rgb(80, 189, 160)' }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    data={batches}
                                    maxHeight={300}
                                    labelField="name"
                                    valueField="id"
                                    placeholder={'Select Batch'}
                                    value={selectedBatch.id}
                                    onChange={handleDropdownBatchChange}
                                    renderLeftIcon={() => (
                                        <AntDesign style={styles.icon} color={'rgb(80, 189, 160)'} size={20} />
                                    )}
                                />
                            </View>
                        </View>

                        {/* Radio Buttons for Batch and Codes */}
                        <View style={styles.radioGroups}>
                            <View style={styles.radioItem1}>
                                <RadioButton
                                    value="batch"
                                    status={wholeBatch ? 'checked' : 'unchecked'}
                                    onPress={radioBatchDropout}
                                />
                                <Text style={{ fontSize: 16 }}>Batch Dropout</Text>
                            </View>
                            <View style={styles.radioItem2}>
                                <RadioButton
                                    value="codes"
                                    status={!wholeBatch ? 'checked' : 'unchecked'}
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
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Batch: {selectedBatch.name}</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Product: {selectedProduct.name}</Text>
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
                        <View style={styles.batchDropoutContainer}>
                            <View style={styles.modalConfirmBatchHeader}>
                                <Text style={styles.modalConfirmBatchTitle}>Confirm Batch Dropout</Text>
                            </View>
                            {/* <Text style={styles.modalContent}>Are you sure you want to confirm the dropout for Batch {valueB}?</Text> */}

                            <View style={styles.dropdownConfirmBatchDropoutContainer}>
                                <View style={styles.containerConfirmBatchDropoutItem}>
                                    <Dropdown
                                        style={[styles.dropdown, isFocusP && { borderColor: 'rgb(80, 189, 160)' }]}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        data={dataConfirmDropout}
                                        search
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        placeholder={!isFocusP ? 'Select Batch for Dropout' : '...'}
                                        value={selectedProduct.id}
                                        onFocus={() => setIsFocusP(true)}
                                        onBlur={() => setIsFocusP(false)}
                                        onChange={onDropoutReasonChange}
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
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Batch: {selectedBatch.name}</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Product: {selectedProduct.name}</Text>
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
                        <View style={styles.confirmCodesDropoutContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Confirm Codes Dropout</Text>
                            </View>
                            <Text style={styles.icons}><MaterialCommunityIcons name="alert" size={95} /></Text>
                            <Text style={styles.modalContent}>Security Check</Text>
                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleConfirmCodesDropout}
                                >
                                    <Text style={styles.modalButtonText}>Ok</Text>
                                </TouchableOpacity>

                            </View>
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
    dropdownConfirmBatchDropoutContainer: {
        marginTop: 0,
        //backgroundColor:'red',
        height: 230,
    },
    containerConfirmBatchDropoutItem: {
        padding: 10,
        marginTop: 70,
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
    confirmCodesDropoutContainer: {
        //backgroundColor:'yellow',
        flex: 1,
    },
    modalHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
        marginBottom: 10,
        marginTop: 20,
        alignItems: 'center',
        //backgroundColor:'red'
    },
    modalConfirmBatchHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
        marginBottom: 10,
        marginTop: 10,
        alignItems: 'center',
        //backgroundColor:'yellow',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',

    },
    batchDropoutContainer: {
        //backgroundColor:'red',
        flex: 1,
    },
    modalConfirmBatchTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'red',

    },
    modalContent: {
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 50,
        borderRadius: 2,
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
    icons: {
        textAlign: 'center',
        color: 'red',
        marginTop: 20,
        //backgroundColor:'orange'
    }
});

export default DropoutFun;
