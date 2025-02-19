'use client';
import axios from 'axios';
import React, {useState} from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import {Modal, Portal, Text, TextInput, Snackbar} from 'react-native-paper';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {url} from '../../utils/constant';
import styles from '../../styles/esign';

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
          status,
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
     <Snackbar
        visible={snackbarInfo.visible}
        onDismiss={() =>
          setSnackbarInfo({visible: false, message: ''})}
        duration={3000}
        //style={styles.snackbar}>
        style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
        {snackbarInfo.message}
      </Snackbar>
    </Modal>
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
