'use client'

import PropTypes from 'prop-types';
import { useRef, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; 

import { SplashScreen } from 'src/components/loading-screen';

import { makeStore } from './store';

export default function StoreProvider({ children }) {
  const storeRef = useRef();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!storeRef.current) {
      storeRef.current = makeStore();
    }
    
    storeRef.current.persistor.subscribe(() => {
      if (storeRef.current.persistor.getState().bootstrapped) {
        setIsLoading(false);
      }
    });
  }, []);

  if (isLoading) {
    return <SplashScreen />
  }

  return (
    <Provider store={storeRef.current.store}>
      <PersistGate persistor={storeRef.current.persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

StoreProvider.propTypes = {
  children: PropTypes.node,
};
