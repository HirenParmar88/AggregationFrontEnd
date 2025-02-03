import React,{useState} from 'react';
import {ScrollView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Appbar, TextInput} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

function SettingScreen() {
  const navigation = useNavigation();
  const [text, setText] = useState('');

    const handleSubmit = () => {
        console.log("setting btn call..");
        
    }
  return (
    <>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
          <Appbar.Content title="Settings" />
        </Appbar.Header>
        <ScrollView>
          <View style={styles.body1}>
            <TextInput
              label="Printer IP"
              value={text}
              mode="outlined"
              onChangeText={text => setText(text)}
              style={styles.textInputIP}
            />
            <TextInput
              label="Port"
              value={text}
              mode="outlined"
              onChangeText={text => setText(text)}
              style={styles.textInputPort}
            />
          </View>
          <View style={styles.body2}>
          <TextInput
              label="No of variables"
              value={text}
              mode="outlined"
              onChangeText={text => setText(text)}
              style={styles.textInputVariables}
            />
          </View>
        </ScrollView>
        <View>
        <TouchableOpacity
            mode="contained"
            //labelStyle={{ fontSize: 20 }}
            style={styles.submitButton}
            onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: 'yellow',
    //position:'relative',
  },
  textInputIP: {
    margin: 18,
    width:144,
  },
  textInputPort:{
    margin:18,
    width:144,
  },
  textInputVariables:{
    margin:18,
  },
  body1:{
    marginTop:0,
    //backgroundColor:'red',
    display:'flex',
    justifyContent:'flex-start',
    flexDirection:'row',
    //alignContent:'flex-start',
    alignItems:'center',
    position:'relative'
  },
  body2:{
    //backgroundColor:'orange',
  },
  submitButton: {
    borderRadius: 0,
    padding: 20,
    backgroundColor: 'rgb(80, 189, 160)',
  },
  submitText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
  },
});
