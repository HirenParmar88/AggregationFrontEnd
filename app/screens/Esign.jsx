'use client';
import axios from 'axios';
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import {Modal, Portal, Text, TextInput, Snackbar} from 'react-native-paper';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {url} from '../../utils/constant';

const {width, height} = Dimensions.get('window');
//console.log("Widht & heig ", width, height)

function EsignPage({
  config,
  handleAuthResult,
  approveAPIName,
  approveAPImethod,
  approveAPIEndPoint,
  openModal,
  setOpenModal,
  setStatus,
}) {
  const [snackbarInfo, setSnackbarInfo] = useState({
    visible: false,
    message: '',
  });
  const onToggleSnackBar = (message, code) => {
    const backgroundColor =
      code === 200 ? 'rgb(80, 189, 160)' : 'rgb(210, 43, 43)';

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: {backgroundColor},
    });
  };
  const containerStyle = {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 30,
    borderRadius: 6,
  };
  
  //console.log("Config ",config)
  const handleVerification = async (status,userID,password,remark) => {
    console.log(status);
    try {
      const response = await axios.post(
        `${url}/auth/security-check`,
        {
          userId: userID,
          password: password,
          remark: remark,
          securityCheck: true,
          approveAPIName: approveAPIName,
          approveAPImethod: 'POST',
          audit_log: {
            audit_log: true,
            performed_action: `${userID} is ${status} to aggregate-create api`,
            remarks: remark,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('handle verification Res :', response.data);
      console.log(response.data.code);
      if (response.data.success ) {
        const {userId, userName, user_id} = response.data.data;
        const user = {userId, userName, user_id};
        const isAuthenticated = true;
        const isApprover = config.userId !== user.user_id;

        await handleAuthResult(
          isAuthenticated,
          user,
          isApprover,
          'approved',
          remark,
          user_id,
        );
        setOpenModal(false);
        onToggleSnackBar(response.data.message, response.data.code)
        return;
      } else {
        onToggleSnackBar(response.data.message, response.data.code)
        // setOpenModal(false);
        return;
      }
    } catch (err) {
      console.log('Error :', err.message);
      onToggleSnackBar(err.message,500)
    }
  };
  // const approve = () => {
  //     console.log("approve btn pressed!");

  // }
  // const reject = () => {
  //     console.log("reject btn pressed!");
  // }
  const close = () => {
    // console.log("close btn pressed!");
    setOpenModal(false);
  };
  return (
    <>
    <Modal
      visible={openModal}
      onDismiss={close}
      contentContainerStyle={containerStyle}>
      <ModalContainer close={close} handleVerification={handleVerification} setSnackbarInfo={setSnackbarInfo} onToggleSnackBar={onToggleSnackBar} />
    </Modal>
     <Snackbar
        visible={snackbarInfo.visible}
        onDismiss={() =>
          setSnackbarInfo({visible: false, message: ''})}
        duration={3000}
        //style={styles.snackbar}>
        style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
        {snackbarInfo.message}
      </Snackbar>
    </>
  );
}

function ModalContainer({close, handleVerification,setSnackbarInfo,onToggleSnackBar}) {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [remark, setRemark] = useState('');
  const [secureText, setSecureText] = useState(true);
  
  return (
    <KeyboardAvoidingView behavior='height'>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <Fontisto
              name="locked"
              size={36}
              color={'#000000'}
              style={styles.icons}
            />
            <Text variant="titleMedium" style={styles.headerTxt}>
              Security Check
            </Text>
          </View>
          <View style={styles.header2}>
            <Text variant="titleSmall" style={styles.header2Txt}>
              Action: Create/Approve
            </Text>
            <Text variant="titleSmall" style={styles.header2Txt}>
              Feature: Add User/Edit User
            </Text>
            <Text variant="titleSmall" style={styles.header2Txt}>
              Access Roles: Admin/Production
            </Text>
          </View>
          <View style={styles.body}>
            <TextInput
              mode="outlined"
              label="UserID"
              value={userID}
              onChangeText={setUserID}
              style={styles.userIDTxtInput}
            />
            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              secureTextEntry={secureText}
              right={
                <TextInput.Icon
                  icon={secureText ? 'eye' : 'eye-off'}
                  onPress={() => setSecureText(!secureText)}
                />
              }
              onChangeText={setPassword}
              style={styles.PassTxtInput}
            />
            <TextInput
              mode="outlined"
              label="Remarks(Optional)"
              value={remark}
              multiline
              numberOfLines={5}
              onChangeText={setRemark}
              style={styles.multiLineTxtInput}
            />
          </View>
          <View style={styles.btnGroups}>
            <TouchableOpacity
              mode="contained"
              style={styles.bottomBtn}
              onPress={async () => {
                if (!userID || !password) {
                  // Alert.alert(
                  //   'Validation Error',
                  //   'User id and password is required',
                  // );
                  onToggleSnackBar('User id and password is required');
                  return;
                }
                await handleVerification('approved',userID,password,remark);
              }}>
              <Text style={styles.btnfonts}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              mode="contained"
              style={styles.bottomBtn}
              onPress={async () => {
                if (!userID || !password) {
                  // Alert.alert(
                  //   'Validation Error',
                  //   'User id and password is required',
                  // );
                  onToggleSnackBar('User id and password is required');
                  return;
                }
                await handleVerification('rejected',userID,password,remark);
              }}>
              <Text style={styles.btnfonts}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              mode="contained"
              style={styles.bottomBtn}
              onPress={close}>
              <Text style={styles.btnfonts}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
export default EsignPage;

const styles = StyleSheet.create({
  container: {
    // backgroundColor:'lightblue',
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
    //backgroundColor:'orange',
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
    //borderRadius:20,
  },
  PassTxtInput: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    textDecorationLine: 'none',
    //margin:15,
  },
  multiLineTxtInput: {
    //margin:15,
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
    //backgroundColor: "red",
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    borderRadius: 2,
    marginBottom: 10,
  },
});
