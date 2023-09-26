import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { useSocket } from '../hooks/context/useSocket'
import { NameSetter } from './LandingPage/NameSetter/NameSetter'
import { LoadingScreen } from './lib/LoadingScreen/LoadingScreen'

export const AuthenticationGuard: FC<PropsWithChildren<{ authenticated: boolean }>> = ({ children, authenticated }) => {
    const { socket } = useSocket()
    const [isNameSet, setIsNameSet] = useState(false)
    
    useEffect(() => {
        socket.emit('is_name_set', {}, ({ name }: { name: string }) => setIsNameSet(!!name))
    }, [])
    
    if (!authenticated) {
        return <LoadingScreen />
    } else if (!isNameSet) {
        return <NameSetter onNameSet={() => setIsNameSet(true)} />
    } else {
        return <>{children}</>
    }
}
