import { StyleSheet } from "react-native";

 const styles=StyleSheet.create({
    container: {
    //backgroundColor: 'yellow',
    flex: 1,
    //borderWidth: 2,
    //borderColor: 'red',
  },
  textbox: {
    marginTop: 250,
    marginLeft: 6,
    marginRight: 6,
  },
  input: {
    //height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  // btnContainer: {
  //   backgroundColor: 'red',
  //   margin: 100,
  // },
  btn: {
    borderRadius: 4,
    padding: 5,
    backgroundColor: 'rgb(80, 189, 160)',
  },
  TouchableBtn: {
    backgroundColor: 'rgb(80, 189, 160)',
    bottom: 0,
  },
  btnGroupsText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 18,
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
})
export default styles;