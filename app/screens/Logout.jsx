//app/screens/Logout.jsx

import React, { useState,useEffect } from "react";
import { Text, Alert, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // To handle token storage
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native"; // Import useNavigation to navigate
import { Dialog, Portal, Button as PaperButton } from "react-native-paper";
import { url } from "../../utils/constant";

function Logout({ route }) {
  const [visible, setVisible] = useState(false); // Modal visibility state
  const navigation = useNavigation(); // Get navigation object using the hook
  const { setIsAuthenticated } = route.params; // Retrieve setIsAuthenticated from params

  // Show the logout confirmation modal
  const showModal = () => setVisible(true);

  // Hide the logout confirmation modal
  const hideModal = () => setVisible(false);

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        return;
      }

      // Make the logout API request
      const response = await axios.post(
        `${url}/auth/logout`,
        {}, 
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Handle successful logout
      if (response.data.success) {
        await AsyncStorage.removeItem("authToken");
        setIsAuthenticated(false);
        hideModal();
        //Alert.alert("Success", "You have been logged out!");
        navigation.navigate("Login");
        console.log("User Logged Out Successfully..");
        
      } else {
        // Handle error response
        hideModal();
        navigation.navigate("Home")
        Alert.alert("Error", response.data.message || "Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      hideModal();
      Alert.alert("Error", "An error occurred while logging out. Please try again.");
    }
  };

  // Show the modal when the screen is focused
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
