//app/components/screens/Reprint.jsx

import React, { useState, useEffect } from "react";
import { StyleSheet, View, KeyboardAvoidingView, TouchableOpacity, Alert } from "react-native";
import { Appbar, Text, TextInput, Modal, Portal, PaperProvider, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from "react-native-vector-icons/AntDesign";
import { url } from "../../utils/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeAndSetConfig } from "../../utils/tokenUtils";
import axios from "axios";

function Reprint() {
    const navigation = useNavigation();
    const [text, setText] = useState("");
    //dynamic product and batch fetch
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [valueProduct, setValueProduct] = useState(null);
    const [valueBatch, setValueBatch] = useState(null);
    const [isFocusProduct, setIsFocusProduct] = useState(false);
    const [isFocusBatch, setIsFocusBatch] = useState(false);
    const [config, setConfig] = useState(null);
    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);
    //for modal dialogue
    const [visible, setVisible] = useState(false);
    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const containerStyle = { backgroundColor: 'white', padding: 20, height: 350, width: 320, marginLeft: 20, borderRadius: 6, };

    useEffect(() => {
        const loadTokenAndData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("authToken");
                console.log("JWT token : ", storedToken);
                if (storedToken) {
                    decodeAndSetConfig(setConfig, storedToken)
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
        loadTokenAndData();
        return () => {
            setValueProduct(null);
            setValueBatch(null);
        }

    }, []);

    const fetchProductData = async (token) => {
        try {
            setLoading(true);
            const productResponse = await axios.get(`${url}/product/?limit=-1`, {
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const { products } = productResponse.data.data; //destructuring objects
            console.log('This is products Data :', products)
            //console.log("ProductID :-", products[0].product_id);

            if (products) {
                //console.log("Dropdown Products :", products)
                const fetchedProducts = products.map(product => ({
                    label: product.product_name,
                    value: product.id,
                }));
                // console.log("value :",value);

                setProducts(fetchedProducts);
            } else {
                console.error("No products data available");
            }
        } catch (error) {
            console.error("Error fetching Product data:", error);
        } finally {
            setLoading(false);
        }
    };
    //Fetch batch
    const fetchBatchData = async (token, product_id) => {
        try {
            setLoading(true)
            const batchResponse = await axios.get(`${url}/batch/${product_id}`, {
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Batch Response :", batchResponse)
            const { batches } = batchResponse?.data?.data;
            console.log("Batch Data :", batches);

            if (batches) {
                const fetchedBatches = batches.map(batch => ({
                    label: batch.batch_no,
                    value: batch.id,
                }));
                setBatches(fetchedBatches);
                //console.log("Store for select :", batches)
            } else {
                console.error("No batches data available");
            }
        }
        catch (error) {
            console.error("Error Fetching batch data", error)
        } finally {
            setLoading(false)
        }
    }

    const renderLabelProducts = () => {
        if (valueProduct || isFocusProduct) {
            return (
                <Text style={[styles.label, isFocusProduct && { color: 'rgb(80, 189, 160)' }]}>
                    {/* Dropdown label */}
                </Text>
            );
        }
        return null;
    };

    const renderLabelBatches = () => {
        if (valueBatch || isFocusBatch) {
            return (
                <Text style={[styles.label, isFocusBatch && { color: 'rgb(80, 189, 160)' }]}>
                    {/* Dropdown label */}
                </Text>
            );
        }
        return null;
    };

    const handleDropdownProductChange = async (item) => {
        setValueProduct(item.value);
        setIsFocusProduct(false);
        setBatches([]); // Clear batches when product changes
        await fetchBatchData(token, item.value); // Fetch batches for selected product
    };

    const handleReprint = () => {
        if (!valueProduct || !valueBatch) {
            Alert.alert("Error", "Please select both product and batch.");
            return;
        }
        // Alert.alert(
        //     "Selected Data",
        //     `Product: ${products.find(p => p.value === valueProduct)?.label}\nBatch: ${batches.find(b => b.value === valueBatch)?.label}`,
        //     [{ text: "OK" }]
        // );
        //Reset fields after reprint

        setVisible(true);   //modal open
        console.log('Reprint pressed..');
        setValueProduct(null);
        setValueBatch(null);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const print = () => {
        console.log("Reprint success.");
        
    }

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
                    <Appbar.Content title="Reprint" />
                </Appbar.Header>

                <View style={styles.container}>

                    <View style={styles.dropdownContainer}>
                        {/* <Text variant="titleMedium" style={styles.labelText}>Product</Text> */}
                        <View style={styles.containerDropdownItem}>
                            {renderLabelProducts()}
                            <Dropdown
                                style={[styles.dropdown, isFocusProduct && { borderColor: 'rgb(80, 189, 160)' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                //data={dataProduct}
                                data={products}   //dynamic data
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isFocusProduct ? 'Select Product' : '...'}
                                searchPlaceholder="Search..."
                                value={valueProduct}
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
                            {renderLabelBatches()}
                            <Dropdown
                                style={[styles.dropdown, isFocusBatch && { borderColor: 'rgb(80, 189, 160)' }]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                //data={dataBatch}
                                data={batches}   //dynamic fetch batch
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={!isFocusBatch ? 'Select Batch' : '...'}
                                searchPlaceholder="Search..."
                                value={valueBatch}
                                onFocus={() => setIsFocusBatch(true)}
                                onBlur={() => setIsFocusBatch(false)}
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
                    </View>

                    <View style={styles.txtInputStyle}>
                        <Text variant="titleMedium" style={styles.labelText}>Scan</Text>
                        <TextInput
                            label="Scanned"
                            value={text}
                            mode="outlined"
                            onChangeText={text => setText(text)}
                            style={styles.textInput}
                        />
                    </View>

                </View>
                <View>
                    <TouchableOpacity
                        mode="contained"
                        //labelStyle={{ fontSize: 20 }}
                        style={styles.reprintButton}
                        onPress={handleReprint}
                    >
                        <Text style={styles.reprintText}>Reprint</Text>
                    </TouchableOpacity>
                </View>


                <Portal>
                    <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
                        <View style={styles.modalContainer}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalHeader}>Reprint</Text>
                                </View>
                                <Divider />
                                <View style={styles.modalBody}>
                                    <Text style={styles.bodyTxt}>Printing in Progress..</Text>
                                </View>
                                <View style={styles.footer}>
                                    <TouchableOpacity
                                        style={styles.printbtn}
                                        mode="contained"
                                        onPress={print}
                                    >
                                        <Text style={styles.btnText}>Print</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.cancelbtn}
                                        mode="contained"
                                        onPress={print}
                                    >
                                        <Text style={styles.btnText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                        </View>
                    </Modal>
                </Portal>

            </KeyboardAvoidingView>
        </>
    )
}
export default Reprint;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor: 'lightblue',
    },
    dropdownContainer: {
        //backgroundColor:'yellow',
        marginTop: 20,
    },
    labelText: {
        //backgroundColor: 'pink',
        paddingLeft: 20,
        paddingTop: 15,
    },
    containerDropdownItem: {
        //backgroundColor: 'white',
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
        //backgroundColor: 'white',
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
        //border:'outlined',
    },
    txtInputStyle: {
        //backgroundColor:'red',
        marginTop: 0,
    },
    reprintButton: {
        borderRadius: 0,
        padding: 15,
        backgroundColor: 'rgb(80, 189, 160)',
    },
    reprintText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#fff',
    },
    modalContainer: {
        //backgroundColor: 'yellow',
        flex: 1,
        position:'relative',
        //position:'absolute'
    },
    modalHeader:{
        //backgroundColor:'red',
        textAlign:'center',
        fontSize:30,
    },
    modalBody:{
        //backgroundColor:'blue',
        height:220,
    },
    bodyTxt:{
        fontSize:20,
        textAlign:'center',
        paddingTop:50,
    },
    footer:{
        //backgroundColor:'orange',
        bottom:0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    btnText:{
        fontSize:20,
    },
    printbtn:{
        backgroundColor:'rgb(80, 189, 160)',
        paddingLeft:26,
        paddingRight:26,
        paddingTop:15,
        paddingBottom:15,
        borderRadius:4,
    },
    cancelbtn:{
        backgroundColor:'gray',
        padding:15,
        borderRadius:4,
    },
});