import React, {useState, useEffect, useCallback} from 'react';
import {NavigationContainer, useFocusEffect} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Login from './app/screens/Login'; // Import your Login screen
import HomeScreen from './app/screens/HomeScreen';
import AggregationComponent from './app/screens/Aggregation';
import Reprint from './app/screens/Reprint';
import RemapScreen from './app/screens/Remap';
import CodeReplaceScreen from './app/screens/CodeReplace';
import Logout from './app/screens/Logout';
import ScanList from './app/screens/ScanList';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import DropoutFun from './app/screens/Dropout';
import EsignPage from './app/screens/Esign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import SettingScreen from './app/screens/Settings';
import LoaderComponent from './app/components/Loader';
import UrlScreen from './app/screens/UrlScreens';
import {screenPrivileges} from './utils/screenPrivileges';
//import GetNetInfo from './app/components/NetInfo';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const DRAWER_SCREENS = [
  {
    component: (
      <Drawer.Screen
        name="Aggregation"
        component={AggregationComponent}
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
    ),
    name: 'Aggregation',
  },
  {
    component: (
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
    ),
    name: 'Dropout',
  },
  {
    component: (
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
    ),
    name: 'Reprint',
  },
  {
    component: (
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
    ),
    name: 'Code Remap',
  },
  {
    component: (
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
    ),
    name: 'Code Replace',
  },
  {
    component: (
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
    ),
    name: 'Settings',
  },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [backendURL, setBackendUrl] = useState('');
  const [screens, setScreens] = useState([]);

  useEffect(() => {
    (async () => {
      console.log('App useEffect calll..');
      const token = await AsyncStorage.getItem('authToken');
      setBackendUrl(await AsyncStorage.getItem('BackendUrl'));

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

      const updatedScreens = await screenPrivileges(DRAWER_SCREENS);
      setScreens(updatedScreens);
    })();
  }, [isAuthenticated]);

  if (loading) {
    return <LoaderComponent />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // If authenticated, show the Drawer Navigator
        <Drawer.Navigator initialRouteName="Home">
          <Drawer.Screen
            name="Home"
            component={HomeScreen}
            options={{
              drawerIcon: ({focused, size}) => (
                <AntDesign
                  name="home"
                  size={size}
                  color={focused ? '#000000' : '#000000'}
                />
              ),
            }}
          />

          {screens.map(screen => screen.component)}

          <Drawer.Screen
            name="ScanList"
            component={ScanList}
            options={{
              drawerItemStyle: {display: 'none'}, //to hide the drawer Item
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
            name="Esign"
            component={EsignPage}
            options={{
              drawerItemStyle: {display: 'none'},
              headerShown: true,
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
            name="Logout"
            component={Logout}
            initialParams={{setIsAuthenticated, setScreens}}
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
            name="GetNetInfo"
            component={GetNetInfo}
            initialParams={{setIsAuthenticated, setScreens}}
            options={{
              drawerLabel: 'GetNetInfo',
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
        <Stack.Navigator
          initialRouteName={backendURL != null ? 'Login' : 'UrlScreen'}>
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
