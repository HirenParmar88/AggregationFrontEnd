import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff',
    justifyContent: 'flex-start',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  textbox: {
    marginHorizontal:6,
  },
  input: {
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  btn: {
    borderRadius: 4,
    padding: 5,
    backgroundColor: 'rgb(80, 189, 160)',
  },
  TouchableBtn: {
    backgroundColor: 'rgb(80, 189, 160)',
    bottom: 8,
    borderRadius:8,
    marginHorizontal:8,
  },
  btnGroupsText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 18,
    color: '#fff',
  },
  snackbar: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 10, 
  },
});

export default styles;