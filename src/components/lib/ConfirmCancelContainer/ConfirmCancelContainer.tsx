import { FC, PropsWithChildren } from 'react'

import './ConfirmCancelContainer.scss'

export const ConfirmCancelContainer: FC<PropsWithChildren> = ({ children }) => (
    <div className="confirm-cancel-container">
        {children}
    </div>
)
