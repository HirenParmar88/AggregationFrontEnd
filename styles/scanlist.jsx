import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingLeft: 20,
      //paddingHorizontal: 10,
      //paddingBottom: 0,
      //backgroundColor: 'yellow',
      //height:200,
    },
    formContainer: {
      marginTop: 0,
      padding: 10,
      backgroundColor: 'rgba(80, 189, 160,0.7)',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginTop: 15,
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 18,
      fontWeight: 'bold',
      marginRight: 10,
      color: '#333',
      width: 110,
      color: '#fff',
    },
    label2: {
      fontSize: 20,
      fontWeight: 'bold',
      marginRight: 25,
      color: '#333',
      //width: 110,
      color: '#fff',
    },
    label3: {
      fontSize: 20,
      fontWeight: 'bold',
      marginRight: 25,
      color: '#333',
      //width: 110,
      color: '#fff',
    },
    input: {
      flex: 1,
      fontSize: 14,
      height: 30,
      fontWeight: 'bold',
    },
    submitButton: {
      //position: 'absolute',
      //bottom: 0,
      //paddingVertical: 10,
      borderRadius: 0,
      padding: 20,
      backgroundColor: 'rgb(80, 189, 160)',
    },
    endTranTxt: {
      fontSize: 20,
      textAlign: 'center',
      color: '#fff',
      //padding: 10,
    },
    modalContainer: {
      backgroundColor: 'white',
      padding: 20,
      marginHorizontal: 40,
      height: 250,
      borderRadius: 6,
      justifyContent: 'space-between',
    },
    modalHeader: {
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 10,
      marginBottom: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    modalContent: {
      flexGrow: 1,
      paddingBottom: 20,
    },
    modalText: {
      fontSize: 18,
      textAlign: 'center',
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 5,
      marginTop: 10,
    },
    modalConfirmButton: {
      width: '48%',
      borderRadius: 2,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    modalButton: {
      width: '48%',
      borderRadius: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: '#878f99',
    },
    modalOKButton: {
      width: '48%',
      borderRadius: 4,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    modelRetryButton: {
      width: '48%',
      borderRadius: 4,
      backgroundColor: 'red',
    },
    modalSuccessText: {
      //color: "green",
      fontSize: 18,
      textAlign: 'center',
    },
    modalFailedText: {
      color: 'red',
      fontSize: 18,
      textAlign: 'center',
    },
    childModalFooter: {
      justifyContent: 'center',
      flexDirection: 'row',
    },
    ListSubheader: {
      fontWeight: 'bold',
      fontSize: 16,
      paddingLeft: 10,
      marginBottom: 5,
      marginTop: 15,
      zIndex: 1,
      position: 'relative',
      top: 0,
    },
    ListSubheaderView: {
      shadowRadius: 3,
      opacity: 3,
      borderRadius: 2,
    },
    SnackbarDispaly: {
      flex: 1,
      justifyContent: 'space-between',
    },
    statusSuccess: {
      textAlign: 'center',
      //backgroundColor:'red'
    },
    snackbar: {
      //backgroundColor: "red",
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