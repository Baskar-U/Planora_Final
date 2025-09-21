import LoadingSpinner from "./LoadingSpinner";

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = "Loading Planora..." }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Planora
          </h1>
          <p className="text-gray-600 mt-2">Your Perfect Event Partner</p>
        </div>
        
        {/* Loading Spinner */}
        <LoadingSpinner size="xl" text={message} />
        
        {/* Decorative elements */}
        <div className="mt-12 flex justify-center space-x-4">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
}
