import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      //flex: 1,
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
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
    codeReplaceButton: {
      borderRadius: 0,
      padding: 20,
      backgroundColor: 'rgb(80, 189, 160)',
    },
    codeReplaceText: {
      fontSize: 20,
      textAlign: 'center',
      color: '#fff',
    },
    modalContainer: {
      flex: 1,
      position: 'relative',
      //backgroundColor: 'lightblue',
    },
    modalHeader: {
      textAlign: 'center',
      //backgroundColor:'red',
      height: 45,
    },
    modalHeaderText: {
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      //backgroundColor:'yellow',
      paddingTop: 10,
    },
    modalBody: {
      height: 120,
    },
    bodyTxt: {
      fontSize: 20,
      textAlign: 'center',
      paddingTop: 50,
    },
    footer: {
      bottom: 20,
      //backgroundColor:'yellow',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    btnText: {
      fontSize: 20,
      color: 'white',
    },
    printbtn: {
      backgroundColor: 'rgb(80, 189, 160)',
      paddingLeft: 26,
      paddingRight: 26,
      paddingTop: 15,
      paddingBottom: 15,
      borderRadius: 4,
    },
    codeReplaceModalBtnText: {
      fontSize: 20,
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      textAlign: 'center',
    },
    codeReplaceModalBtn: {
      backgroundColor: 'rgb(80, 189, 160)',
      paddingLeft: 36,
      paddingRight: 36,
      paddingTop: 15,
      paddingBottom: 15,
      borderRadius: 4,
      display: 'flex',
      justifyContent: 'center',
      textAlign: 'center',
    },
    //   cancelbtn: {
    //     backgroundColor: 'gray',
    //     padding: 15,
    //     borderRadius: 4,
    //   },
    snackbar: {
      position: 'absolute',
      bottom: 70,
      left: 0,
      right: 0,
      paddingHorizontal: 10,
      borderRadius: 2,
      marginBottom: 10, // Extra space from the bottom if needed
    },
  });
export default styles;