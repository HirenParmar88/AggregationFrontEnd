//app/components/screens/TrackCodeScreen.jsx
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
} from 'react-native';
import {Appbar, Text, TextInput} from 'react-native-paper';

function TrackCode() {
  const navigation = useNavigation();

  const handleSubmit = () => {
    console.log('Track code submit pressed !!');
  };
  // Add this function to dismiss keyboard
  const handleScroll = () => {
    Keyboard.dismiss();
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
          <Appbar.Content title="Track code" />
        </Appbar.Header>

        <View style={styles.mainContainer}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false} // Hide vertical scrollbar
            showsHorizontalScrollIndicator={false} // Hide horizontal scrollbar (optional)
            onScrollBeginDrag={handleScroll} // Add this prop
            keyboardDismissMode="on-drag" // Add this for iOS
          >
            <View style={styles.div1}>
              <Text style={styles.txtTitle}>Scan / Enter Code</Text>
              <TextInput
                label="Scan / Enter sscc code"
                //value={scanCode?.toString()}
                mode="outlined"
                //onChangeText={text => setScanCode(text)}
                style={styles.textInput}
              />
            </View>

            <View style={styles.div2}>
              <View style={styles.childCodeContainer}>
                <View style={styles.childCode}>
                  <Text style={styles.childTxt}>Child Codes:</Text>
                </View>
                <View style={styles.dynamicChildCode}>
                  <Text style={styles.childTxt}>unique codes..</Text>
                </View>
              </View>
              <View style={styles.parentCodeContainer}>
                <View style={styles.parentCode}>
                  <Text style={styles.parentTxt}>Parent Codes:</Text>
                </View>
                <View style={styles.dynamicParentCode}>
                  <Text style={styles.parentTxt}>sscc code..</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
        <TouchableOpacity
          mode="contained"
          //labelStyle={{ fontSize: 20 }}
          style={styles.TrackCodeSubmitButton}
          onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </>
  );
}
export default TrackCode;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative', // Needed for absolute positioning of children
    //backgroundColor:'lightblue',
    //borderRadius:0,
  },
  TrackCodeSubmitButton: {
    backgroundColor: 'rgb(80, 189, 160)',
    position: 'absolute', // Fix button to bottom
    bottom: 0,
    left: 0,
    right: 0,
    //zIndex: 10, // Ensure button stays above scroll content
  },
  submitBtnText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 18,
    color: '#fff',
  },
  div1: {
    padding: 10,
    // borderBottomColor: '#b2b2b2',
    //backgroundColor:'red',
    // borderBottomWidth: 2,
    //width:'100%',
    //maxWidth:'100%',
  },
  txtTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  textInput: {
    marginHorizontal: 2,
    marginVertical: 5,
  },
  div2: {
    //backgroundColor:'red',
    //borderRadius:10,
    flex: 1,
    paddingBottom: 80, // Space for absolute button
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16, // Consistent horizontal padding
  },
  childCodeContainer: {
    marginVertical: 16,
  },
  parentCodeContainer: {
    marginVertical: 16,
  },
  childTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  parentTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dynamicChildCode: {
    //backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    minHeight: 100, // Ensure minimum height for empty state
  },
  dynamicParentCode: {
    //backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    minHeight: 60, // Ensure minimum height for empty state
  },
});
