//app/components/HomeScreen/HomeScreen.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Card, Text } from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screenPrivileges } from '../../utils/screenPrivileges';
//import styles from '../../styles/home';

function HomeScreen() {
  const navigation = useNavigation();
  const [backendUrl, setBackendUrl] = useState(null);

  const { width, height } = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  console.log(width, height, 'height and weight');
  console.log('screenDimensions', screenDimensions);

  const [cssStyle, setCssStyle] = useState({
    imageView: {
      marginLeft: width * 0.05, // 5% of screen width
    },
    img: {
      height: width * 0.6, // 60% of screen width for responsiveness
      width: width * 0.6, // Maintain square aspect ratio
      marginLeft: width * 0.15, // Center the image horizontally
      marginTop: height * 0.01,
    },
    headerTxt: {
      textAlign: 'center',
      fontSize: width * 0.05, // font size based on screen width
      fontWeight: 'bold',
    },
    container: {
      flex: 1,
      //backgroundColor: 'lightblue',
      borderRadius: 20,
      justifyContent: 'center'
      // display:'grid',
      // alignitems:'end',
    },

    btnGroups: {
      // marginBottom: height * 0.05,
      marginTop: height * 0.02,
      marginRight: width * 0.00, // 15% margin on the right
      marginLeft: width * 0.00, // 15% margin on the leftw
      //backgroundColor: 'yellow',
      borderRadius: 30,
      flexWrap: 'wrap',
      height: height * 0.30,
      justifyContent:'center'
    },
    TouchableBtn: {
      padding: width * 0.05, // Padding based on width
      flexDirection: 'row',
      backgroundColor: 'rgb(80, 189, 160)',
      //marginBottom: height * 0.015, // marginBottom based on screen height
      borderRadius: 5,
      margin: width * 0.02,
      justifyContent: 'center',
      width: width * 0.5,
    },
    BtnIconStyle: {
      // paddingRight:30,
      paddingLeft: width * 0.0, // Padding left based on width
      color: 'white',
      paddingTop: 1,
      flexDirection: 'row',
      //backgroundColor:'red',
      marginRight: 10,
    },
    btnGroupsText: {
      color: 'white',
      fontSize: width * 0.04, // font size based on width
      // paddingLeft: 24,
      textTransform: 'uppercase',
      paddingTop: 3,
      justifyContent: 'flex-start',
      textAlign: 'center',
      flex: 1,
    },
    textGroups: {
      // marginTop: 258,
      marginTop: height * 0.02, // Adjusting margin top based on height
      // backgroundColor:'red',
    },
  });
  const handleAggregationBtn = () => {
    //console.log("Aggregation Btn Called..");
    navigation.navigate('Aggregation');
  };
  const handleDropoutBtn = () => {
    console.log('Dropout Btn Called..');
    navigation.navigate('Dropout');
  };
  const handleReprintBtn = () => {
    console.log('Reprint Btn Called..');
    navigation.navigate('Reprint');
  };
  const handleRemapBtn = () => {
    console.log('Remap Called..');
    navigation.navigate('Remap');
  };
  const handleCodeReplaceBtn = () => {
    console.log('Code Replace Called..');
    navigation.navigate('Code Replace');
  };

  const handleTrackCodeBtn = () => {
    console.log('Track code Btn pressed');
    navigation.navigate('Track Code');
  }


  const [screens, setScreens] = useState([
    {
      component: (
        <TouchableOpacity
          key={'1'}
          style={cssStyle.TouchableBtn}
          //labelStyle={{fontSize:15}}
          mode="contained"
          onPress={handleAggregationBtn}>
          <Text style={cssStyle.BtnIconStyle}>
            <FontAwesome5
              name="boxes"
              size={25}
              paddingRight={60}
              style={{ paddingRight: 20 }}
            />
          </Text>
          <Text style={cssStyle.btnGroupsText}>Aggregation</Text>
        </TouchableOpacity>
      ),
      name: 'Aggregation',
    },
    {
      component: (
        <TouchableOpacity
          key={'2'}
          style={cssStyle.TouchableBtn}
          //labelStyle={{fontSize:15}}
          mode="contained"
          onPress={handleDropoutBtn}>
          <Text style={cssStyle.BtnIconStyle}>
            <MaterialCommunityIcons
              name="alert-box"
              size={25}
              style={{ paddingRight: 60 }}
            />
          </Text>
          <Text style={cssStyle.btnGroupsText}>Dropout</Text>
        </TouchableOpacity>
      ),
      name: 'Dropout',
    },
    {
      component: (
        <TouchableOpacity
          key={'3'}
          mode="contained"
          style={cssStyle.TouchableBtn}
          //labelStyle={{fontSize:15}}
          onPress={handleReprintBtn}>
          <Text style={cssStyle.BtnIconStyle}>
            <MaterialCommunityIcons
              name="cloud-print"
              size={25}
              style={{ paddingRight: 60 }}
            />
          </Text>
          <Text style={cssStyle.btnGroupsText}>Reprint</Text>
        </TouchableOpacity>
      ),
      name: 'Reprint',
    },
    {
      component: (
        <TouchableOpacity
          key={'4'}
          mode="contained"
          style={cssStyle.TouchableBtn}
          //labelStyle={{fontSize:15}}
          onPress={handleRemapBtn}>
          <Text style={cssStyle.BtnIconStyle}>
            <FontAwesome5
              name="map-marked-alt"
              size={25}
              style={{ paddingRight: 60 }}
            />
          </Text>
          <Text style={cssStyle.btnGroupsText}>Remap</Text>
        </TouchableOpacity>
      ),
      name: 'Code Remap',
    },
    {
      component: (
        <TouchableOpacity
          key={'5'}
          mode="contained"
          style={cssStyle.TouchableBtn}
          //labelStyle={{fontSize:15}}
          onPress={handleCodeReplaceBtn}>
          <Text style={cssStyle.BtnIconStyle}>
            <MaterialCommunityIcons
              name="find-replace"
              size={25}
              style={{ paddingRight: 60 }}
            />
          </Text>
          <Text style={cssStyle.btnGroupsText}>Code Replace</Text>
        </TouchableOpacity>
      ),
      name: 'Code Replace',
    },
  ]);

  console.log("Registered Home screens :->", screens);

  useEffect(() => {
    console.log('user entered backendUrl :', backendUrl);
    (async () => setScreens(await screenPrivileges(screens)))();
    // setCssStyle()
  }, []);

  //Back End URL get this page using Async Storage
  useEffect(() => {
    const loadURL = async () => {
      try {
        const storedUrl = await AsyncStorage.getItem('BackendUrl');
        console.log('Backend URL get for home Page :', storedUrl);
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
  }, []);
  console.log('Home Page URL :', backendUrl);
  console.log(cssStyle.img);

  return (
    <>
      <View style={cssStyle.container}>
        {/* <View>
          <Text>Back-End URL : {backendUrl}</Text>
          </View> */}
        <View style={cssStyle.imageView}>
          <Image
            source={require('../../assets/images/Aggregation.png')}
            style={cssStyle.img}
          />
        </View>
        {/* <View>
            <Card style={styles.card}>
            <Card.Cover
            source={require('../../assets/images/Aggregation.png')}
            style={styles.img}
            />
            </Card>
            </View> */}
        <View style={cssStyle.textGroups}>
          <Text style={cssStyle.headerTxt}>Welcome to Inspecta-Trace</Text>
          <Text style={cssStyle.headerTxt}>
            What would you like to do today?
          </Text>
        </View>

        <View>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={cssStyle.btnGroups}>
              {screens?.map(screen => screen.component)}
              <TouchableOpacity
                key={'6'}
                mode="contained"
                style={cssStyle.TouchableBtn}
                onPress={handleTrackCodeBtn}>
                <Text style={cssStyle.BtnIconStyle}>
                  <MaterialIcons
                    name="share-location"
                    size={25}
                    style={{ paddingRight: 60 }}
                  />
                </Text>
                <Text style={cssStyle.btnGroupsText}>Track Code</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

      </View>
    </>
  );
}

export default HomeScreen;