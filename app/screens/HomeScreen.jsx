//app/components/HomeScreen/HomeScreen.tsx

import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import {Card, Text} from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useBackendurlContext} from '../../context/backendUrlContext';

function HomeScreen() {
  const navigation = useNavigation();
  const {isBackendUrl} = useBackendurlContext();
  const [backendUrl, setBackendUrl] = useState(null);
  const {width, height} = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  console.log(width, height, 'height and weight');
  console.log('screenDimensions', screenDimensions);

  useEffect(() => {
    console.log('Context backendurl home :', isBackendUrl);
    console.log('user entered backendUrl :', backendUrl);
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

  const imageView = {
    marginLeft: width * 0.05, // 5% of screen width
  };
  const img = {
    height: width * 0.6, // 60% of screen width for responsiveness
    width: width * 0.6, // Maintain square aspect ratio
    marginLeft: width * 0.15, // Center the image horizontally
    marginTop: height * 0.01,
  };
  const btnGroups = {
    // marginBottom: height * 0.05,
    marginTop: height * 0.02,
    marginRight: width * 0.15, // 15% margin on the right
    marginLeft: width * 0.15, // 15% margin on the leftw
    borderRadius: 0,
    // backgroundColor:'yellow',
  };
  const headerTxt = {
    textAlign: 'center',
    fontSize: width * 0.05, // font size based on screen width
    fontWeight: 'bold',
  };
  const container = {
    flex: 1,
    // display:'grid',
    // alignitems:'end',
  };
  const TouchableBtn = {
    padding: width * 0.02, // Padding based on width
    flexDirection: 'row',
    backgroundColor: 'rgb(80, 189, 160)',
    marginBottom: height * 0.015, // marginBottom based on screen height
    borderRadius: 4,
  };
  const BtnIconStyle = {
    // paddingRight:30,
    paddingLeft: width * 0.1, // Padding left based on width
    color: 'white',
    paddingTop: 1,
    flexDirection: 'row',
  };
  const btnGroupsText = {
    color: 'white',
    fontSize: width * 0.04, // font size based on width
    // paddingLeft: 24,
    textTransform: 'uppercase',
    paddingTop: 3,
    justifyContent: 'flex-start',
    textAlign: 'center',
    flex: 1,
  };
  const textGroups = {
    // marginTop: 258,
    marginTop: height * 0.02, // Adjusting margin top based on height
    // backgroundColor:'red',
  };
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
  return (
    <>
      <View style={container}>
        {/* <View>
          <Text>Back-End URL : {backendUrl}</Text>
        </View> */}
        <View style={imageView}>
          <Image
            source={require('../../assets/images/Aggregation.png')}
            style={img}
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
        <View style={textGroups}>
          <Text style={headerTxt}>Welcome to Inspecta-Trace</Text>
          <Text style={headerTxt}>What would you like to do today?</Text>
        </View>

        <View style={btnGroups}>
          <TouchableOpacity
            style={TouchableBtn}
            //labelStyle={{fontSize:15}}
            mode="contained"
            onPress={handleAggregationBtn}>
            <Text style={BtnIconStyle}>
              <FontAwesome5
                name="boxes"
                size={25}
                paddingRight={60}
                style={{paddingRight: 20}}
              />
            </Text>
            <Text style={btnGroupsText}>Aggregation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={TouchableBtn}
            //labelStyle={{fontSize:15}}
            mode="contained"
            onPress={handleDropoutBtn}>
            <Text style={BtnIconStyle}>
              <MaterialCommunityIcons
                name="alert-box"
                size={25}
                style={{paddingRight: 60}}
              />
            </Text>
            <Text style={btnGroupsText}>Dropout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            mode="contained"
            style={TouchableBtn}
            //labelStyle={{fontSize:15}}
            onPress={handleReprintBtn}>
            <Text style={BtnIconStyle}>
              <MaterialCommunityIcons
                name="cloud-print"
                size={25}
                style={{paddingRight: 60}}
              />
            </Text>
            <Text style={btnGroupsText}>Reprint</Text>
          </TouchableOpacity>
          <TouchableOpacity
            mode="contained"
            style={TouchableBtn}
            //labelStyle={{fontSize:15}}
            onPress={handleRemapBtn}>
            <Text style={BtnIconStyle}>
              <FontAwesome5
                name="map-marked-alt"
                size={25}
                style={{paddingRight: 60}}
              />
            </Text>
            <Text style={btnGroupsText}>Remap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            mode="contained"
            style={TouchableBtn}
            //labelStyle={{fontSize:15}}
            onPress={handleCodeReplaceBtn}>
            <Text style={BtnIconStyle}>
              <MaterialCommunityIcons
                name="find-replace"
                size={25}
                style={{paddingRight: 60}}
              />
            </Text>
            <Text style={btnGroupsText}>Code Replace</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
export default HomeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // backgroundColor: 'lightblue',
//     // borderColor:'red',
//     // borderWidth:2,
//   },
//   imageView: {
//     marginLeft: 20,
//   },
//   img: {
//     //backgroundColor: 'lightblue',
//     height: 250,
//     width: 250,
//     marginLeft: '15%',
//     marginTop: 0,
//     marginLeft: 35,
//   },
//   card: {
//     marginLeft: 22,
//     borderRadius: 0,
//     //elevation:5,
//     height: 0,
//     //backgroundColor:'blue',
//   },
//   btn: {
//     padding: 8,
//     //marginBottom: 10,
//     borderRadius: 2,
//   },
//   btnGroups: {
//     marginTop: 2,
//     marginRight: 55,
//     marginLeft: 55,
//     borderRadius: 0,
//     //backgroundColor:'yellow',
//   },
//   textGroups: {
//     //marginTop: 258,
//     marginTop: 3,
//     //backgroundColor:'red',
//   },
//   headerTxt: {
//     textAlign: 'center',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   subHeaderTxt: {
//     textAlign: 'center',
//     fontSize: 15,
//   },
//   TouchableBtn: {
//     padding: 8,
//     flexDirection: 'row',
//     backgroundColor: 'rgb(80, 189, 160)',
//     marginBottom: 6,
//     borderRadius: 4,
//   },
//   BtnIconStyle: {
//     //paddingRight:30,
//     paddingLeft: 25,
//     color: 'white',
//     paddingTop: 1,
//     //display:'flex',
//     justifyContent: 'center',
//     //backgroundColor:'red',
//     flexDirection: 'row',
//   },
//   btnGroupsText: {
//     color: 'white',
//     fontSize: 16,
//     //paddingLeft: 24,
//     textTransform: 'uppercase',
//     paddingTop: 3,
//     //justifyContent:'flex-end',
//     justifyContent: 'flex-start',
//     textAlign: 'center',
//     //textAlign:'left',
//     //textAlign:'right',
//     //textAlign:'justify',
//     flex: 1,
//   },
// });
