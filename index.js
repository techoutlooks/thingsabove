import React from 'react'
// import { registerRootComponent } from 'expo';
// import { activateKeepAwake } from 'expo-keep-awake'
import 'react-native-url-polyfill/auto';
import registerRootComponent from 'expo/build/launch/registerRootComponent';
import App from './src/App';


// if (__DEV__) {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render')
//   //whyDidYouRender(React, {
//   //trackAllPureComponents: true,
//   //})

//   activateKeepAwake()
// }


registerRootComponent(App);
