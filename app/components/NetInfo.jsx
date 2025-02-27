import React, { useContext } from 'react';
import { Text } from 'react-native';
import {NetworkContext} from '../../context/NetworkContext';

const GetNetInfo = () => {
  const { isNetConnected, isVisible } = useContext(NetworkContext);

  return (
    <>
      {isVisible && (
        <Text
          style={{
            backgroundColor: isNetConnected ? 'green' : 'red',
            color: '#fff',
            textAlign: 'center',
            bottom: 0,
            width: '100%',
            position: 'absolute',
          }}>
          {isNetConnected ? 'Back to Online' : 'Offline'}
        </Text>
      )}
    </>
  );
};

export default GetNetInfo;