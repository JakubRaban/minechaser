import { WarningIcon } from '../../../icons/Warning/WarningIcon'
import { usePreferences } from '../../../hooks/context/usePreferences'
import { MessageBox } from '../MessageBox/MessageBox'

import './ScreenOrientationWarning.scss'

export const ScreenOrientationWarning = () => {
    const { showOnScreenControls } = usePreferences()
    
    return showOnScreenControls ? (
        <MessageBox warning={true} className="device-orientation-warning">
            <WarningIcon />
            You may find playing easier with device rotated horizontally
        </MessageBox>
    ) : null
}
