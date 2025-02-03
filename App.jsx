import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Login from './app/screens/Login'; // Import your Login screen
import HomeScreen from './app/screens/HomeScreen'; // Import your HomeScreen
import ProductComponent from './app/screens/Product';
import Reprint from './app/screens/Reprint';
import RemapScreen from './app/screens/Remap';
import CodeReplaceScreen from './app/screens/CodeReplace';
import Logout from './app/screens/Logout'; // Import Logout with modal
import ScanList from './app/screens/ScanList';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import DropoutFun from './app/screens/Dropout';
import EsignPage from './app/screens/Esign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import SettingScreen from './app/screens/Settings';
import LoaderComponent from './app/components/Loader';
import UrlScreen from './app/screens/UrlScreens';
import { Text, View } from 'react-native';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasSeenUrlScreen, setHasSeenUrlScreen] = useState(false); 
  console.log("Auth ",isAuthenticated)
  
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('authToken');
      const seenUrlScreen = await AsyncStorage.getItem('hasSeenUrlScreen');
      
      if (seenUrlScreen === 'true') {
        setHasSeenUrlScreen(true);
      }

      if (token) {
        const decoded = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime < decoded.exp) {
          setIsAuthenticated(true);
        } else {
          await AsyncStorage.removeItem('authToken'); 
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setLoading(false);
    })();
  }, []);
  if (loading) {
    return(
     <View>
        <Text>Loading..</Text>
     </View>
    ) 
  }

  // useEffect(() => {
  //   (async () => {
  //     await checkUserAuth();
  //   })();

  //   return () => {};
  // }, []);

  // const checkUserAuth = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('authToken');
  //     console.log("Auth TOKEN :", token);
      
  //     const decoded = jwtDecode(token);
  //     //console.log("decode toekn ", decoded)
  //     const currentTime = Math.floor(Date.now() / 1000);

  //     // Check if the token is expired
  //     if (currentTime > decoded.exp) {
  //       //console.log("Token is expired.");
  //       setIsAuthenticated(false);
  //     } else {
  //       console.log('Token is still valid.');
  //       setIsAuthenticated(true);
  //     }
  //   } catch (error) {
  //     console.log('Error in token get ', error);
  //   }
  // };
  console.log('Auth ',isAuthenticated)

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // If authenticated, show the Drawer Navigator
        <Drawer.Navigator initialRouteName="Home">
          <Drawer.Screen
            name="Home"
            component={HomeScreen}
            options={{
              drawerIcon: ({ focused, size }) => (
                <AntDesign name="home" size={size} color={focused ? '#000000' : '#000000'} />
              ),
            }}
          />
          <Drawer.Screen
            name="Aggregation"
            component={ProductComponent}
            options={{
              headerShown: true,
              drawerIcon: ({focused, size}) => (
                <FontAwesome5
                  name="boxes"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Dropout"
            component={DropoutFun}
            options={{
              headerShown: false,
              //drawerLabel:()=>null,
              //title: null,
              //drawerIcon: () => null,
              drawerIcon: ({focused, size}) => (
                <MaterialCommunityIcons
                  name="alert-box"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="ScanList"
            component={ScanList}
            options={{
              drawerItemStyle: { display: 'none' }, //to hide the drawer Item
              headerShown: false,
              drawerIcon: ({focused, size}) => (
                <MaterialCommunityIcons
                  name="barcode-scan"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Reprint"
            component={Reprint}
            options={{
              headerShown: false,
              drawerIcon: ({focused, size}) => (
                <MaterialCommunityIcons
                  name="cloud-print"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Remap"
            component={RemapScreen}
            options={{
              headerShown: false,
              drawerIcon: ({focused, size}) => (
                <FontAwesome5
                  name="map-marked-alt"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Code Replace"
            component={CodeReplaceScreen}
            options={{
              headerShown: false,
              drawerIcon: ({focused, size}) => (
                <MaterialCommunityIcons
                  name="find-replace"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }}
          />
          <Drawer.Screen
            name='Esign'
            component={EsignPage}
            options={{
              drawerItemStyle:{ display:'none'},
              headerShown: true,
              drawerIcon: ({ focused, size }) => (
                <MaterialCommunityIcons
                  name="barcode-scan"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Settings"
            component={SettingScreen}
            options={{
              headerShown: false,
              drawerIcon: ({focused, size}) => (
                <MaterialIcons
                  name="settings"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }}
          />
          <Drawer.Screen
            name="Logout"
            component={Logout}
            initialParams={{setIsAuthenticated}}
            options={{
              drawerLabel: 'Logout',
              headerShown: false,
              drawerIcon: ({focused, size}) => (
                <MaterialIcons
                  name="logout"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }} // You can customize the label here
          />
          {/* <Drawer.Screen
            name="Loader"
            component={LoaderComponent}
            initialParams={{setIsAuthenticated}}
            options={{
              drawerLabel: 'Loder',
              headerShown: false,
              drawerIcon: ({focused, size}) => (
                <MaterialIcons
                  name="logout"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }} // You can customize the label here
          /> */}
         
        </Drawer.Navigator>
      ) : (
        <Stack.Navigator initialRouteName={hasSeenUrlScreen ? "Login" : "UrlScreen"}>
          <Stack.Screen 
            name="UrlScreen"
            component={UrlScreen}
            options={{headerShown: false}}
          />
        
          <Stack.Screen
            name="Login"
            component={Login}
            initialParams={{setIsAuthenticated}}
            options={{headerShown: false}} // Hide header for login screen
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default App;
