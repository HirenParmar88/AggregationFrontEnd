import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  Snackbar,
  Modal,
  Portal,
} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import styles from '../../styles/login';

const Login = ({route}) => {
  const navigation = useNavigation();
  const {setIsAuthenticated} = route.params;
  const [backendUrl, setBackendUrl] = useState(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });
  const [passwordShow, setPasswordShow] = useState(false);
  const [showReLogin, setShowReLogin] = useState(false);

  const onToggleSnackBar = (message, code) => {
    const backgroundColor =
      code === 200 ? 'rgb(80, 189, 160)' : 'rgb(210, 43, 43)';

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: {backgroundColor},
    });
  };

  const onDismissSnackBar = () =>
    setSnackbarInfo({visible: false, message: ''});

  useEffect(() => {
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
    return () => {};
  }, []);
  //console.log('process env :', url);
  console.log('Back-End Dynamic URL Use for Login Page:', backendUrl);

  const handleLogin = async (forceFully = false) => {
    console.log('Force fully :', forceFully);
    console.log(backendUrl);

    if (!userId) {
      onToggleSnackBar('Username cannot be Empty!');
      return;
    }
    if (!password) {
      onToggleSnackBar('Password cannot be Empty!');
      return;
    }
    try {
      console.log('api calling....');
      //console.log("BACKEND DYNAMIC URLs :", config.API_URL);
      console.log('Login URL :', `${backendUrl}/auth/login`);
      const res = await axios.post(
        `${backendUrl}/auth/login`,
        {
          userId: userId,
          password,
          forceFully,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('api called...');
      console.log('Login :', res.data);
      if (res.data.success === true && res.data.code === 200) {
        const token = res.data.data.token; //store token
        await AsyncStorage.setItem('authToken', token);
        console.log("AAAA",res.data.data.screens);
        await AsyncStorage.setItem('screens', JSON.stringify(res.data.data.screens))
        onToggleSnackBar(res.data.message, 200);
        //return res.data;
        setTimeout(() => {
          setIsAuthenticated(true);
          navigation.navigate('Home');
        }, 3000); // Wait for 3 seconds before navigating to Home
      }else if (res.data.code === 2004) {
        setShowReLogin(true);
      }  else {
        onToggleSnackBar(res.data.message,res.data.code);
      }
    } catch (error) {
      console.log(error);
      
      onToggleSnackBar(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Welcome to E-Quality!</Text>
            {/* <Text>backendUrl: {backendUrl}</Text> */}
            <Text style={styles.subtitle}>
              Please sign-in to your account and start the adventure
            </Text>

            <View style={styles.inputs}>
              <TextInput
                label="Username"
                mode="outlined"
                style={styles.usernameInput}
                placeholder="Enter Username"
                value={userId}
                onChangeText={setUserId}
              />

              <TextInput
                label="Password"
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={!passwordShow ? 'eye' : 'eye-off'}
                    onPress={() => setPasswordShow(!passwordShow)}
                  />
                }
                style={styles.passwordInput}
                placeholder="Enter Password"
                secureTextEntry={!passwordShow}
                value={password}
                onChangeText={setPassword}
              />
            </View>
            {/* <Button
              mode="contained"
              onPress={() => handleLogin(false)}
              style={styles.btn}>
              LOGIN
            </Button> */}
            <TouchableOpacity
              mode="contained"
              style={styles.touchableBtn}
              onPress={() => handleLogin(false)}>
              <Text style={styles.submitBtnText}>LOGIN</Text>
            </TouchableOpacity>
            {/* <Text>{config.API_URL}</Text> */}
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showReLogin}
          onDismiss={() => setShowReLogin(false)}
          contentContainerStyle={styles.reloginContainer}>
          <View style={{flex: 1}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                You are already loggedin please confirm to relogin
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleLogin(true)}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReLogin(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarInfo.visible}
        onDismiss={onDismissSnackBar}
        duration={3000}
        style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
        {snackbarInfo.message}
      </Snackbar>
    </View>
  );
};
export default Login;
