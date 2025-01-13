import React, {useState} from 'react';
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

const Login = ({route, navigation}) => {
  const {setIsAuthenticated} = route.params;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });
  const [passwordShow, setPasswordShow] = useState(false);
  const [showReLogin, setShowReLogin] = useState(false);

  const onToggleSnackBar = message => setSnackbarInfo({visible: true, message});
  const onDismissSnackBar = () =>
    setSnackbarInfo({visible: false, message: ''});
  console.log('process env :', url);

  const handleLogin = async (forceFully = false) => {
    console.log('Force fully ', forceFully);
    if (!username) {
      onToggleSnackBar('Username cannot be Empty!');
      return;
    }
    if (!password) {
      onToggleSnackBar('Password cannot be Empty!');
      return;
    }

    try {
      console.log('api calling....');
      const res = await axios.post(
        `${url}/auth/login`,
        {
          user_id: username,
          password,
          forceFully
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('api called...');
      console.log('Login :', res.data);

      if (res.data.success) {
        await AsyncStorage.setItem('authToken', res.data.data.token);
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
      } else {
        onToggleSnackBar('Invalid username or password.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
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
            <Text style={styles.subtitle}>
              Please sign-in to your account and start the adventure
            </Text>

            <View style={styles.inputs}>
              <TextInput
                label="Username"
                style={styles.input}
                placeholder="Enter Username"
                value={username}
                onChangeText={setUsername}
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
            <Button mode="contained" onPress={() => handleLogin(false)} style={styles.btn}>
              LOGIN
            </Button>
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
              <Text style={styles.modalTitle}>You are already login please confirm to relogin</Text>
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
    backgroundColor: '#ddd',
  },
  modalButtonText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#fff',
        verticalAlign: 'middle'
    },
});

export default Login;
