import { WarningIcon } from '../../../icons/Warning/WarningIcon'
import { usePreferences } from '../../../hooks/context/usePreferences'

import './ScreenOrientationWarning.scss'

export const ScreenOrientationWarning = () => {
    const { showOnScreenControls } = usePreferences()
    
    return showOnScreenControls ? (
        <aside className="warning device-orientation-warning">
            <WarningIcon />
            You will be prompted to rotate the device horizontally once the game starts.
        </aside>
    ) : null
}
