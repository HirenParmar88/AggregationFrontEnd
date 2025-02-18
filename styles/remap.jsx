import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    dropdownContainer: {
      marginTop: 20,
    },
    labelText: {
      paddingLeft: 20,
      paddingTop: 15,
    },
    containerDropdownItem: {
      padding: 16,
    },
    dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 4,
      paddingHorizontal: 8,
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    textInput: {
      margin: 18,
    },
    txtInputStyle: {
      marginTop: 0,
    },
    remapButton: {
      borderRadius: 0,
      padding: 20,
      backgroundColor: 'rgb(80, 189, 160)',
    },
    remapText: {
      fontSize: 20,
      textAlign: 'center',
      color: '#fff',
    },
    modalContainer: {
      flex: 1,
      position: 'relative',
    },
    modalHeader: {
      textAlign: 'center',
      fontSize: 22,
      fontWeight:'bold'
    },
    modalBody: {
      //height: 20,
      //backgroundColor:'yellow'
    },
    bodyTxt: {
      fontSize: 18,
      //textAlign: 'center',
      //paddingTop: 10,
      fontWeight:'bold'
      //backgroundColor:'red'
    },
    footer: {
      //backgroundColor:'orange',
      bottom: 0,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop:50
    },
    btnText: {
      fontSize: 20,
    },
    printbtn: {
      backgroundColor: 'rgb(80, 189, 160)',
      paddingLeft: 18,
      paddingRight: 18,
      paddingTop: 15,
      paddingBottom: 15,
      borderRadius: 4,
    },
    cancelbtn: {
      backgroundColor: 'gray',
      padding: 15,
      borderRadius: 4,
    },
    snackbar: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      paddingHorizontal: 10,
      borderRadius: 2,
      marginBottom: 70, // Extra space from the bottom if needed
    },
    iconStyleQr: {
      position:'absolute',
      top:100,
      right:100,
      // paddingRight: 50,
      justifyContent: 'center',
    },
  });
export default styles;