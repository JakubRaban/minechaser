import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { useSocket } from '../hooks/context/useSocket'
import { NameSetter } from './LandingPage/NameSetter/NameSetter'

export const AuthenticationGuard: FC<PropsWithChildren<{ authenticated: boolean }>> = ({ children, authenticated }) => {
    const { socket } = useSocket()
    const [isNameSet, setIsNameSet] = useState(false)
    
    useEffect(() => {
        socket.emit('is_name_set', {}, ({ name }: { name: string }) => setIsNameSet(!!name))
    }, [])
    
    if (!authenticated) {
        return <div>Loading...</div>
    } else if (!isNameSet) {
        return <NameSetter onNameSet={() => setIsNameSet(true)} />
    } else {
        return <>{children}</>
    }
}
