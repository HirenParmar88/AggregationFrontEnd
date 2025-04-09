import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff',
  },
  reloginContainer: {
    backgroundColor: 'white',
    height: 155,
    width: 260,
    marginLeft: 50,
    borderRadius: 4,
  },
  cardContent: {
    marginHorizontal: 15,
    marginTop:'35%'
  },
  logo: {
    width: 115,
    height: 72,
    marginBottom: 40,
    alignSelf: 'center',
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
  },
  usernameInput: {
    backgroundColor: '#fff',
    marginBottom: '10',
  },
  passwordInput: {
    backgroundColor: '#fff',
    marginBottom: '10',
  },
  touchableBtn: {
    borderRadius: 4,
    padding: 15,
    backgroundColor: 'rgb(80, 189, 160)',
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0,
    color: '#fff',
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
    paddingBottom: 10,
    marginBottom: 10,
    alignItems: 'center',
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