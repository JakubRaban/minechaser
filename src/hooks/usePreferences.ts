import { useContext } from 'react'
import { PreferencesContext } from '../contexts/PreferencesContext'

export const usePreferences = () => useContext(PreferencesContext)
