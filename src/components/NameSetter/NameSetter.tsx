import { BaseSyntheticEvent, FC, FormEvent, useEffect, useRef, useState } from 'react'
import { useSocket } from '../../hooks/context/useSocket'
import { generateRandomUsername } from '../../helpers'
import cn from 'classnames'
import { usePreferences } from '../../hooks/context/usePreferences'
import { usePhysicalKeyboardDetector } from '../../hooks/usePhysicalKeyboardDetector'

import './NameSetter.scss'

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

export const NameSetter: FC = () => {
    const { socket } = useSocket()
    const { setSettings, setName, ...settings } = usePreferences()
    const [nameState, setNameState] = useState('')
    const [nameError, setNameError] = useState('')
    const placeholderName = useRef(generateRandomUsername())
    const nameInputRef = useRef<HTMLInputElement>(null)
    
    usePhysicalKeyboardDetector()

    const setFieldValue = (event: BaseSyntheticEvent) => {
        setSettings(value => ({
            ...value,
            [event.target.name]: typeof value[event.target.name as keyof typeof settings] === 'boolean' ? event.target.checked : event.target.value,
        }))
    }

    const handleNameBlur = (event: BaseSyntheticEvent) => {
        setNameError(nameValidator(event.target.value))
    }

    const submit = (event: FormEvent) => {
        event.preventDefault()
        socket.emit(
            'set_name',
            { name: nameState.trim().replaceAll(/\s+/g, ' ').substring(0, 32) || placeholderName.current },
            (nameResponse: Record<'name', string>) => setName(nameResponse.name),
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
                            type="text"
                            value={nameState}
                            onChange={e => setNameState(e.target.value)}
                            onBlur={handleNameBlur}
                            aria-invalid={!!nameError || undefined}
                            aria-describedby="name-error"
                        />
                        <small id="name-error">{nameError}</small>
                    </label>

                    <details>
                        <summary>Adjust Your Experience</summary>
                        <label>
                            <input name="showOnScreenControls" checked={settings.showOnScreenControls} type="checkbox" role="switch" onChange={setFieldValue} />
                            Show on-screen controls
                            <aside>(for touchscreen devices)</aside>
                        </label>

                        {!settings.showOnScreenControls && (
                            <label>
                                <input name="invertControls" checked={settings.invertControls} type="checkbox" role="switch" onChange={setFieldValue} />
                                Invert Keyboard Controls
                                <aside className={cn({ active: settings.invertControls })}>(If checked, use <kbd>WASD</kbd> to move and <kbd>Arrow Keys</kbd> to flag)</aside>
                            </label>
                        )}

                        <label>
                            <input name="colorBlindMode" checked={settings.colorBlindMode} type="checkbox" role="switch" onChange={setFieldValue} />
                            Color Blind Mode
                        </label>

                        <label>
                            <input name="disableSoundEffects" checked={settings.disableSoundEffects} type="checkbox" role="switch" onChange={setFieldValue} />
                            Disable Sound Effects
                        </label>
                    </details>
                </fieldset>

                <button type="submit" disabled={!!nameError}>Join the Game</button>
            </form>
        </div>
    )
}
