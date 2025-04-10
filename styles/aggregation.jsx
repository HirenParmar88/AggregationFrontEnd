import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      padding: 16,
      flex: 1,
      justifyContent: 'center',
      alignContent: 'center',
      width: '100%',
    },
    imageView: {
      backgroundColor:'#fff',
    },
    img: {
      height: 250,
      width: 250,
      marginTop: 0,
      marginLeft: 55,
    },
    txtGroup:{
      backgroundColor:'#fff',
    },
    txt1: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 5,
      backgroundColor:'#fff',
    },
    LoadingContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    horizontal: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10,
    },
    dropdownContainer: {
      width: '100%',
      marginBottom: 20,
    },
    dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
      marginBottom: 20,
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'relative',
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
    btn: {
      bottom:6,
      borderRadius: 6,
      marginHorizontal:8,
      padding: 20,
      backgroundColor: 'rgb(80, 189, 160)',
    },
    submitBtnText: {
      fontSize: 18,
      textAlign: 'center',
      color: '#fff',
    },
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
  