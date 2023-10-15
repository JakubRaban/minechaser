import { FC, PropsWithChildren } from 'react'
import cn from 'classnames'

import './MessageBox.scss'

interface MessageBoxProps {
    warning?: boolean
    className?: string
}

export const MessageBox: FC<PropsWithChildren<MessageBoxProps>> = ({ className, children, warning }) => {
    return (
        <aside className={cn('message-box', className, { warning })}>
            {children}
        </aside>
    )
}
