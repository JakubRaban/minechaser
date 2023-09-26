import React from 'react'

import './ErrorBoundary.scss'

export class ErrorBoundary extends React.Component {
    state: { hasError: boolean }

    constructor(props: any) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error: any, errorInfo: any) {
        // Do something with the observed error
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
