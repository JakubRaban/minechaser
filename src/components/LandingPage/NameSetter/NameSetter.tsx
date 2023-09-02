import { BaseSyntheticEvent, FC, FormEvent, useEffect, useRef, useState } from 'react'
import { useSocket } from '../../../hooks/useSocket'
import { generateRandomUsername } from '../../../helpers'
import cn from 'classnames'
import { useSettings } from '../../../hooks/useSettings'
import { UserSettings } from '../../../contexts/SettingsContext'

import './NameSetter.scss'

interface NameSetterProps {
    onNameSet?: (name: string) => void
}

export const NameSetter: FC<NameSetterProps> = ({ onNameSet }) => {
    const { socket } = useSocket()
    const { setSettings } = useSettings()
    const placeholderName = useRef(generateRandomUsername())
    const nameInputRef = useRef<HTMLInputElement>(null)

    const [formValues, setFormValues] = useState({
        name: '',
        invertControls: false,
        colorBlindMode: false,
        disableSoundEffects: false,
    })
    const { name, invertControls, colorBlindMode, disableSoundEffects } = formValues
    const setFieldValue = (event: BaseSyntheticEvent) => {
        setFormValues(value => ({
            ...value,
            [event.target.name]: typeof value[event.target.name as keyof typeof formValues] === 'boolean' ? event.target.checked : event.target.value,
        }))
    }

    const submit = (event: FormEvent) => {
        event.preventDefault()
        socket.emit(
            'set_name',
            { ...formValues, name: formValues.name.trim().replaceAll(/\s+/g, ' ').substring(0, 32) || placeholderName.current },
            (settings: UserSettings) => {
                setSettings(settings)
                onNameSet?.(settings.name)
            },
        )
    }

    useEffect(() => {
        nameInputRef.current?.focus()
    }, [])

    return (
        <div className="name-setter">
            <form onSubmit={submit}>
                <fieldset>
                    <label>
                        Your Nickname:
                        <input ref={nameInputRef} name="name" placeholder={placeholderName.current} type="text" value={name} onChange={setFieldValue} />
                    </label>

                    <details>
                        <summary>Settings</summary>
                        <label>
                            <input name="invertControls" checked={invertControls} type="checkbox" role="switch" onChange={setFieldValue} />
                            Invert Controls
                            <aside className={cn({ active: invertControls })}>(Use <kbd>WASD</kbd> to move and <kbd>Arrow Keys</kbd> to flag)</aside>
                        </label>

                        <label>
                            <input name="colorBlindMode" checked={colorBlindMode} type="checkbox" role="switch" onChange={setFieldValue} />
                            Enable Color Blind Mode
                        </label>

                        <label>
                            <input name="disableSoundEffects" checked={disableSoundEffects} type="checkbox" role="switch" onChange={setFieldValue} />
                            Disable Sound Effects
                        </label>
                    </details>
                </fieldset>

                <button type="submit">Join the Game</button>
            </form>
        </div>
    )
}
