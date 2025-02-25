import React, { useEffect, useReducer } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Snackbar,
  Modal,
  Portal,
} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import styles from '../../styles/login';

// Initial state
const initialState = {
  backendUrl: null,
  userId: '',
  password: '',
  snackbarInfo: { visible: false, message: '', snackbarStyle: {} },
  passwordShow: false,
  showReLogin: false,
};

// Reducer function
const loginReducer = (state, action) => {
  //console.log("state,action :->",state,action);
  switch (action.type) {
    case 'SET_BACKEND_URL':
      return { ...state, backendUrl: action.payload };
    case 'SET_USER_ID':
      return { ...state, userId: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'TOGGLE_SNACKBAR':
      return { ...state, snackbarInfo: action.payload };
    case 'TOGGLE_PASSWORD_VISIBILITY':
      return { ...state, passwordShow: !state.passwordShow };
    case 'SET_SHOW_RELOGIN':
      return { ...state, showReLogin: action.payload };
    default:
      return state;
  }
};

const Login = ({ route }) => {
  const navigation = useNavigation();
  const { setIsAuthenticated } = route.params;

  // useReducer to manage state
  const [state, dispatch] = useReducer(loginReducer, initialState);

  const {
    backendUrl,
    userId,
    password,
    snackbarInfo,
    passwordShow,
    showReLogin,
  } = state;
  
  const onToggleSnackBar = (message, code) => {
    const backgroundColor =
      code === 200 ? 'rgb(80, 189, 160)' : 'rgb(210, 43, 43)';
    dispatch({
      type: 'TOGGLE_SNACKBAR',
      payload: { visible: true, message, snackbarStyle: { backgroundColor } },
    });
  };

  const onDismissSnackBar = () =>
    dispatch({
      type: 'TOGGLE_SNACKBAR',
      payload: { visible: false, message: '', snackbarStyle: {} },
    });

  useEffect(() => {
    const loadURL = async () => {
      try {
        const storedUrl = await AsyncStorage.getItem('BackendUrl');
        console.log('Backend URL get for Login Page :', storedUrl);
        if (storedUrl) {
          dispatch({ type: 'SET_BACKEND_URL', payload: storedUrl });
        } else {
          dispatch({ type: 'SET_BACKEND_URL', payload: 'No URL found !' });
        }
      } catch (error) {
        console.error('Error fetching backend url :', error);
      }
    };
    loadURL();
  }, []);

  const handleLogin = async (forceFully = false) => {
    if (!userId) {
      onToggleSnackBar('Username cannot be Empty!');
      return;
    }
    if (!password) {
      onToggleSnackBar('Password cannot be Empty!');
      return;
    }
    try {
      const res = await axios.post(
        `${backendUrl}/auth/login`,
        { userId, password, forceFully },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (res.data.success === true && res.data.code === 200) {
        const token = res.data.data.token;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('screens', JSON.stringify(res.data.data.screens));
        onToggleSnackBar(res.data.message, 200);
        setTimeout(() => {
          setIsAuthenticated(true);
          navigation.navigate('Home');
        }, 3000);
      } else if (res.data.code === 2004) {
        dispatch({ type: 'SET_SHOW_RELOGIN', payload: true });
      } else {
        onToggleSnackBar(res.data.message, res.data.code);
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
                onChangeText={(text) => dispatch({ type: 'SET_USER_ID', payload: text })}
              />

              <TextInput
                label="Password"
                mode="outlined"
                right={
                  <TextInput.Icon
                    icon={!passwordShow ? 'eye' : 'eye-off'}
                    onPress={() => dispatch({ type: 'TOGGLE_PASSWORD_VISIBILITY' })}
                  />
                }
                style={styles.passwordInput}
                placeholder="Enter Password"
                secureTextEntry={!passwordShow}
                value={password}
                onChangeText={(text) => dispatch({ type: 'SET_PASSWORD', payload: text })}
              />
            </View>

            <TouchableOpacity
              mode="contained"
              style={styles.touchableBtn}
              onPress={() => handleLogin(false)}>
              <Text style={styles.submitBtnText}>LOGIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showReLogin}
          onDismiss={() => dispatch({ type: 'SET_SHOW_RELOGIN', payload: false })}
          contentContainerStyle={styles.reloginContainer}>
          <View style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                You are already logged in. Please confirm to relogin.
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
                onPress={() => dispatch({ type: 'SET_SHOW_RELOGIN', payload: false })}>
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
