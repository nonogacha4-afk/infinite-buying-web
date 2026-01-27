import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    margin: '10px',
                    border: '1px solid var(--neon-red)',
                    borderRadius: '8px',
                    background: 'rgba(255, 0, 0, 0.1)',
                    color: 'var(--calm-white)'
                }}>
                    <h3 style={{ color: 'var(--neon-red)', marginBottom: '10px' }}>⚠️ Component Error</h3>
                    <pre style={{
                        fontSize: '11px',
                        overflow: 'auto',
                        maxHeight: '100px',
                        background: 'rgba(0,0,0,0.5)',
                        padding: '10px'
                    }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            marginTop: '10px',
                            padding: '5px 10px',
                            background: 'var(--bg-dark)',
                            border: '1px solid var(--border-light)',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Try to Recover
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
