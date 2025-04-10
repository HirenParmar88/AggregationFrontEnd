import { StyleSheet, Dimensions, } from "react-native";
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    display: 'flex',
    position: 'static',
    //paddingBottom: 10,
  },
  contentContainer: {
    height: '90%',
  },
  header: {
    //backgroundColor:'yellow',
    //paddingTop: 5,
  },
  icons: {
    textAlign: 'center',
  },
  headerTxt: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingTop: 10,
  },
  header2: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  header2Txt: {
    textAlign: 'center',
  },
  body: {
    //backgroundColor:'yellow',
  },
  userIDTxtInput: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    textDecorationLine: 'none',
  },
  PassTxtInput: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    textDecorationLine: 'none',
  },
  multiLineTxtInput: {
    textDecorationLine: 'none',
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    height: 100,
  },
  btnGroups: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 23,
  },
  bottomBtn: {
    width: width / 3 - 30,
    backgroundColor: 'rgb(80, 189, 160)',
    borderRadius: 4,
  },
  btnfonts: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    padding: 10,
  },
  modalContainer: {
    flex: 1,
  },
  snackbar: {
    bottom: 50,
    left: 10,
    right: 0,
    borderRadius: 2,
  },
});

export default styles;