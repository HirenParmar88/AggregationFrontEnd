//app/components/HomeScreen/HomeScreen.tsx

import React from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Card, Text } from 'react-native-paper';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {

    const navigation = useNavigation();

    const handleAggregationBtn = () => {
        //console.log("Aggregation Btn Called..");
        navigation.navigate('Product');
    }

    const handleDropoutBtn = () => {
        console.log("Dropout Btn Called..");
        navigation.navigate('Dropout');
    }

    const handleReprintBtn = () => {
        console.log("Reprint Btn Called..");
        navigation.navigate('Reprint');
    }

    return (
        <>
            <View style={styles.container}>
                <ScrollView>
                    {/* <Image source={require('../../assets/images/Aggregation.png')} height={50} width={50}/> */}
                    <View>
                        <Card style={styles.card}>
                            <Card.Cover source={require('../../assets/images/Aggregation.png')} style={styles.img} />
                        </Card>
                    </View>
                    <View style={styles.textGroups}>
                        <Text style={styles.headerTxt}>Welcome to Inspecta-Trace</Text>
                        <Text style={styles.subHeaderTxt}>What would you like to do today?</Text>
                    </View>

                    <View style={styles.btnGroups}>
                        <TouchableOpacity
                            style={styles.TouchableBtn}
                            //labelStyle={{fontSize:15}}
                            mode="contained"
                            onPress={handleAggregationBtn}
                        >
                            <Text style={styles.BtnIconStyle}>
                                <FontAwesome5 name="boxes" size={25} paddingRight={60} style={{ paddingRight: 20 }} />
                            </Text>
                            <Text style={styles.btnAggregationText}>Aggregation</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.TouchableBtn}
                            //labelStyle={{fontSize:15}}
                            mode="contained"
                            onPress={handleDropoutBtn}
                        >
                            <Text style={styles.BtnIconStyle}>
                                <MaterialCommunityIcons name="alert-box" size={25} style={{ paddingRight: 60 }} />
                            </Text>
                            <Text style={styles.btnDropoutText}>Dropout</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            mode="contained"
                            style={styles.TouchableBtn}
                            //labelStyle={{fontSize:15}}
                            onPress={handleReprintBtn}
                        >
                            <Text style={styles.BtnIconStyle}>
                                <MaterialCommunityIcons name="cloud-print" size={25} style={{ paddingRight: 60 }} />
                                </Text>
                            <Text style={styles.btnReprintText}>Reprint</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </>
    )
}
export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        //backgroundColor: 'lightblue',
        flex: 1,
    },
    img: {
        //backgroundColor: 'lightblue',
        height: 300,
        width: 320,
        //padding:50,
        paddingTop: 20,
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 35,
        marginLeft: 20,
    },
    card: {
        margin: 0,
        borderRadius: 0,
        //elevation:5,
        height: 0,
        //backgroundColor:'lightblue',
    },
    btn: {
        padding: 8,
        marginBottom: 10,
        borderRadius: 2,

    },
    btnGroups: {
        marginTop: 50,
        marginRight: 30,
        marginLeft: 30,
        borderRadius: 0,
    },
    textGroups: {
        marginTop: 275,
    },
    headerTxt: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    subHeaderTxt: {
        textAlign: 'center',
        fontSize: 14,
    },
    TouchableBtn: {
        //alignItems: 'center',
        padding: 15,
        flexDirection: 'row',
        backgroundColor: 'rgb(80, 189, 160)',
        marginBottom: 10,
        borderRadius: 4,
        //color:'onPrimary',
    },
    BtnIconStyle: {
        //paddingRight:30,
        paddingLeft: 40,
        color: 'white',
        paddingTop: 1,
    },
    btnAggregationText: {
        color: 'white',
        fontSize: 16,
        paddingLeft: 24,
        textTransform: 'uppercase',
        paddingTop: 3,
    },
    btnDropoutText: {
        color: 'white',
        fontSize: 16,
        textTransform: 'uppercase',
        paddingTop: 3,
        paddingLeft: 36,
    },
    btnReprintText: {
        color: 'white',
        fontSize: 16,
        textTransform: 'uppercase',
        paddingTop: 3,
        paddingLeft: 40,
    },
});
