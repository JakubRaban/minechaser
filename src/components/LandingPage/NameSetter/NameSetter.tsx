import { FC, useState } from 'react'
import { useSocket } from '../../../hooks/useSocket'

interface NameSetterProps {
    onNameSet?: (name: string) => void
}

export const NameSetter: FC<NameSetterProps> = ({ onNameSet }) => {
    const { socket } = useSocket()
    const [name, setName] = useState('')

    return (
        <>
            <div>Enter your name</div>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
            <button onClick={() => socket.emit('set_name', { name }, ({ name }: { name: string }) => onNameSet?.(name))}>Submit</button>
        </>
    )
}
