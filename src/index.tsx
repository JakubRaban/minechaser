import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './components/App'

import './styles/common.css'
import './styles/reset.css'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
    // <StrictMode>
    <App />,
    // </StrictMode>,
)
