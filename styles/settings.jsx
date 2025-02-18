import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    container: {
      flex: 1,
      //backgroundColor: 'yellow',
      //position:'relative',
    },
    textInputIP: {
      margin: 18,
      width: 144,
    },
    textInputPort: {
      margin: 18,
      width: 144,
    },
    textInputVariables: {
      margin: 18,
    },
    body1: {
      marginTop: 0,
      //backgroundColor:'red',
      display: 'flex',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      //alignContent:'flex-start',
      alignItems: 'center',
      position: 'relative',
    },
    body2: {
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