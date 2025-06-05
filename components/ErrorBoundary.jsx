import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-4">
            <div className="text-red-400 text-xl mb-4">Something went wrong</div>
            <div className="text-gray-300 mb-4">
              An unexpected error occurred. Please refresh the page and try again.
            </div>
            <button 
              className="bg-[#E0AD6B] hover:bg-[#d9a05e] text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            <button 
              className="bg-transparent border border-[#E0AD6B] hover:bg-[#E0AD6B] text-white font-bold py-2 px-4 rounded"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
