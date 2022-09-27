// Imports: Dependencies
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'

import * as reducers from './reducers'
import { fetchAll, syncChanges as syncPrayers } from "@/state/prayers"


const rootReducer = combineReducers(reducers)

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'prayers'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk)),
)

let persistor = persistStore(store)


// Feed/Sync store <-> server
// ==========================
store.dispatch(fetchAll)
// store.dispatch(syncPrayers)



export { store, persistor }

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>