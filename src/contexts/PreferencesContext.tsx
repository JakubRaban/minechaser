import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useState } from 'react'

export interface UserPreferences {
    name?: string,
    invertControls: boolean,
    colorBlindMode: boolean,
    disableSoundEffects: boolean,
    showOnScreenControls: boolean,
}

interface UserPreferencesContext extends UserPreferences {
    setSettings: Dispatch<SetStateAction<UserPreferences>>
}

export const PreferencesContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [settings, setSettings] = useState<UserPreferences>({
        invertControls: false,
        colorBlindMode: false,
        disableSoundEffects: false,
        showOnScreenControls: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
    })

    return (
        <PreferencesContext.Provider value={{ ...settings, setSettings }}>
            {children}
        </PreferencesContext.Provider>
    )
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const PreferencesContext = createContext<UserPreferencesContext>({ setSettings: () => {} } as any)
