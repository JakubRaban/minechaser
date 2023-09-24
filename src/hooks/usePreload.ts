import { Preloadable } from '../components/lazy-components'
import { useEffect } from 'react'

export const usePreload = (...components: Preloadable[]) => {
    useEffect(() => {
        components.forEach(c => c.preload())
    }, [])
}
