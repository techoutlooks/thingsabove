import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore, applyMiddleware, combineReducers, compose, AnyAction } from 'redux'
import thunk, { ThunkAction } from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'

import * as reducers from './reducers'
import { fetchAll as fetchPrayers, syncChanges as syncPrayerChanges } from "@/state/prayers"
import { fetchAll as fetchContacts } from "@/state/contacts"


const rootReducer = combineReducers(reducers)

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'prayers'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const composeEnhancers =
  ( __DEV__ &&
    typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ) || compose


const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk)),
)

let persistor = persistStore(store)


// Feed/Sync store <-> server
// ==========================
store.dispatch(fetchPrayers)
store.dispatch(fetchContacts)

// store.dispatch(syncPrayerChanges)



export { store, persistor }

// https://redux.js.org/usage/usage-with-typescript
export type AppThunk<ReturnType = void> = 
  ThunkAction<ReturnType, typeof reducers, unknown, AnyAction >