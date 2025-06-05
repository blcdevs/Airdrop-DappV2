import React from 'react';

// Skeleton loader for text
export const TextSkeleton = ({ width = '100%', height = '1em', className = '' }) => (
  <div 
    className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded ${className}`}
    style={{
      width,
      height,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite'
    }}
  />
);

// Skeleton loader for buttons
export const ButtonSkeleton = ({ width = '120px', height = '40px', className = '' }) => (
  <div 
    className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg ${className}`}
    style={{
      width,
      height,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite'
    }}
  />
);

// Skeleton loader for cards
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg p-4 shadow ${className}`}>
    <TextSkeleton height="1.5em" width="60%" className="mb-3" />
    <TextSkeleton height="1em" width="100%" className="mb-2" />
    <TextSkeleton height="1em" width="80%" className="mb-4" />
    <ButtonSkeleton width="100px" />
  </div>
);

// Loading spinner component
export const LoadingSpinner = ({ size = 'md', color = '#E0AD6B', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div 
      className={`border-4 border-t-transparent border-b-transparent rounded-full animate-spin ${sizeClasses[size]} ${className}`}
      style={{
        borderLeftColor: color,
        borderRightColor: color
      }}
    />
  );
};

// Full page loading component
export const FullPageLoader = ({ 
  title = "Loading...", 
  subtitle = "Please wait while we prepare your content",
  showProgress = false,
  progress = 0,
  retryCount = 0
}) => (
  <div className="bg_light v_light_blue_pro min-h-screen flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="mb-6">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <div className="text-white text-2xl font-bold mb-2">{title}</div>
        <div className="text-gray-300 text-sm">{subtitle}</div>
      </div>
      
      {showProgress && (
        <div className="mb-4">
          <div className="bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-[#E0AD6B] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-gray-400 text-xs">{progress}% complete</div>
        </div>
      )}
      
      {retryCount > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <div className="text-yellow-400 text-sm font-medium">
            Retry attempt {retryCount}/3
          </div>
          <div className="text-yellow-300 text-xs mt-1">
            Retrying due to network conditions...
          </div>
        </div>
      )}

      <div className="text-gray-400 text-xs">
        This may take a few moments on slower connections
      </div>
    </div>
  </div>
);

// Error state component
export const ErrorState = ({ 
  title = "Something went wrong",
  message = "An error occurred while loading the content",
  onRetry,
  onReload,
  showDetails = false,
  details = []
}) => (
  <div className="bg_light v_light_blue_pro min-h-screen flex items-center justify-center">
    <div className="text-center max-w-lg mx-auto p-6">
      <div className="mb-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="text-red-400 text-2xl font-bold mb-2">{title}</div>
        <div className="text-gray-300 mb-6">{message}</div>
      </div>

      {showDetails && details.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
          <ul className="text-gray-300 text-sm space-y-2">
            {details.map((detail, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {onReload && (
          <button
            className="bg-[#E0AD6B] hover:bg-[#d9a05e] text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
            onClick={onReload}
          >
            Reload Application
          </button>
        )}
        {onRetry && (
          <button
            className="bg-transparent border border-[#E0AD6B] hover:bg-[#E0AD6B] text-white font-bold py-3 px-6 rounded-lg w-full transition-colors"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>

      <div className="text-gray-400 text-xs mt-4">
        If the problem persists, please check your connection and try again
      </div>
    </div>
  </div>
);

// Inline loading component for smaller sections
export const InlineLoader = ({ 
  text = "Loading...", 
  size = 'sm',
  className = '' 
}) => (
  <div className={`flex items-center justify-center p-4 ${className}`}>
    <LoadingSpinner size={size} className="mr-2" />
    <span className="text-gray-600">{text}</span>
  </div>
);

// Network-aware loading component
export const NetworkAwareLoader = ({ 
  networkQuality = 'good',
  isRetrying = false,
  retryCount = 0
}) => {
  const getLoadingMessage = () => {
    if (isRetrying) return "Retrying connection...";
    
    switch (networkQuality) {
      case 'poor':
        return "Loading... (Slow connection detected)";
      case 'fair':
        return "Loading... (Limited connection)";
      case 'excellent':
      case 'good':
      default:
        return "Loading...";
    }
  };

  const getSubtitle = () => {
    if (isRetrying) return `Attempt ${retryCount}/3 - Please wait`;
    
    switch (networkQuality) {
      case 'poor':
        return "This may take longer due to your connection speed";
      case 'fair':
        return "Optimizing for your connection speed";
      case 'excellent':
      case 'good':
      default:
        return "Please wait while we load your data";
    }
  };

  return (
    <FullPageLoader
      title={getLoadingMessage()}
      subtitle={getSubtitle()}
      retryCount={isRetrying ? retryCount : 0}
    />
  );
};

// Add shimmer animation styles
export const ShimmerStyles = () => (
  <style jsx global>{`
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `}</style>
);
