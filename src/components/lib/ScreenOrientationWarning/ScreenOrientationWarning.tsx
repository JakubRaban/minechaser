import { WarningIcon } from '../../../icons/Warning/WarningIcon'
import { usePreferences } from '../../../hooks/context/usePreferences'
import { MessageBox } from '../MessageBox/MessageBox'

import './ScreenOrientationWarning.scss'

export const ScreenOrientationWarning = () => {
    const { showOnScreenControls } = usePreferences()
    
    return showOnScreenControls ? (
        <MessageBox warning={true} className="device-orientation-warning">
            <WarningIcon />
            You will be prompted to rotate the device horizontally once the game starts.
        </MessageBox>
    ) : null
}
