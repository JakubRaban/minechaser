import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useState } from 'react'

export interface UserSettings {
    name?: string,
    invertControls: boolean,
    colorBlindMode: boolean,
    disableSoundEffects: boolean,
    showOnScreenControls: boolean,
}

interface UserSettingsContext extends UserSettings {
    setSettings: Dispatch<SetStateAction<UserSettings>>
}

export const SettingsContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [settings, setSettings] = useState<UserSettings>({
        invertControls: false,
        colorBlindMode: false,
        disableSoundEffects: false,
        showOnScreenControls: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0),
    })

    return (
        <SettingsContext.Provider value={{ ...settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    )
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const SettingsContext = createContext<UserSettingsContext>({ setSettings: () => {} } as any)
