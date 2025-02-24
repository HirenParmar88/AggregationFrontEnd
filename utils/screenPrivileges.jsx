import AsyncStorage from '@react-native-async-storage/async-storage';

export const screenPrivileges = async screens => {
  try {
    console.log("screens :-",screens)
    const screen_privileges = JSON.parse(await AsyncStorage.getItem('screens'));

    if (Array.isArray(screen_privileges) && screen_privileges.length>0) {
      console.log("Permission given by admin :",screen_privileges)
      const accessScreens = screens.filter(screen =>
        screen_privileges.includes(screen.name),
      );
      console.log(accessScreens)
      return accessScreens;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
  }
};
