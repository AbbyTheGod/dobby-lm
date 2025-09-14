'use client';

export default function TestAnimations() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="animate-spin-slow rounded-full h-16 w-16 border-4 border-primary/20 mx-auto"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-primary absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Testing Animations</h2>
          <p className="text-muted-foreground">This page tests the loading animations...</p>
        </div>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce-slow"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce-slow" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce-slow" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Testing individual animations:</p>
          </div>
          <div className="flex space-x-4 justify-center">
            <div className="w-8 h-8 bg-primary rounded-full animate-spin"></div>
            <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
