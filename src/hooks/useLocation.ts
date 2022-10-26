import React, { useState, useEffect, useReducer, Reducer } from 'react';
import * as Location from 'expo-location';
import { LatLng } from "react-native-maps";


/**
 * Serialize LatLng for saving to db
 * @param {LatLng} location:  location object
 * @returns 
 */
 const toLatLng = (location: LatLng) => 
  `${location.latitude},${location.longitude}`


type Args = { shouldFormatToLatLng?: boolean }

type T = Location.LocationObjectCoords | string | undefined
type R = Reducer<T, Location.LocationObjectCoords>


/***
 * Use geolocation
 */
const useLocation = ({shouldFormatToLatLng}: Args) => {

  const [error, setError] = useState<string>();
  const [location, setLocation] = useReducer<R>(
    (s, a) => !!shouldFormatToLatLng ? toLatLng(a) : a, undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return; }
      let location = await Location.getCurrentPositionAsync({});
      mounted && setLocation(location.coords);
    })()
    return () => { mounted = false}
  }, [])

  return { location, error }
}


export default useLocation


