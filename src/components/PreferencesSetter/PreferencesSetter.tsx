import { BaseSyntheticEvent, FC, FormEvent, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useSocket } from '../../hooks/context/useSocket'
import { generateRandomUsername } from '../../helpers'
import cn from 'classnames'
import { usePreferences } from '../../hooks/context/usePreferences'
import { usePhysicalKeyboardDetector } from '../../hooks/usePhysicalKeyboardDetector'
import { ConfirmCancelContainer } from '../lib/ConfirmCancelContainer/ConfirmCancelContainer'

import './PreferencesSetter.scss'

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

const AdvancedOptions: FC<PropsWithChildren<{ collapsible?: boolean }>> = ({ children, collapsible }) => {
    return collapsible ? (
        <details className="advanced">
            <summary>Show more options</summary>
            {children}
        </details>
    ) : (
        <div className="advanced expanded">
            {children}
        </div>
    )
}

interface NameSetterProps {
    buttonText: string
    onConfirm?: () => void
    onCancel?: () => void
    showCollapsibleMenu?: boolean
}

export const PreferencesSetter: FC<NameSetterProps> = ({ buttonText, onConfirm, onCancel, showCollapsibleMenu }) => {
    const { socket } = useSocket()
    const { setSettings, setName, name, ...settings } = usePreferences()
    const [nameState, setNameState] = useState(name || '')
    const [nameError, setNameError] = useState('')
    const [canSubmit, setCanSubmit] = useState(true)
    const placeholderName = useRef(generateRandomUsername())
    const nameInputRef = useRef<HTMLInputElement>(null)
    
    usePhysicalKeyboardDetector()

    const setFieldValue = (event: BaseSyntheticEvent) => {
        setSettings(value => ({
            ...value,
            [event.target.name]: typeof value[event.target.name as keyof typeof settings] === 'boolean' ? event.target.checked : event.target.value,
        }))
    }

    const handleNameChange = (event: BaseSyntheticEvent) => {
        setNameState(event.target.value)
        setCanSubmit(!nameValidator(event.target.value))
    }

    const handleNameBlur = (event: BaseSyntheticEvent) => {
        handleNameChange(event)
        setNameError(nameValidator(event.target.value))
    }

    const submit = (event: FormEvent) => {
        event.preventDefault()
        socket.emit(
            'set_name',
            { name: nameState.trim().replaceAll(/\s+/g, ' ').substring(0, 32) || placeholderName.current },
            (nameResponse?: Record<'name', string>) => {
                nameResponse ? setName(nameResponse.name) : setNameError('Pick another username')
            },
        )
        onConfirm?.()
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
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            aria-invalid={!!nameError || undefined}
                            aria-describedby="name-error"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                        />
                        <small id="name-error">{nameError}</small>
                    </label>

                    <label>
                        <input name="disableMusic" checked={settings.disableMusic} type="checkbox" role="switch" onChange={setFieldValue} />
                        Disable Music
                    </label>

                    <label>
                        <input name="disableSoundEffects" checked={settings.disableSoundEffects} type="checkbox" role="switch" onChange={setFieldValue} />
                        Disable Sound Effects
                    </label>

                    <AdvancedOptions collapsible={showCollapsibleMenu}>
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
                    </AdvancedOptions>
                </fieldset>

                <ConfirmCancelContainer>
                    <button type="submit" disabled={!canSubmit}>{buttonText}</button>
                    {onCancel && <button type="button" onClick={onCancel} className="outline">Cancel</button>}
                </ConfirmCancelContainer>
            </form>
        </div>
    )
}
