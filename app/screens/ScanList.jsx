import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from "react-native";
import { Appbar, Text, Button, List, Divider, Portal, Modal, Snackbar } from "react-native-paper";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import HoneywellBarcodeReader from 'react-native-honeywell-datacollection';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // To handle token storage
import { url } from "../../utils/constant";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

function ScanList() {
  const navigation = useNavigation();
  const router = useRoute();
  const isFocused = useIsFocused();
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);

  const [parentModalVisible, setParentModalVisible] = useState(false); // Parent modal (confirmation)
  const [childModalVisible, setChildModalVisible] = useState(false); // Child modal (completed or failed)
  const [transactionStatus, setTransactionStatus] = useState(null); // Track transaction status (completed or failed)
  const [text, setText] = useState('');

  const [quantity, setQuantity] = useState(0);
  const [currentlevel, setCurrentLevel] = useState(0);
  const [totallevel, setTotalLevel] = useState(0);
  const [packaged, setPackage] = useState(0);

  const [token, setToken] = useState(" ");

  const handleScannedData = async () => {
    //console.log("Temp Token :-",token);
    //console.log("scan List call function.");

    try {
      // console.log("package level :",currentlevel);
      // console.log("Quantity :", quantity);
      
      const response = await axios.post(`${url}/packagingHierarchy`, {
        product_id: router.params.id,
        currentLevel: currentlevel,
      }, {
        headers: {
          "Content-Type": 'application/json',
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        }
      });
      console.log("handle Scan Res :", response.data);
      if (response.data.success) {
        const { packaged, quantity, currentLevel, totallevel } = response.data.data;
        setQuantity(quantity);
        setPackage(packaged);
        setCurrentLevel(currentLevel);
        setTotalLevel(totallevel);
        console.log("Success.");
        console.log("package level :",packaged);
        console.log("Quantity :", quantity);
      } else {
        Alert.alert('Authentication failed. Please try again.');
        return;
      }
    }
    catch (err) {
      console.log("Error :", err)
    }
  }

  //product table pid
  useEffect(() => {
    console.log("PID :- ", router.params?.id);
    handleScannedData();
    return () => {
      
    }
  }, [isFocused])
  
  

  useEffect(() => {
    console.log("Is compatible:", HoneywellBarcodeReader.isCompatible);

    HoneywellBarcodeReader.register().then((claimed) => {
      console.log(claimed ? 'Barcode reader is claimed' : 'Barcode reader is busy');
    });

    HoneywellBarcodeReader.onBarcodeReadSuccess(event => {
      console.log('Received data :', event);
      console.log('Current Scanned data :', event.data);
      console.log("Previous data is :", data);

      setData(prevData => {
        const alreadyExist = prevData.find((item) => item === event.data)
        if (!alreadyExist) {
          return [...prevData, event.data];
        } else {
          console.log("Already exitst...")
          Alert.alert("Items Already Exists!")
          return [...prevData]
        }
      },
      );
    });

    HoneywellBarcodeReader.onBarcodeReadFail(() => {
      console.log('Barcode read failed');
    });

    HoneywellBarcodeReader.onTriggerStateChange(state => {
      console.log('onTriggerStateChange', state);
    });

    HoneywellBarcodeReader.barcodeReaderInfo(details => {
      console.log('barcodeReaderClaimed', details);
    });

    return () => {
    };
  }, []);

  const handleEndTransaction = () => {
    console.log("End transaction button pressed..");
    setParentModalVisible(true); // Show parent modal asking for confirmation
  };

  const handleParentModalDismiss = (confirmed) => {
    setParentModalVisible(false); // Close the parent modal
    setTransactionStatus(confirmed ? "completed" : "failed"); // Set status for child modal
    setChildModalVisible(true); // Show the corresponding child modal (completed or failed)
  };

  const handleChildModalDismiss = () => {
    setChildModalVisible(false); // Close the child modal
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.navigate('Product')} />
          <Appbar.Content title="Scan List" />
        </Appbar.Header>

        <View style={styles.formContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Pack Level:</Text>
            <Text style={styles.label} >{packaged}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.label} keyboardType="numeric" >{quantity}</Text>
          </View>
        </View>
        <View>
          <Text>PID : {router.params?.id}</Text>
        </View>

        <Divider />
        <View style={styles.ListSubheaderView}>
          <Text style={styles.ListSubheader}>{data.length} Show Results</Text>
        </View>
        {/* <Divider /> */}

        <ScrollView contentContainerStyle={styles.container}>
          <List.Section style={{ flexDirection: 'column-reverse' }}>
            {data.map((item, index) => (
              <List.Item
                key={index}
                title={item}
                left={() => <List.Icon icon="barcode-scan" />}
              />
            ))}
          </List.Section>
        </ScrollView>

        <Divider />
        <TouchableOpacity
          mode="contained"
          //labelStyle={{ fontSize: 20 }}
          style={styles.submitButton}
          onPress={handleEndTransaction}
        >
          <Text style={styles.endTranTxt}>End Transaction</Text>
        </TouchableOpacity>

        {/* Parent Modal (Confirmation) */}
        <Portal>
          <Modal
            visible={parentModalVisible}
            onDismiss={() => handleParentModalDismiss(false)} // Dismiss on Cancel
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan List</Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View>
                <MaterialCommunityIcons name='cloud-print' size={50} color='#000000' style={styles.statusSuccess} />
              </View>
              <Text style={styles.modalText}>Shipper printing in progress..</Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={() => handleParentModalDismiss(false)} // Cancel button action
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => handleParentModalDismiss(true)} // Confirm button action
                style={styles.modalButton}
              >
                Confirm
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Child Modal (Printing Completed) */}
        <Portal>
          <Modal
            visible={childModalVisible && transactionStatus === "completed"}
            onDismiss={handleChildModalDismiss} // Close the modal
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Status</Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
            <View>
              <MaterialIcons name="done" size={50} color='#000000' style={styles.statusSuccess}/>
              </View>
              <Text style={styles.modalSuccessText}>Printing Completed!</Text>
            </ScrollView>

            <View style={styles.childModalFooter}>
              <Button
                mode="contained"
                onPress={handleChildModalDismiss} // OK button action to close the modal
                style={styles.modalOKButton}
              >
                OK
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Child Modal (Printing Failed) */}
        <Portal>
          <Modal
            visible={childModalVisible && transactionStatus === "failed"}
            onDismiss={handleChildModalDismiss} // Close the modal
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Status</Text>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View>
                <MaterialIcons name="sms-failed" size={50} color='#000000' style={styles.statusSuccess} /> 
              </View>
              <Text style={styles.modalFailedText}>Shipper printing Failed!</Text>
            </ScrollView>

            <View style={styles.childModalFooter}>
              <Button
                mode="contained"
                onPress={handleChildModalDismiss} // OK button action to close the modal
                style={styles.modelRetryButton}
              >
                Retry
              </Button>
            </View>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>

    </>
  );
}

export default ScanList;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 0,
    //backgroundColor:'yellow',
  },
  formContainer: {
    marginTop: 0,
    padding: 10,
    //backgroundColor:'red',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
    color: '#333',
    width: 110,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 30,
    fontWeight: 'bold'
  },
  submitButton: {
    //position: 'absolute',
    //bottom: 0,
    //paddingVertical: 10,
    borderRadius: 0,
    padding: 20,
    backgroundColor: 'rgb(80, 189, 160)',
  },
  endTranTxt: {
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
    //padding: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 40,
    height: 250,
    borderRadius: 6,
    justifyContent: 'space-between',
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 10,
  },
  modalButton: {
    width: '48%',
    borderRadius: 2,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalOKButton: {
    width: '48%',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modelRetryButton: {
    width: '48%',
    borderRadius: 4,
    backgroundColor: 'red',
  },
  modalSuccessText: {
    color: "green",
    fontSize: 18,
    textAlign: 'center'
  },
  modalFailedText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center'
  },
  childModalFooter: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ListSubheader: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingLeft: 10,
    marginBottom: 5,
    zIndex: 1,
    position: 'relative',
    top: 0,
  },
  ListSubheaderView: {
    shadowRadius: 3,
    opacity: 3,
    borderRadius: 2,
  },
  SnackbarDispaly: {
    flex: 1,
    justifyContent: 'space-between'
  },
  statusSuccess:{
    textAlign:'center',
    //backgroundColor:'red'
  }
});
