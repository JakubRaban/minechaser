import React from 'react'
import { SocketIOContext } from '../../../contexts/SocketIOContext'

import './ErrorBoundary.scss'

export class ErrorBoundary extends React.Component {
    static contextType = SocketIOContext
    context!: React.ContextType<typeof SocketIOContext>
    state: { hasError: boolean }

    constructor(props: any) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error: any, info: any) {
        this.context.socket.emit('log_error', { error, info })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-screen">
                    Something went wrong :(
                    <a href="/">
                        <button className="primary">Back to Main Menu</button>
                    </a>
                </div>
            )
        }

        return (this.props as any).children
    }
}
