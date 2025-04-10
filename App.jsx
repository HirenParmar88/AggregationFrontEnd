import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
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
import UrlScreen from './app/screens/UrlScreens';
import {screenPrivileges} from './utils/screenPrivileges';
import {useLoading} from './context/LoadingContext';
import TrackCode from './app/screens/TrackCodeScreen';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const {setLoading} = useLoading();
  const [backendURL, setBackendUrl] = useState(null);
  const [screens, setScreens] = useState([]);
  const DRAWER_SCREENS = [
    {
      component: (
        <Drawer.Screen
          key={'1'}
          name="Aggregation"
          component={AggregationComponent}
          initialParams={{setIsAuthenticated}}
          options={{
            headerShown: true,
            drawerActiveBackgroundColor:'rgb(80, 189, 160)',
            drawerActiveTintColor:'#fff',
            drawerIcon: ({focused, size}) => (
              <FontAwesome5
                name="boxes"
                size={size}
                color={focused ? '#fff' : '#000000'}
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
          key={'2'}
          name="Dropout"
          component={DropoutFun}
          initialParams={{setIsAuthenticated}}
          options={{
            headerShown: false,
            drawerActiveBackgroundColor:'rgb(80, 189, 160)',
            drawerActiveTintColor:'#fff',
            //drawerLabel:()=>null,
            //title: null,
            //drawerIcon: () => null,
            drawerIcon: ({focused, size}) => (
              <MaterialCommunityIcons
                name="alert-box"
                size={size}
                color={focused ? '#fff' : '#000000'}
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
          key={'3'}
          name="Reprint"
          component={Reprint}
          initialParams={{setIsAuthenticated}}
          options={{
            headerShown: false,
            drawerActiveBackgroundColor:'rgb(80, 189, 160)',
            drawerActiveTintColor:'#fff',
            drawerIcon: ({focused, size}) => (
              <MaterialCommunityIcons
                name="cloud-print"
                size={size}
                color={focused ? '#fff' : '#000000'}
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
          key={'4'}
          name="Remap"
          component={RemapScreen}
          initialParams={{setIsAuthenticated}}
          options={{
            headerShown: false,
            drawerActiveBackgroundColor:'rgb(80, 189, 160)',
            drawerActiveTintColor:'#fff',
            drawerIcon: ({focused, size}) => (
              <FontAwesome5
                name="map-marked-alt"
                size={size}
                color={focused ? '#fff' : '#000000'}
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
          key={'5'}
          name="Code Replace"
          component={CodeReplaceScreen}
          initialParams={{setIsAuthenticated}}
          options={{
            headerShown: false,
            drawerActiveBackgroundColor:'rgb(80, 189, 160)',
            drawerActiveTintColor:'#fff',
            drawerIcon: ({focused, size}) => (
              <MaterialCommunityIcons
                name="find-replace"
                size={size}
                color={focused ? '#fff' : '#000000'}
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
          key={'6'}
          name="Settings"
          component={SettingScreen}
          initialParams={{setIsAuthenticated}}
          options={{
            headerShown: false,
            drawerActiveBackgroundColor:'rgb(80, 189, 160)',
            drawerActiveTintColor:'#fff',
            drawerIcon: ({focused, size}) => (
              <MaterialIcons
                name="settings"
                size={size}
                color={focused ? '#fff' : '#000000'}
              />
            ),
          }}
        />
      ),
      name: 'Settings',
    },
    // Track Code Drawer Screen Registered
    {
      component: (
        <Drawer.Screen
          key={'7'}
          name="Track Code"
          component={TrackCode}
          initialParams={{setIsAuthenticated}}
          options={{
            headerShown: true,
            drawerActiveBackgroundColor:'rgb(80, 189, 160)',
            drawerActiveTintColor:'#fff',
            drawerIcon: ({focused, size}) => (
              <MaterialIcons
                name="share-location"
                size={size}
                color={focused ? '#fff' : '#000000'}
              />
            ),
          }}
        />
      ),
      name: 'Track Code',
    },
  ];

  useEffect(() => {
    (async () => {
      setLoading(true)
      const token = await AsyncStorage.getItem('authToken');
      const mainUrl = await AsyncStorage.getItem('BackendUrl');
      setBackendUrl(mainUrl);
      if (token) {
        const decoded = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime < decoded.exp) {
          const updatedScreens = await screenPrivileges(DRAWER_SCREENS);
          setIsAuthenticated(true);
          setScreens(updatedScreens);
        } else {
          await AsyncStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    })();
  }, [isAuthenticated]);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // If authenticated, show the Drawer Navigator
        <Drawer.Navigator initialRouteName="Home">
          <Drawer.Screen
            name="Home"
            component={HomeScreen}
            options={{
              drawerActiveBackgroundColor:'rgb(80, 189, 160)',
              drawerActiveTintColor:'#fff',
              drawerIcon: ({focused, size}) => (
                <AntDesign
                  name="home"
                  size={size}
                  color={focused ? '#fff' : '#000000'}
                />
              ),
            }}
          />

          {screens.map(screen => screen.component)}

          {/* add track code menu option temporary */}
          <Drawer.Screen
            name="Track Code"
            component={TrackCode}
            options={{
              headerShown: false,
              drawerActiveBackgroundColor:'rgb(80, 189, 160)',
              drawerActiveTintColor:'#fff',
              drawerIcon: ({focused, size}) => (
               <MaterialIcons
                  name="share-location"
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
              //drawerLabel: 'Logout',
              drawerLabel: () => (
                <Text style={{ color :'rgb(210, 43, 43)'}}>
                  Logout
                </Text>
              ),
              headerShown: false,
              drawerActiveBackgroundColor:'rgb(80, 189, 160)',
              drawerActiveTintColor:'#fff',
              drawerIcon: ({focused, size}) => (
                <MaterialIcons
                  name="logout"
                  size={size}
                  color={focused ? '#000000' : 'rgb(210, 43, 43)'}
                />
              ),
            }} 
          />
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