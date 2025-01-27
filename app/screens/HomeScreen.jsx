//app/components/HomeScreen/HomeScreen.tsx

import React from 'react';
import {StyleSheet, View, ScrollView, TouchableOpacity,Image} from 'react-native';
import {Card, Text} from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();
  
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.imageView}>
            <Image source={require('../../assets/images/Aggregation.png')} style={styles.img} />
          </View>
          {/* <View>
            <Card style={styles.card}>
              <Card.Cover
                source={require('../../assets/images/Aggregation.png')}
                style={styles.img}
              />
            </Card>
          </View> */}
          <View style={styles.textGroups}>
            <Text style={styles.headerTxt}>Welcome to Inspecta-Trace</Text>
            <Text style={styles.subHeaderTxt}>
              What would you like to do today?
            </Text>
          </View>

          <View style={styles.btnGroups}>
            <TouchableOpacity
              style={styles.TouchableBtn}
              //labelStyle={{fontSize:15}}
              mode="contained"
              onPress={handleAggregationBtn}>
              <Text style={styles.BtnIconStyle}>
                <FontAwesome5
                  name="boxes"
                  size={25}
                  paddingRight={60}
                  style={{paddingRight: 20}}
                />
              </Text>
              <Text style={styles.btnGroupsText}>Aggregation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.TouchableBtn}
              //labelStyle={{fontSize:15}}
              mode="contained"
              onPress={handleDropoutBtn}>
              <Text style={styles.BtnIconStyle}>
                <MaterialCommunityIcons
                  name="alert-box"
                  size={25}
                  style={{paddingRight: 60}}
                />
              </Text>
              <Text style={styles.btnGroupsText}>Dropout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              mode="contained"
              style={styles.TouchableBtn}
              //labelStyle={{fontSize:15}}
              onPress={handleReprintBtn}>
              <Text style={styles.BtnIconStyle}>
                <MaterialCommunityIcons
                  name="cloud-print"
                  size={25}
                  style={{paddingRight: 60}}
                />
              </Text>
              <Text style={styles.btnGroupsText}>Reprint</Text>
            </TouchableOpacity>
            <TouchableOpacity
              mode="contained"
              style={styles.TouchableBtn}
              //labelStyle={{fontSize:15}}
              onPress={handleRemapBtn}>
              <Text style={styles.BtnIconStyle}>
                <FontAwesome5
                  name="map-marked-alt"
                  size={25}
                  style={{paddingRight: 60}}
                />
              </Text>
              <Text style={styles.btnGroupsText}>Remap</Text>
            </TouchableOpacity>
            <TouchableOpacity
              mode="contained"
              style={styles.TouchableBtn}
              //labelStyle={{fontSize:15}}
              onPress={handleCodeReplaceBtn}>
              <Text style={styles.BtnIconStyle}>
                <MaterialCommunityIcons
                  name="find-replace"
                  size={25}
                  style={{paddingRight: 60}}
                />
              </Text>
              <Text style={styles.btnGroupsText}>Code Replace</Text>
            </TouchableOpacity>
          </View>
       
      </ScrollView>
    </>
  );
}
export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    //backgroundColor: 'lightblue',
    flex: 1,
    paddingBottom: 0,
    // position: 'relative',
    // display: 'flex',
    // justifyContent: 'space-between',
  },
  imageView:{
    marginLeft:20,
  },
  img: {
    //backgroundColor: 'lightblue',
    height: 250,
    width: 250,
    marginLeft: '15%',
    marginTop: 0,
    marginLeft: 35,
  },
  card: {
    marginLeft: 22,
    borderRadius: 0,
    //elevation:5,
    height: 0,
    //backgroundColor:'blue',
  },
  btn: {
    padding: 8,
    marginBottom: 10,
    borderRadius: 2,
  },
  btnGroups: {
    marginTop: 20,
    marginRight: 55,
    marginLeft: 55,
    borderRadius: 0,
    //backgroundColor:'yellow',
  },
  textGroups: {
    //marginTop: 258,
    marginTop:10,
    //backgroundColor:'red',
  },
  headerTxt: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subHeaderTxt: {
    textAlign: 'center',
    fontSize: 15,
  },
  TouchableBtn: {
    padding: 8,
    flexDirection: 'row',
    backgroundColor: 'rgb(80, 189, 160)',
    marginBottom: 6,
    borderRadius: 4,
  },
  BtnIconStyle: {
    //paddingRight:30,
    paddingLeft: 25,
    color: 'white',
    paddingTop: 1,
    
    //display:'flex',
    justifyContent:'center',
    //backgroundColor:'red',
    flexDirection:'row',

  },
  btnGroupsText: {
    color: 'white',
    fontSize: 16,
    //paddingLeft: 24,
    textTransform: 'uppercase',
    paddingTop: 3,
    //justifyContent:'flex-end',
    justifyContent:'flex-start',
    textAlign:'center',
    //textAlign:'left',
    //textAlign:'right',
    //textAlign:'justify',
    flex:1,
  },
  
});
