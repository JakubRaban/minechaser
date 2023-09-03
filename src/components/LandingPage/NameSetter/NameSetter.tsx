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

const nameValidator = (name: string) => {
    if (name.length) {
        const sanitized = name.trim().replaceAll(/\s+/g, ' ').substring(0, 32)
        if (sanitized.length < 3) {
            return 'Name too short'
        } else if (sanitized.length > 32) {
            return 'Name too long'
        }
    }
    return ''
}

export const NameSetter: FC<NameSetterProps> = ({ onNameSet }) => {
    const { socket } = useSocket()
    const { setSettings } = useSettings()
    const [nameError, setNameError] = useState('')
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

    const handleNameBlur = (event: BaseSyntheticEvent) => {
        setNameError(nameValidator(event.target.value))
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
                        <input
                            ref={nameInputRef}
                            name="name"
                            placeholder={placeholderName.current}
                            type="text" value={name}
                            onChange={setFieldValue}
                            onBlur={handleNameBlur}
                            aria-invalid={!!nameError || undefined}
                            aria-describedby="name-error"
                        />
                        <small id="name-error">{nameError}</small>
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

                <button type="submit" disabled={!!nameError}>Join the Game</button>
            </form>
        </div>
    )
}
