import React, { useState } from 'react';

function InitDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const initializeDatabase = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Database initialized successfully!');
        // Reload the page to refresh the app
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to initialize database'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Database Setup
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Click to initialize the database tables
        </p>
        <button
          onClick={initializeDatabase}
          disabled={loading}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-md transition-colors"
        >
          {loading ? 'Initializing...' : 'Initialize Database'}
        </button>
        {message && (
          <p className={`text-xs mt-2 ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default InitDatabaseButton;
