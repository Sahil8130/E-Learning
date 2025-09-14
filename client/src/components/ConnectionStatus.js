import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
          setServerStatus('connected');
        } else {
          setServerStatus('error');
        }
      } catch (error) {
        setServerStatus('error');
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && serverStatus === 'connected') {
    return null; // Don't show anything if everything is working
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
        !isOnline 
          ? 'bg-red-100 text-red-800 border border-red-200'
          : serverStatus === 'error'
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          : 'bg-green-100 text-green-800 border border-green-200'
      }`}>
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>No Internet Connection</span>
          </>
        ) : serverStatus === 'error' ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Server Unavailable</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span>Checking Connection...</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
