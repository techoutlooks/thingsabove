// Actions
import { RESET } from './auth'
const TOGGLE_THEME = 'settings/TOGGLE_THEME'

// Reducer
const initialState = {
  theme: 'light',
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET:
      return initialState

    case TOGGLE_THEME:
      return {
        ...state,
        theme: state.theme === 'dark' ? 'light' : 'dark',
      }

    default:
      return state
  }
}

export default reducer

// Selectors
// ==========================
export const getSettingsState = state => {
  return state.settings
}

export const selectTheme = state => {
  return getSettingsState(state).theme ?? 'light'
}

// Actions
// ==========================
export const toggleTheme = () => ({ type: TOGGLE_THEME })
