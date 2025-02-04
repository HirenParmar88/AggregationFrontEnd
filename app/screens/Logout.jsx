//app/screens/Logout.jsx

import React, { useState, useEffect } from "react";
import { Text, Alert, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // To handle token storage
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native"; // Import useNavigation to navigate
import { Dialog, Portal, Button as PaperButton } from "react-native-paper";
//import { url } from "../../utils/constant";

function Logout({ route }) {
  const navigation = useNavigation(); // Get navigation object using the hook
  const [backendUrl, setBackendUrl] = useState(null);
  const [visible, setVisible] = useState(false); // Modal visibility state
  const { setIsAuthenticated } = route.params; // Retrieve setIsAuthenticated from params

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false); 

  const loadURL = async () => {
    try {
      const storedUrl = await AsyncStorage.getItem('BackendUrl');
      console.log('Backend URL get for Login Page :', storedUrl);
      if (storedUrl) {
        setBackendUrl(storedUrl); // Set the URL to state
      } else {
        setBackendUrl('No URL found !'); // Default message if no URL is found
      }
    } catch (error) {
      console.error('Error fetching backend url :', error);
    }
    
  };
  loadURL();
  //console.log("Back-End URL Use for LogOut :", backendUrl);

  // Handle logout
  const handleLogout = async () => {
    console.log("Log out URL :",backendUrl);
    
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log("Token use for Logout :",token);
      
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }
      // Make the logout API request
      const response = await axios.post(
        `${backendUrl}/auth/logout`,
        {}, 
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Logout Api Res :", response.data);
      
      // Handle successful logout
      if (response.data.success && response.data.code === 200) {
        await AsyncStorage.removeItem("authToken");
        setIsAuthenticated(false);
        hideModal();
        //Alert.alert("Success", "You have been logged out!");
        navigation.navigate("Login");
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: "Login" }],
        // });
        console.log("User Logged Out Successfully..");
      } else {
        hideModal();
        navigation.navigate("Home");
        Alert.alert("Error", response.data.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      hideModal();
      navigation.navigate("Home");
      Alert.alert("Error", "An error occurred while logout out. Please try again.");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      showModal(); // Show the modal when the screen is focused
    }, [])
  );

  const handleCancel = () => {
    hideModal();
    navigation.navigate("Home");
  }

  return (
    <>
      <View>
      {/* Custom Modal for Logout Confirmation */}
      <Portal>
        <Dialog visible={visible} onDismiss={hideModal}>
          <Dialog.Title>Logout Confirmation</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to log out?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={handleCancel}>Cancel</PaperButton>
            <PaperButton onPress={handleLogout}>Confirm</PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      </View>
      </>
  );
}

export default Logout;
