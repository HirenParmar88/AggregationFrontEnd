import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, Snackbar } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {url}  from '../../utils/constant';
import { useNavigation } from '@react-navigation/native';

const Login = ({ route, navigation }) => {
  const { setIsAuthenticated } = route.params;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarInfo, setSnackbarInfo] = useState({ visible: false, message: '' });
  const [passwordShow, setPasswordShow] = useState(false);

  const onToggleSnackBar = (message) => setSnackbarInfo({ visible: true, message });
  const onDismissSnackBar = () => setSnackbarInfo({ visible: false, message: '' });
  console.log("process env :",url);
  
  const handleLogin = async () => {
    if (!username && !password) {
      onToggleSnackBar("Username and Password cannot be Empty!");
      return;
    }
    if (!username) {
      onToggleSnackBar("Username cannot be Empty!");
      return;
    }
    if (!password) {
      onToggleSnackBar("Password cannot be Empty!");
      return;
    }

    try {
      const res = await axios.post(`${url}/auth/login` ,{
        //userId: username,
        user_id: username,
        password,
      }, {
        headers: {
          "Content-Type": 'application/json',
        }
      });
      console.log("Login :",res.data);
      
      if (res.data.success) {
        await AsyncStorage.setItem('authToken', res.data.data.token);
        onToggleSnackBar("Successfully logged in!");

        setTimeout(() => {
          setIsAuthenticated(true);
          navigation.navigate("Home");
        }, 3000); // Wait for 3 seconds before navigating to Home
        
      } else if (res.data.code === 2004) {  
        onToggleSnackBar(res.data.message);
        
        // console.log("you are relogged in successfully !!");
        // Alert.alert("you are relogged in success !!");
        // setTimeout(() => {
        //   setIsAuthenticated(true);
        //   navigation.navigate('Home');
        // }, 3000); // Wait for 3 seconds before navigating to Home

        //const authToken = await AsyncStorage.setItem('authToken', res.data.data.token);
        // console.log("authToken is :",authToken);
      
      }else if(res.data.code === 2012){
        onToggleSnackBar(res.data.message);
        console.log("Users are Already Logged in..");
        
      }
      else {
        onToggleSnackBar("Invalid username or password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      onToggleSnackBar("An error occurred. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView >
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Welcome to E-Quality!</Text>
            <Text style={styles.subtitle}>Please sign-in to your account and start the adventure</Text>

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
                right={<TextInput.Icon icon={!passwordShow ? "eye" : "eye-off"} onPress={() => setPasswordShow(!passwordShow)} />}
                style={styles.input}
                placeholder="Enter Password"
                secureTextEntry={!passwordShow}
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <Button mode="contained" onPress={handleLogin} style={styles.btn}>
              LOGIN
            </Button>
          </View>
        </View>

      </ScrollView>
      <Snackbar
        visible={snackbarInfo.visible}
        onDismiss={onDismissSnackBar}
        duration={3000}  // Show Snackbar for 3 seconds
        style={styles.snackbar}  // Custom style for Snackbar
      >
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
    //padding: 8,
    //paddingTop: 16,
    //marginLeft: 10,
    //backgroundColor:'red'
  },
  card: {
    width: '100%',
    height: '100%',
    //elevation: 4,
    //backgroundColor:'lightblue',
    marginTop:30,
  },
  cardContent:{
    margin:15,
  },
  logo: {
    width: 115,
    height: 72,
    marginBottom: 40,
    alignSelf: 'center',
    marginTop: 50,
    //elevation:,
    padding:30,
    //backgroundColor:'lightblue',
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
    padding:5,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 10,  // Extra space from the bottom if needed
  },
});

export default Login;
