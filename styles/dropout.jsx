import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    submitView: {
      //position: 'absolute',
      //justifyContent: 'end',
      display: 'flex',
      bottom: 0,
    },
    container: {
      flex: 1,
      //backgroundColor:'red'
    },
    dropdownConfirmBatchDropoutContainer: {
      marginTop: 35,
      height: 70,
    },
    containerConfirmBatchDropoutItem: {
      padding: 10,
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
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    submitBtn: {
      color: 'white',
      textAlign: 'center',
      fontSize: 18,
    },
    btn: {
      padding: 20,
      backgroundColor: 'rgb(80, 189, 160)',
    },
    radioGroups: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    radioItem1: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 15,
    },
    radioItem2: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 25,
    },
    confirmCodesDropoutContainer: {
      //backgroundColor:'yellow',
      //width:270,
      flex: 1,
    },
    coderDropoutModalBody:{
      //backgroundColor:'yellow',
      paddingLeft:20,
    },
    modalHeader: {
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 10,
      marginBottom: 10,
      marginTop: 5,
      alignItems: 'center',
      //backgroundColor:'red'
    },
    modalBatchHeader: {
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 10,
      //marginBottom: 10,
      marginTop: 5,
      alignItems: 'center',
      //backgroundColor:'red'
    },
    modalConfirmBatchHeader: {
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 10,
      marginBottom: 10,
      marginTop: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 5,
    },
    modalBatchTitle: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    batchDropoutContainer: {
      //backgroundColor:'red',
      flex: 1,
    },
    modalConfirmBatchTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      //color: 'red',
    },
    modalBatchContent: {
      fontSize: 18,
      fontWeight:'bold',
      //textAlign: 'center',
      marginVertical: 10,
      paddingLeft:10,
      //color:'red'
    },
    modalFooter: {
      marginTop: 25,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    modalBatchFooter: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      gap:5,
      //backgroundColor:'red'
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 50,
      borderRadius: 2,
    },
    modalBatchButton: {
      paddingVertical: 10,
      paddingHorizontal: 35,
      borderRadius: 2,
    },
    confirmButton: {
      backgroundColor: 'rgb(80, 189, 160)',
    },
    cancelButton: {
      backgroundColor: '#878f99',
    },
    modalButtonText: {
      color: 'white',
      fontSize: 16,
    },
    icons: {
      textAlign: 'center',
      color: 'red',
      marginTop: 20,
      //backgroundColor:'orange'
    },
    codesList: {
      marginVertical: 8,
      padding: 6,
    },
    snackbar: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      paddingHorizontal: 10,
      borderRadius: 2,
      marginBottom: 50, // Extra space from the bottom if needed
    },
    showResultLabel: {
      fontSize: 18,
      marginTop: 6,
      fontWeight: 'bold',
      paddingLeft: 8,
      //backgroundColor:'yellow'
    },
    modalCodesContent: {
      //backgroundColor: 'red',
      fontSize: 16,
      fontWeight:'bold',
    },
  });
  
export default styles;