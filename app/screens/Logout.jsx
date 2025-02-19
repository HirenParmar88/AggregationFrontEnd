//app/screens/Logout.jsx
import React, {useState, useEffect} from 'react';
import {Text, Alert, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // To handle token storage
import axios from 'axios';
import {useNavigation, useFocusEffect} from '@react-navigation/native'; // Import useNavigation to navigate
import {Dialog, Portal, Button as PaperButton} from 'react-native-paper';

function Logout({route}) {
  const navigation = useNavigation(); 
  const [backendUrl, setBackendUrl] = useState(null);
  const [visible, setVisible] = useState(false); 
  const {setIsAuthenticated} = route.params; 
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  useEffect(() => {
    const loadURL = async () => {
      try {
        const storedUrl = await AsyncStorage.getItem('BackendUrl');
        console.log('Backend URL get for LogOut Page :', storedUrl);
        if (storedUrl) {
          setBackendUrl(storedUrl); 
        } else {
          setBackendUrl('No URL found !'); 
        }
      } catch (error) {
        console.error('Error fetching backend url :', error);
      }
    };
    loadURL();
  }, []);

  useEffect(() => {
    if (backendUrl) {
      showModal(); 
    }
  }, [backendUrl]);
  console.log('Back-End URL Use for LogOut Screens:', backendUrl);

  // Handle logout
  const handleLogout = async () => {
    console.log('LogOut URL :', backendUrl);
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Token use for Logout :', token);
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        return;
      }
      // Make the logout API request
      const response = await axios.post(
        `${backendUrl}/auth/logout`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Logout Api Res :', response.data);
      // Handle successful logout
      if (response.data.success && response.data.code === 200) {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('screens');
        setIsAuthenticated(false);
        hideModal();
        navigation.navigate('Login');
        console.log('User Logged Out Successfully..');
      } else {
        hideModal();
        navigation.navigate('Home');
        Alert.alert(
          'Error',
          response.data.message || 'Logout failed. Please try again.',
        );
      }
    } catch (error) {
      console.error('Error logging out:', error);
      hideModal();
      navigation.navigate('Home');
      Alert.alert(
        'Error',
        'An error occurred while logout out. Please try again.',
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (backendUrl) {
        showModal(); 
      }
    }, [backendUrl]),
  );

  const handleCancel = () => {
    hideModal();
    navigation.navigate('Home');
  };

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
