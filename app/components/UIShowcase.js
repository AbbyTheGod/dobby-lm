'use client';

import { useState } from 'react';

export default function UIShowcase() {
  const [activeDemo, setActiveDemo] = useState('buttons');

  const demos = {
    buttons: {
      title: 'Button Components',
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-ghost">Ghost Button</button>
            <button className="btn-destructive">Destructive Button</button>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" disabled>Disabled Primary</button>
            <button className="btn-secondary" disabled>Disabled Secondary</button>
          </div>
        </div>
      )
    },
    cards: {
      title: 'Card Components',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Card Title</h3>
              <p className="text-sm text-muted-foreground">Card description</p>
            </div>
            <div className="card-content">
              <p>This is a beautiful card component with proper spacing and typography.</p>
            </div>
            <div className="card-footer">
              <button className="btn-primary text-sm">Action</button>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Another Card</h3>
              <p className="text-sm text-muted-foreground">With different content</p>
            </div>
            <div className="card-content">
              <p>Cards have consistent styling and hover effects for better UX.</p>
            </div>
            <div className="card-footer">
              <button className="btn-secondary text-sm">Secondary Action</button>
            </div>
          </div>
        </div>
      )
    },
    status: {
      title: 'Status Indicators',
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <span className="status-indicator status-success">Success</span>
            <span className="status-indicator status-warning">Warning</span>
            <span className="status-indicator status-error">Error</span>
            <span className="status-indicator status-info">Info</span>
            <span className="status-indicator status-pending">Pending</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="citation">[S12:3]</span>
            <span className="citation">[S45:1]</span>
            <span className="citation">[S78:2]</span>
          </div>
        </div>
      )
    },
    animations: {
      title: 'Animations',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 animate-bounce"></div>
              <p className="text-sm">Bounce</p>
            </div>
            <div className="card p-4 text-center">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 animate-pulse"></div>
              <p className="text-sm">Pulse</p>
            </div>
            <div className="card p-4 text-center">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 animate-spin"></div>
              <p className="text-sm">Spin</p>
            </div>
            <div className="card p-4 text-center">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 animate-pulse-slow"></div>
              <p className="text-sm">Slow Pulse</p>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">UI Component Showcase</h1>
        <p className="text-muted-foreground">
          World-class design system with modern components and smooth animations
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(demos).map(([key, demo]) => (
          <button
            key={key}
            onClick={() => setActiveDemo(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeDemo === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {demo.title}
          </button>
        ))}
      </div>

      {/* Demo Content */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">{demos[activeDemo].title}</h2>
        {demos[activeDemo].content}
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Smooth Animations</h3>
          <p className="text-muted-foreground text-sm">
            Carefully crafted animations and transitions for a delightful user experience.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Modern Design</h3>
          <p className="text-muted-foreground text-sm">
            Clean, modern interface with glass morphism effects and beautiful gradients.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Responsive</h3>
          <p className="text-muted-foreground text-sm">
            Fully responsive design that works perfectly on all devices and screen sizes.
          </p>
        </div>
      </div>
    </div>
  );
}
