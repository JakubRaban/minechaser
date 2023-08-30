import { BaseSyntheticEvent, FC, FormEvent, useRef, useState } from 'react'
import { useSocket } from '../../../hooks/useSocket'
import { generateRandomUsername } from '../../../helpers'

import './NameSetter.scss'
import cn from 'classnames'

interface NameSetterProps {
    onNameSet?: (name: string) => void
}

export const NameSetter: FC<NameSetterProps> = ({ onNameSet }) => {
    const { socket } = useSocket()
    const placeholderName = useRef(generateRandomUsername())

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
            ({ name }: { name: string }) => onNameSet?.(name),
        )
    }

    return (
        <div className="name-setter">
            <form onSubmit={submit}>
                <fieldset>
                    <label>
                        Your Nickname:
                        <input name="name" placeholder={placeholderName.current} type="text" value={name} onChange={setFieldValue} />
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
                        {/*</div>*/}
                    </details>
                </fieldset>

                <button type="submit">Join the Game</button>
            </form>
        </div>
    )
}
