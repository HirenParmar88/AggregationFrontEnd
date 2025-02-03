import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
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
import {url} from '../../utils/constant';
import {useNavigation} from '@react-navigation/native';
//import config from '../../config';

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

  const onToggleSnackBar = message => setSnackbarInfo({visible: true, message});
  useEffect(() => {
    loadURL();
    return () => {
      
    }
  }, [])
  
  const onDismissSnackBar = () =>
    setSnackbarInfo({visible: false, message: ''});
  //console.log('process env :', url);
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
  //console.log('Back-End Dynamic URL Use for Login Page:', backendUrl);

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

      if (res.data.success && res.data.code === 200) {
        const token = res.data.data.token; //store token
        await AsyncStorage.setItem('authToken', token);
        onToggleSnackBar('Successfully logged in!');

        setTimeout(() => {
          setIsAuthenticated(true);
          navigation.navigate('Home');
        }, 3000); // Wait for 3 seconds before navigating to Home
      } else if (res.data.code === 2004) {
        setShowReLogin(true);
      } else if (res.data.code === 2012) {
        onToggleSnackBar(res.data.message);
        console.log('User Already Logged in..');
      } else if (res.data.code === 429) {
        onToggleSnackBar(res.data.message);
        console.log('Too many failed login attempts. Please try again later.');
      } else if (res.data.code === 418) {
        onToggleSnackBar(res.data.message);
        console.log('users blocked :', res.data.message);
      } else if (res.data.code === 401) {
        onToggleSnackBar(res.data.message);
        console.log('users password are expired !!');
      } else {
        onToggleSnackBar('Invalid username or password.');
      }
    } catch (error) {
      console.error('Error while user login :', error);
      onToggleSnackBar('An error occurred. Please try again later.');
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
                style={styles.input}
                placeholder="Enter Username"
                value={userId}
                onChangeText={setUserId}
              />

              <TextInput
                label="Password"
                right={
                  <TextInput.Icon
                    icon={!passwordShow ? 'eye' : 'eye-off'}
                    onPress={() => setPasswordShow(!passwordShow)}
                  />
                }
                style={styles.input}
                placeholder="Enter Password"
                secureTextEntry={!passwordShow}
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <Button
              mode="contained"
              onPress={() => handleLogin(false)}
              style={styles.btn}>
              LOGIN
            </Button>
            {/* <Text>{config.API_URL}</Text> */}
          </View>
        </View>
      </ScrollView>
      {/* Modal for Confirm Batch Dropout */}
      <Portal>
        <Modal
          visible={showReLogin}
          onDismiss={() => setShowReLogin(false)}
          contentContainerStyle={styles.reloginContainer}>
          <View style={{flex: 1}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                You are already login please confirm to relogin
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowReLogin(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleLogin(true)}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Portal>
      <Snackbar
        visible={snackbarInfo.visible}
        onDismiss={onDismissSnackBar}
        duration={3000}
        style={styles.snackbar}>
        {snackbarInfo.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloginContainer: {
    backgroundColor: 'white',
    height: 200,
    width: 300,
    marginLeft: 35,
    borderRadius: 2,
    display: 'grid',
    alignContent: 'space-between',
  },
  card: {
    width: '100%',
    height: '100%',
    marginTop: 30,
  },
  cardContent: {
    margin: 15,
  },
  logo: {
    width: 115,
    height: 72,
    marginBottom: 40,
    alignSelf: 'center',
    marginTop: 50,
    padding: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputs: {
    marginVertical: 16,
    marginTop: '10%',
  },
  input: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 18,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  btn: {
    borderRadius: 4,
    padding: 5,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 10, // Extra space from the bottom if needed
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalFooter: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    width: 100,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 2,
  },
  confirmButton: {
    backgroundColor: 'rgb(80, 189, 160)',
  },
  cancelButton: {
    backgroundColor: '#878f99',
  },
  modalButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    verticalAlign: 'middle',
  },
});

export default Login;
