import { useNavigate } from 'react-router'
import { PreferencesSetter } from '../PreferencesSetter'

export const LandingPagePreferencesSetter = () => {
    const navigate = useNavigate()

    const onConfirm = () => navigate('/', { state: { success: 'Preferences saved' } })
    const onCancel = () => navigate('/')
    
    return <PreferencesSetter buttonText="Save" onConfirm={onConfirm} onCancel={onCancel} openDetails />
}
