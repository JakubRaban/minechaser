import { createContext, FC, PropsWithChildren, useState } from 'react'

export interface UserSettings {
    name: string,
    invertControls: boolean,
    colorBlindMode: boolean,
    disableSoundEffects: boolean,
}

interface UserSettingsContext extends Partial<UserSettings> {
    setSettings: (settings: Partial<UserSettings>) => void
}

export const SettingsContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const [settings, setSettings] = useState<Partial<UserSettings>>({})

    return (
        <SettingsContext.Provider value={{ ...settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    )
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const SettingsContext = createContext<UserSettingsContext>({ setSettings: () => {} })
