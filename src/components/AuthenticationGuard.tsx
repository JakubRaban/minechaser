import { FC, PropsWithChildren } from 'react'

export const AuthenticationGuard: FC<PropsWithChildren<{ authenticated: boolean }>> = ({ children, authenticated }) =>
    authenticated ? <>{children}</> : <div>Loading...</div>
