import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    reloginContainer: {
      backgroundColor: 'white',
      height: 155,
      width: 260,
      marginLeft: 50,
      borderRadius: 4,
      // display: 'grid',
      // alignContent: 'space-between',
    },
    card: {
      width: '100%',
      height: '100%',
      marginTop: 30,
    },
    cardContent: {
      margin: 15,
    },
    logo: {
      width: 115,
      height: 72,
      marginBottom: 40,
      alignSelf: 'center',
      marginTop: 50,
      padding: 30,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
    },
    inputs: {
      marginVertical: 20,
      padding: 0,
      //marginTop: '10%',
      //backgroundColor:'red',
      //height:'30%'
    },
    // input: {
    //   height: 60,
    //   borderColor: '#ccc',
    //   borderWidth: 1,
    //   marginBottom: 18,
    //   paddingLeft: 10,
    //   borderRadius: 5,
    //   backgroundColor: '#fff',
    //   fontSize: 16,
    // },
    usernameInput: {
      //backgroundColor:'yellow',
      marginBottom: '10',
      //padding:10,
    },
    passwordInput: {
      //backgroundColor:'lightblue',
      marginBottom: '10',
      //padding:10,
    },
    btn: {
      borderRadius: 2,
      padding: 7,
      //backgroundColor:'primary',
    },
    touchableBtn:{
      borderRadius: 2,
      padding: 15,
      backgroundColor: 'rgb(80, 189, 160)',
    },
    submitBtnText: {
      fontSize: 18,
      fontWeight:'bold',
      textAlign: 'center',
      letterSpacing:0,
      color: '#fff',
      //backgroundColor:'red',
    },
    snackbar: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      paddingHorizontal: 10,
      borderRadius: 2,
      marginBottom: 10,
    },
    modalHeader: {
      // borderBottomWidth: 1,
      // borderBottomColor: '#ddd',
      paddingBottom: 10,
      marginBottom: 10,
      alignItems: 'center',
      //backgroundColor:'red',
      paddingLeft: 10,
      paddingTop: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    modalFooter: {
      marginTop: 14,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    modalButton: {
      width: 100,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 2,
    },
    confirmButton: {
      backgroundColor: 'rgb(80, 189, 160)',
    },
    cancelButton: {
      backgroundColor: '#878f99',
    },
    modalButtonText: {
      fontSize: 16,
      textAlign: 'center',
      color: '#fff',
      verticalAlign: 'middle',
    },
  });
  export default styles;