//app/screens/Products.jsx
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Appbar } from "react-native-paper";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Dropdown } from 'react-native-element-dropdown';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import EsignPage from "./Esign";
import { decodeAndSetConfig } from "../../utils/tokenUtils";
import { url } from "../../utils/constant";

function ProductComponent() {
    const navigation = useNavigation();
    const [valueProduct, setValueProduct] = useState(null);
    const [valueBatch, setValueBatch] = useState(null);
    const [isFocusProduct, setIsFocusProduct] = useState(false);
    const [isFocusBatch, setIsFocusBatch] = useState(false);
    const [aggregateId, setAggregateId] = useState({})
    const [config, setConfig] = useState(null);
    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [status, setStatus] = useState(undefined);
    const [approveAPIName, setApproveAPIName] = useState();
    const [approveAPImethod, setApproveAPImethod] = useState();
    const [approveAPIEndPoint, setApproveAPIEndPoint] = useState();

    useEffect(() => {
        const loadTokenAndData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("authToken");
                //console.log("JWT token : ", storedToken);
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
        return ()=> {
            setValueProduct(null);
            setValueBatch(null);
        }

    }, []);

    // Fetch products
    // console.log("Config :->", config);

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
            //console.log('This is products Data :', products)
            console.log("ProductID :-", products[0].product_id);
            
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
            //console.log("Batch Response :", batchResponse)
            const { batches } = batchResponse?.data?.data;
            console.log(" :", batches);

            if (batches) {
                const fetchedBatches = batches.map(batch => ({
                    label: batch.batch_no,
                    value: batch.id,
                }));
                setBatches(fetchedBatches);
                console.log("Store for select :", batches)
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

    const renderLabelProduct = () => {
        if (valueProduct || isFocusProduct) {
            return (
                <Text style={[styles.label, isFocusProduct && { color: 'primary' }]}>
                    Select Product
                </Text>
            );
        }
        return null;
    };

    const renderLabelBatch = () => {
        if (valueBatch || isFocusBatch) {
            return (
                <Text style={[styles.label, isFocusBatch && { color: 'primary' }]}>
                    Select Batch
                </Text>
            );
        }
        return null;
    };

    const processApproval = async (user,aggregrateId) => {
        console.log("aggregate id :", aggregateId)
        const data = {
            modelName: "aggregationTransaction",
            esignStatus,
            id: aggregateId.id,
            audit_log: config.audit_logs ? {
                user_id: user.userId,
                user_name: user.userName,
                performed_action: 'approved',
                remarks: remarks || `product approved - ${auditLogMark}`,
            } : {},
        };
        const dataRes = await axios.post(`${url}/esign-status`, data, {
            headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${token}`,
            }
        }, 'POST', true);
        console.log("data Res :->", dataRes);
        closeApprovalModal()

    };

    const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks, eSignStatusId) => {
        try {
            console.log('handleAuthResult')
            console.log("handleAuthResult", { isAuthenticated, isApprover, esignStatus, user });
            console.log(isApprover, isAuthenticated)
            const closeApprovalModal = () => setOpenModal(false);
            const resetState = () => {
                setApproveAPIName('');
                setApproveAPImethod('');
                setApproveAPIEndPoint('');
                setOpenModal(false);
            };
            if (!isAuthenticated) {
                Alert.alert('Authentication failed, Please try again.');
                resetState();
                return;
            }
            
            const handleEsignStatus = async () => {
                if (esignStatus === "rejected") {
                    closeApprovalModal();
                }
            };
            if (isApprover) {
                console.log("Approved is ", esignStatus === "approved")
                if (esignStatus === "approved") {
                    await addAggregrate("approved")
                    
                    closeApprovalModal();
                } else {
                    await addAggregrate("rejected")
                    if (esignStatus === "rejected") closeApprovalModal();
                }
            } else {
                handleEsignStatus();
            }
            resetState();
        }
        catch (err) {
            console.log(err)
        }
    };

    const addAggregrate = async (esign_status) => {
        const aggregationtransactionResponse = await axios.post(`${url}/aggregationtransaction/addaggregation`,
            {
                "audit_log": {
                    "audit_log": false,
                    "performed_action": "Add Aggeration ",
                    "remarks": "none"
                },
                "product_id": valueProduct,
                "batch_id": valueBatch,
                esign_status: esign_status,

            }, {
            headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${token}`,
            }

        },);
        console.log("aggregationtransactionResponse :", aggregationtransactionResponse.data.data);
        // setAggregateId(aggregationtransactionResponse.data.data)
        // await processApproval(user,aggregationtransactionResponse.data.data.id)

        if (valueProduct && valueBatch) {
            const selectedProduct = products.find(p => p.value === valueProduct);
            const selectedBatch = batches.find(b => b.value === valueBatch);

            Alert.alert(
                "Selected Data",
                `Product: ${selectedProduct.label}\nBatch: ${selectedBatch.label}`,
                [{ text: "OK" }]
            );
            console.log("selected product :", selectedProduct.label);
            console.log("selected batch:", selectedBatch.label);
            console.log("PID :-",valueProduct);
            
            navigation.navigate("ScanList",{id: valueProduct})

        } else {
            Alert.alert("Error", "Please select both product and batch.");
        }
        resetForm();
    }

    const handleSubmit = async () => {
        console.log(config.config.esign_status, !openModal)
        if (config.config.esign_status && !openModal) {
            setOpenModal(true);
            return
        }
        // addAggregrate("approved")
        navigation.navigate("ScanList",{id: valueProduct})
        setValueProduct(null);
        setValueBatch(null);

    };

    const resetForm = () => {
        setValueProduct(null);
        setValueBatch(null);
        setIsFocusProduct(false);
        setIsFocusBatch(false);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }
    const handleDropdownProductChange = async (item) => {
        await fetchBatchData(token, item.value);
        setValueProduct(item.value);

        setIsFocusProduct(false);
    };
    return (
        <>
            {/* <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
                <Appbar.Content title="Product" />
            </Appbar.Header> */}
            <View style={styles.container}>

                {renderLabelProduct()}
                <View style={styles.dropdownContainer}>
                    <Dropdown
                        style={[styles.dropdown, isFocusProduct && { borderColor: 'rgb(80, 189, 160)' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={products}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocusProduct ? 'Select product' : '...'}
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

                {renderLabelBatch()}
                <View style={styles.dropdownContainer}>
                    <Dropdown
                        style={[styles.dropdown, isFocusBatch && { borderColor: 'rgb(80, 189, 160)' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={batches}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocusBatch ? 'Select batch' : '...'}
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

            <TouchableOpacity
                mode="contained"
                style={styles.btn}
                onPress={handleSubmit}
            >
                <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>

            {openModal && <EsignPage
                config={config}
                handleAuthResult={handleAuthResult}
                approveAPIName={approveAPIName}
                approveAPImethod={approveAPImethod}
                approveAPIEndPoint={approveAPIEndPoint}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setStatus={setStatus}
            />}
        </>
    );
}

export default ProductComponent;

const styles = StyleSheet.create({
    container: {
        //backgroundColor: 'yellow',
        padding: 16,
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        width: '100%',
    },
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
    label: {
        position: 'relative',
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
    btn: {
        borderRadius: 0,
        padding: 20,
        backgroundColor: 'rgb(80, 189, 160)',
    },
    submitBtnText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#fff'
    },
});
