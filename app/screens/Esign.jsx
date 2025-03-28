'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Modal, Portal, Text, TextInput, Snackbar, useTheme } from 'react-native-paper';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {url} from '../../utils/constant';
import styles from '../../styles/esign';
const { width, height } = Dimensions.get('window');
//console.log("Widht & heig ", width, height)

function EsignPage({
  config,
  handleAuthResult,
  apiData,
  openModal,
  setOpenModal,
}) {
  const { colors } = useTheme();
    const [snackbarInfo, setSnackbarInfo] = useState({
      visible: false,
      message: '',
      snackbarStyle: { backgroundColor: colors.primary }
    });

  const onToggleSnackBar = (message, code=500) => {
    const backgroundColor = code !== 200 ? colors.error : colors.primary;

    setSnackbarInfo({
      visible: true,
      message,
      snackbarStyle: { backgroundColor },
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
  const handleVerification = async (status, userID, password, remark, action, feature) => {
    console.log("handle verification ", {status, userID, password, remark, action, feature});
    try {
      if (status === 'rejected' && apiData.apiName.includes('create')) {
        setOpenModal(false);
        return;
      }
      const backendUrl = await AsyncStorage.getItem('BackendUrl');
      const response = await axios.post(
        `${backendUrl}/auth/security-check`,
        {
          userId: userID,
          password: password,
          remark: remark,
          apiData,
          audit_log: {
            audit_log: true,
            performed_action: `${userID} is ${status} to ${feature.toLowerCase()} ${action.toLowerCase()} api`,
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
      if (response.data.success) {
        const { userId, userName, user_id } = response.data.data;
        const user = { userId, userName, user_id };
        const isAuthenticated = true;
        const isApprover = apiData.apiName.includes('approve') && config.userId !== user_id;
        console.log("final data ", { isApprover, isAuthenticated, user, status, remark });
        
        await handleAuthResult(
          isAuthenticated,
          user,
          isApprover,
          status,
          remark
        );
        return;
      } else {
        onToggleSnackBar(response.data.message, response.data.code);
        return;
      }
    } catch (err) {
      console.log('Error :', err.message);
      onToggleSnackBar(err.message, 500)
    }
  };

  const close = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Modal
        visible={openModal}
        onDismiss={close}
        contentContainerStyle={containerStyle}>

        <ModalContainer close={close} handleVerification={handleVerification} onToggleSnackBar={onToggleSnackBar} apiName={apiData.apiName} />
        <Snackbar
          visible={snackbarInfo.visible}
          onDismiss={() =>
            setSnackbarInfo({ visible: false, message: '' })}
          duration={3000}
          //style={styles.snackbar}>
          style={[styles.snackbar, snackbarInfo.snackbarStyle]}>
          {snackbarInfo.message}
        </Snackbar>
      </Modal>
    </>
  );
}

function ModalContainer({ close, handleVerification, onToggleSnackBar, apiName }) {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [remark, setRemark] = useState('');
  const [secureText, setSecureText] = useState(true);

  const action = apiName.split('-').pop().toUpperCase();
  const feature = apiName.replace('-create', '').replace('-approve', '').split('-').join(' ').toUpperCase();

  useEffect(() => {
    setUserID('');
    setPassword('');
    setRemark('');
  
    return () => {
      
    }
  }, [])
  

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
              Security check for {apiName.split('-').join(' ')}
            </Text>
          </View>
          <View style={styles.header2}>
            <Text variant="titleSmall" style={styles.header2Txt}>
              Action: {action}
            </Text>
            <Text variant="titleSmall" style={styles.header2Txt}>
              Feature: { feature }
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
                  onToggleSnackBar('User id and password is required');
                  return;
                }
                await handleVerification('approved', userID, password, remark, action, feature);
              }}>
              <Text style={styles.btnfonts}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              mode="contained"
              style={styles.bottomBtn}
              onPress={async () => {
                await handleVerification('rejected', userID, password, remark, action, feature);
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
