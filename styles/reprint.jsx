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
    reprintButton: {
      borderRadius: 0,
      padding: 20,
      backgroundColor: 'rgb(80, 189, 160)',
    },
    reprintText: {
      fontSize: 20,
      textAlign: 'center',
      color: '#fff',
    },
    modalContainer: {
      flex: 1,
      position: 'relative',
      //backgroundColor:'red',
    },
    modalHeader: {
      textAlign: 'center',
      fontSize: 22,
      fontWeight:'bold'
    },
    modalBody: {
      height: 130,
    },
    bodyTxt: {
      fontSize: 18,
      fontWeight:'bold',
      marginTop:10,
      //textAlign: 'center',
    },
    footer: {
      bottom: 0,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
    },
    btnText: {
      fontSize: 20,
    },
    printbtn: {
      backgroundColor: 'rgb(80, 189, 160)',
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 15,
      paddingBottom: 15,
      borderRadius: 2,
    },
    cancelbtn: {
      backgroundColor: 'gray',
      padding: 15,
      borderRadius: 2,
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
  });
  
export default styles;