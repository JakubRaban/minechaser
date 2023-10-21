import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { useSocket } from '../hooks/context/useSocket'
import { NameSetter } from './NameSetter/NameSetter'
import { LoadingScreen } from './lib/LoadingScreen/LoadingScreen'
import { usePreferences } from '../hooks/context/usePreferences'

export const AuthenticationGuard: FC<PropsWithChildren<{ authenticated: boolean }>> = ({ children, authenticated }) => {
    const { socket } = useSocket()
    const { name, setName } = usePreferences()
    const [isNameSetCallExecuted, setIsNameSetCallExecuted] = useState(false)
    
    useEffect(() => {
        if (authenticated) {
            socket.emit('is_name_set', {}, ({ name }: { name: string }) => {
                setIsNameSetCallExecuted(true)
                if (name) {
                    setName(name)
                }
            })
        }
    }, [authenticated])
    
    if (!authenticated || !isNameSetCallExecuted) {
        return <LoadingScreen />
    } else if (!name) {
        return <NameSetter />
    } else {
        return <>{children}</>
    }
}
