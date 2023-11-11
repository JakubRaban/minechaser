import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useState, useEffect } from 'react'
import config from '../config'

export interface UserPreferences {
    name?: string
    invertControls: boolean
    colorBlindMode: boolean
    disableSoundEffects: boolean
    disableMusic: boolean
    showOnScreenControls: boolean
    controlsOnLeft: boolean
}

interface UserPreferencesContext extends UserPreferences {
    setName: Dispatch<SetStateAction<string>>
    setSettings: Dispatch<SetStateAction<UserPreferences>>
}

export const PreferencesContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [name, setName] = useState('')
    const [settings, setSettingsState] = useState<UserPreferences>({
        invertControls: false,
        colorBlindMode: false,
        disableSoundEffects: false,
        disableMusic: false,
        showOnScreenControls: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
        controlsOnLeft: false,
    })

    const { STORAGE: storage } = config

    const setSettings = (func: SetStateAction<UserPreferences>) => {
        setSettingsState(func)
    }

    useEffect(() => {
        const savedPreferences = storage.getItem('rmPreferences')
        if (savedPreferences) {
            setSettingsState(JSON.parse(savedPreferences))
        }
    }, [])

    useEffect(() => {
        storage.setItem('rmPreferences', JSON.stringify(settings))
    }, [settings])

    useEffect(() => {
        if (settings.colorBlindMode) {
            document.documentElement.classList.add('colorblind')
        } else {
            document.documentElement.classList.remove('colorblind')
        }
    }, [settings.colorBlindMode])

    return (
        <PreferencesContext.Provider value={{ name, ...settings, setName, setSettings }}>
            {children}
        </PreferencesContext.Provider>
    )
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const PreferencesContext = createContext<UserPreferencesContext>({ setSettings: () => {} } as any)
