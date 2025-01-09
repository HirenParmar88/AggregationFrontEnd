
import axios from "axios";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Dimensions, Alert } from "react-native";
import { Modal, Portal, Text, TextInput } from "react-native-paper";
import Fontisto from 'react-native-vector-icons/Fontisto';

const { width, height } = Dimensions.get("window");
console.log("Widht & heig ", width, height)

function EsignPage({ openModal, setOpenModal, setStatus ,handleAuthResult,config}) {
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');
    const [remark, setRemark] = useState('');

    const containerStyle = { backgroundColor: 'white', padding: 10, margin: 20, borderRadius: 6, position: 'static', display: 'flex' };
    console.log("Config ",config)
    const handleVerification = async (status) => {
        console.log(status)
        try{

            const response = await axios.post(`http://192.168.1.15:3000/api/v1/auth/security-check`, {
                "userId": userID,
                "password": password,
                "remark": remark,
                "securityCheck": true,
                "approveAPIName": "location-create",
                "approveAPImethod": "POST",
                "audit_log": {
                    "audit_log": true,
                    "performed_action": `${userID} is ${status} to aggregate-create api`,
                    "remarks": remark,
                }
            }, {
                headers: {
                    "Content-Type": 'application/json',
                }
            });
            console.log("handle verification Res :", response);
            console.log(response.data.success)
            if (response.data.success) {
                const { userId, userName, user_id } = response.data.data;
                const user = { userId, userName, user_id };
                const isAuthenticated = true;
                const isApprover = config.userId !== user.user_id;
    
                await handleAuthResult(isAuthenticated, user, isApprover, "approved", remark,user_id);
                setOpenModal(false);
                return;
            } else {
                Alert.alert('Authentication failed. Please try again.');
                setOpenModal(false)
                return;
            }
        }
        catch(err){
            console.log("Error :",err)
        }
    }
    // const approve = () => {
    //     console.log("approve btn pressed!");

    // }
    // const reject = () => {
    //     console.log("reject btn pressed!");

    // }
    const close = () => {
        // console.log("close btn pressed!");
        setOpenModal(false);

    }
    return (
        <>
            <Portal>
                <Modal visible={openModal} onDismiss={close} contentContainerStyle={containerStyle}>
                    <View style={styles.container}>
                        <ScrollView>
                            <View style={styles.header}>
                                <Fontisto
                                    name="locked"
                                    size={36}
                                    color={'#000000'}
                                    style={styles.icons}
                                />
                                <Text variant="titleMedium" style={styles.headerTxt}>Security Check</Text>
                            </View>
                            <View style={styles.header2}>
                                <Text variant="titleSmall" style={styles.header2Txt}>Action: Create/Approve</Text>
                                <Text variant="titleSmall" style={styles.header2Txt}>Feature: Add User/Edit User</Text>
                                <Text variant="titleSmall" style={styles.header2Txt}>Access Roles: Admin/Production</Text>
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
                                <TouchableOpacity mode='contained' style={styles.bottomBtn} onPress={async() =>await handleVerification("approved")}>
                                    <Text style={styles.btnfonts}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity mode='contained' style={styles.bottomBtn} onPress={async() =>await handleVerification("rejected")}>
                                    <Text style={styles.btnfonts}>Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity mode='contained' style={styles.bottomBtn} onPress={close}>
                                    <Text style={styles.btnfonts}>Close</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>
                    </View>
                </Modal>
            </Portal>
        </>
    )
}
export default EsignPage;

const styles = StyleSheet.create({
    container: {
        //backgroundColor:'lightblue',
        height: '90%',
        display: 'flex',
        position: 'static',
        //paddingBottom: 10,
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
        //borderRadius:20,
    },
    PassTxtInput: {
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        //margin:15,
    },
    multiLineTxtInput: {
        //margin:15,
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
    }
});