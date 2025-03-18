"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  AppState,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  Appbar,
  Text,
  Button,
  List,
  Divider,
  Portal,
  Modal,
  Snackbar,
} from "react-native-paper";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import HoneywellBarcodeReader from "react-native-honeywell-datacollection";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // To handle token storage
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import DeviceInfo from "react-native-device-info";
import { decodeAndSetConfig } from "../../utils/tokenUtils";
import styles from "../../styles/scanlist";

function ScanList() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [data, setData] = useState([]);
  const [parentModalVisible, setParentModalVisible] = useState(false);
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [transactionId, setTransactionId] = useState("");
  const [ssccNumber, setSsccNumber] = useState(null);
  const [config, setConfig] = useState(null);
  const [serialNumber, setSerialNumber] = useState(null);
  const backendUrl = useRef();

  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: "",
  });

  useEffect(() => {
    if (!quantity) {
      handleScannedData();
    }
    //scanValidation();
    return () => {};
  }, [isFocused]);

  useEffect(() => {
    //console.log('Is compatible:', HoneywellBarcodeReader.isCompatible);
    HoneywellBarcodeReader.register().then((claimed) => {
      console.log(
        claimed ? "Barcode reader is claimed" : "Barcode reader is busy"
      );
    });

    HoneywellBarcodeReader.onBarcodeReadSuccess(async (event) => {
      if (quantity > 0) {
        console.log("Current Scanned data :", event.data);
        console.log("Previous data is :", data);

        const scanRes = await scanValidation(event.data);
        console.log('Inside BarcodeRead Callback ', scanRes);
        if (scanRes) {
          await codeScan(event.data); //codeScan API call
        }
      } else {
        onToggleSnackBar(
          "All codes have been scanned. You may now complete the transaction.", 400);
      }
    });

    HoneywellBarcodeReader.onBarcodeReadFail(() => {
      console.log("Barcode read failed");
    });

    HoneywellBarcodeReader.onTriggerStateChange((state) => {
      console.log("onTriggerStateChange", state);
    });

    HoneywellBarcodeReader.barcodeReaderInfo((details) => {
      //console.log('barcodeReaderClaimed', details);
    });

    return async () => {};
  }, [
    transactionId,
    quantity,
    isFocused,
  ]);

  const onToggleSnackBar = (message, code) => {
    const backgroundColor =
      code === 200 ? "rgb(80, 189, 160)" : "rgb(210, 43, 43)";

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: { backgroundColor },
    });
  };

  const onDismissSnackBar = () =>
    setSnackbarInfo({ visible: false, message: "" });

  //scan Validation API
  const scanValidation = async (barcodeData) => {
    console.log("scan validation call....");
    try {
      const productId = await AsyncStorage.getItem("productId");
      const batchId = await AsyncStorage.getItem("batchId");

      const payload = {
        productId,
        batchId,
        uniqueCode: barcodeData,
      };
      console.log("Payload for scan/validation :", payload);
      const backendUrl = await AsyncStorage.getItem("BackendUrl");
      console.log("Backend url ", backendUrl);
      
      const scanRes = await axios.post(
        `${backendUrl}/scan/validation`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("scan/validation APIs Res :", scanRes.data);

      if (scanRes.data.success) {
        console.log(scanRes.data.message, 200);
        return true;
      } else {
        console.log("Invalid scan res :", scanRes.data.message);
        onToggleSnackBar(scanRes.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error to scan validation API call", error);
    }
  };

  //packaging Hierarchy API
  const handleScannedData = async () => {
    decodeAndSetConfig(setConfig, await AsyncStorage.getItem("authToken"));
    backendUrl.current = await AsyncStorage.getItem("BackendUrl");
    try {
      const productId = await AsyncStorage.getItem("productId");
      // const batchId = await AsyncStorage.getItem("batchId");
      console.log("productId :-", productId);
  
      const response = await axios.post(
        `${backendUrl.current}/product/packagingHierarchy`,
        {
          audit_log: {
            audit_log: config?.config?.audit_logs,
            remarks: "none",
          },
          productId: productId
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("Packaging Hierarchy API Res :", response.data);
  
      if (response.data.success === true && response.data.code === 200) {
        onToggleSnackBar(response.data.message, response.data.code);
        if (response?.data?.data?.scannedCodes?.length > 0) {
          setData(response?.data?.data?.scannedCodes);
        }
        setQuantity(response.data.data.quantity);
        setTransactionId(response.data.data.transactionId);
      } else {
        console.log(response.data.message)
        onToggleSnackBar(response.data.message, 400);
      }
    } catch (err) {
      console.log("Error :", err);
    }
  };
  //console.log('Total Quantity :', totalQuantity);

  //codescan API
  const codeScan = async (barcodeData) => {
    console.log("Code scan API called......");

    try {
      const productId = await AsyncStorage.getItem("productId");
      const batchId = await AsyncStorage.getItem("batchId");
      const authToken = await AsyncStorage.getItem("authToken");

      const payload = {
        uniqueCode: barcodeData,
        transactionId,
        quantity
      };

      if (config?.config?.audit_logs) {
        payload["audit_log"] = {
          audit_log: true,
          performed_action: `Scan transaction completed with Transaction ID: ${transactionId}, Product ID: ${productId}, Batch ID: ${batchId}, and scanned by User ID: ${config.userId}.`,
          remarks: "none",
        };
      }
      console.log("Payload for codeScan API request:", payload);

      // Making the API call
      const codeScanResponse = await axios.post(
        `${backendUrl.current}/scan/codescan`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("codeScan API Response:", codeScanResponse.data);

      if (codeScanResponse.data.success && codeScanResponse.data.code === 200) {
        setData((prevData) => {
          const alreadyExist = prevData.includes(barcodeData);
          return alreadyExist ? [...prevData] : [...prevData, barcodeData];
        });

        onToggleSnackBar(codeScanResponse.data.message, 200);
        console.log("Transaction ID:", transactionId);

        // Update state with new response data.
        const responseData = codeScanResponse.data.data;
        setTransactionId(responseData.transactionId);
        setQuantity(responseData.quantity);
        setSerialNumber(responseData.serialNo);
        setSsccNumber(responseData.sscc_code);
      } else {
        onToggleSnackBar(
          codeScanResponse.data.message,
          codeScanResponse.data.code
        );
      }
    } catch (error) {
      console.error("Error during code scan API call:", error);
    }
  };

  const handleEndTransaction = () => {
    console.log("End transaction button pressed..");
    setParentModalVisible(true);
  };

  const handleParentModalDismiss = async (confirmed) => {
    setParentModalVisible(false);
    setTransactionStatus(confirmed ? "completed" : "failed");

    if (confirmed && ssccNumber) {
      await handlePrintCode(ssccNumber, parseInt(serialNumber));
    }
  };

  const handleChildModalDismiss = () => {
    setChildModalVisible(false);
  };

  //Print SSCC codes API
  const handlePrintCode = async (ssccCode, serialNo) => {
    console.log("print payload ", {
      ssccCode,
      serialNo,
      macAddress: await DeviceInfo.getUniqueId(),
    });
    
    try {
      const res = await axios.post(
        `${backendUrl.current}/print`,
        {
          ssccCode,
          serialNo,
          macAddress: await DeviceInfo.getUniqueId(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("Response of handle print ", res.data);

      if (res.data.success === true && res.data.code === 200) {
        setData([]);
        handleScannedData();
        setChildModalVisible(true);
      } else {
        onToggleSnackBar(res.data.message, res.data.code);
      }
    } catch (error) {
      console.log("Error to print code for ", error);
    }
  };

  const handleAggregateState = async (currentState) => {
    console.log(currentState);

    const payload = {
      aggregatedTransactionId: transactionId,
      quantity: quantity,
      scannedCodes: data,
    };
    try {
      // if (state === 'inactive' || state === 'background') {
      const res = await axios.post(
        `${backendUrl.current}/aggregationtransaction/handleAggregatedTransactionScanState`,
        {
          ...payload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        }
      );
      console.log(
        "Response for handleAggregatedTransactionScanState ",
        res.data
      );

      if (res.data.success === true && res.data.code === 200) {
        onToggleSnackBar(res.data.message, res.data.code);
      } else {
        onToggleSnackBar(res.data.message, res.data.code);
      }
      // }
    } catch (error) {
      console.log(
        "Error to Aggregated Transaction Scan State code for ",
        SsccCode
      );
    }
  };

  AppState.addEventListener(
    "change",
    async (currentState) =>
      currentState == "background" && (await handleAggregateState())
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => navigation.navigate("Aggregation")}
          />
          <Appbar.Content title="Scan List" />
        </Appbar.Header>

        <View style={styles.formContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Pack Level:</Text>
            <Text style={styles.label2}>{'1'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.label3} keyboardType="numeric">
              {quantity}
            </Text>
          </View>
        </View>

        {/* <View>
          <Text>PID : {router.params?.id}</Text>
          <Text>BID : {router.params?.bid}</Text>
        </View> */}

        <Divider />
        <View style={styles.ListSubheaderView}>
          <Text style={styles.ListSubheader}>{data.length} Scanned Codes</Text>
        </View>
        {/* <Divider /> */}

        <ScrollView contentContainerStyle={styles.container}>
          <List.Section style={{ flexDirection: "column-reverse" }}>
            {data.map((item, index) => (
              <List.Item
                key={index}
                title={item}
                left={() => (
                  <Feather
                    name="package"
                    size={25}
                    style={{ paddingRight: 0 }}
                  />
                )}
              />
            ))}
          </List.Section>
        </ScrollView>

        <Divider />

        <Snackbar
          visible={snackbarInfo.visible}
          onDismiss={onDismissSnackBar}
          duration={3000}
          style={[styles.snackbar, snackbarInfo.snackbarStyle]}
        >
          {snackbarInfo.message}
        </Snackbar>
        <TouchableOpacity
          mode="contained"
          disabled={quantity!==0}
          style={styles.submitButton}
          onPress={handleEndTransaction}
        >
          <Text style={styles.endTranTxt}>End Transaction</Text>
        </TouchableOpacity>

        {/* Parent Modal (Confirmation) */}
        <Portal>
          <Modal
            visible={parentModalVisible}
            onDismiss={async () => await handleParentModalDismiss(false)} // Dismiss on Cancel
            contentContainerStyle={styles.modalContainer}
          > 
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan List</Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View>
                <MaterialCommunityIcons
                  name="cloud-print"
                  size={50}
                  color="#000000"
                  style={styles.statusSuccess}
                />
              </View>
              <Text style={styles.modalText}>
                Shipper printing in progress..
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={async () => await handleParentModalDismiss(true)} // Confirm button action
                style={styles.modalConfirmButton}
              >
                Confirm
              </Button>
              <Button
                mode="contained"
                onPress={async () => await handleParentModalDismiss(false)} // Cancel button action
                style={styles.modalButton}
              >
                Cancel
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
                <MaterialIcons
                  name="done"
                  size={50}
                  color="#000000"
                  style={styles.statusSuccess}
                />
              </View>
              <Text style={styles.modalSuccessText}>Printing Completed!</Text>
            </ScrollView>

            <View style={styles.childModalFooter}>
              <Button
                mode="contained"
                onPress={handleChildModalDismiss}
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
                <MaterialIcons
                  name="sms-failed"
                  size={50}
                  color="#000000"
                  style={styles.statusSuccess}
                />
              </View>
              <Text style={styles.modalFailedText}>
                Shipper printing Failed!
              </Text>
            </ScrollView>

            <View style={styles.childModalFooter}>
              <Button
                mode="contained"
                onPress={handleChildModalDismiss}
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
