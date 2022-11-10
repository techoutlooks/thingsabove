import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore, applyMiddleware, combineReducers, compose, AnyAction } from 'redux'
import thunk, { ThunkAction } from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import * as reducers from './reducers'
import { fetchAll as fetchPrayers, syncChanges as syncPrayerChanges } from "./prayers"
import { fetchAll as fetchContacts } from "./contacts"
import * as sharings from "./sharings"


const rootReducer = combineReducers(reducers)

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // whitelist: ['auth', 'prayers', 'contacts'],
  whitelist: Object.keys(reducers),
  stateReconciler: autoMergeLevel2
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const composeEnhancers = ( __DEV__ &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
) || compose


const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk)) )

let persistor = persistStore(store)


// Intial sync backend -> redux
store.dispatch(fetchPrayers)
store.dispatch(fetchContacts)

// RT sync
// store.dispatch(syncPrayerChanges)

// Authed user's syncs
AsyncStorage.getItem('persist:root').then(
  store =>  store && JSON.parse(JSON.parse(store)?.auth)?.user?.id
)
  .then(authId => {
    store.dispatch(sharings.fetchUserSharings(authId))
  })

export { store, persistor }


// https://redux.js.org/usage/usage-with-typescript
export type AppThunk<ReturnType = void> = 
  ThunkAction<ReturnType, typeof reducers, unknown, AnyAction >