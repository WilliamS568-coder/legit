import React, { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export default function NotificationDiagnostics() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('');

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const runDiagnostics = async () => {
    setLogs([]);
    setStatus('Running diagnostics...');
    
    try {
      // Check 1: Platform
      const platform = Capacitor.getPlatform();
      const isNative = Capacitor.isNativePlatform();
      addLog(`Platform: ${platform}`, 'info');
      addLog(`Is Native: ${isNative}`, 'info');

      if (!isNative) {
        addLog('❌ Not running on native platform', 'error');
        setStatus('Not on native platform');
        return;
      }

      // Check 2: Plugin availability
      addLog('✅ Capacitor Push Notifications plugin loaded', 'success');

      // Check 3: Check permissions
      addLog('Checking permissions...', 'info');
      let permStatus = await PushNotifications.checkPermissions();
      addLog(`Permission status: ${JSON.stringify(permStatus)}`, 'info');

      if (permStatus.receive !== 'granted') {
        addLog('⚠️ Permission not granted, requesting...', 'warning');
        permStatus = await PushNotifications.requestPermissions();
        addLog(`Permission request result: ${JSON.stringify(permStatus)}`, 'info');
      }

      if (permStatus.receive === 'granted') {
        addLog('✅ Notification permission granted', 'success');
      } else {
        addLog('❌ Notification permission denied', 'error');
        setStatus('Permission denied');
        return;
      }

      // Check 4: Create channel (Android)
      if (platform === 'android') {
        addLog('Creating notification channel...', 'info');
        try {
          await PushNotifications.createChannel({
            id: 'study-reminders',
            name: 'Study Reminders',
            description: 'Notifications for morning and night study sessions',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
            light: true
          });
          addLog('✅ Notification channel created', 'success');
        } catch (error) {
          addLog(`❌ Error creating channel: ${error.message}`, 'error');
        }
      }

      // Check 5: Register for notifications
      addLog('Registering for push notifications...', 'info');
      
      const registrationPromise = new Promise((resolve) => {
        const timeout = setTimeout(() => {
          addLog('⚠️ Registration timeout (10s)', 'warning');
          resolve(null);
        }, 10000);

        PushNotifications.addListener('registration', (token) => {
          clearTimeout(timeout);
          addLog(`✅ Registration token: ${token.value}`, 'success');
          resolve(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          clearTimeout(timeout);
          addLog(`❌ Registration error: ${JSON.stringify(error)}`, 'error');
          resolve(null);
        });
      });

      await PushNotifications.register();
      addLog('✅ PushNotifications.register() called', 'success');
      
      const token = await registrationPromise;
      
      if (token) {
        addLog(`✅ Device token: ${token.substring(0, 20)}...`, 'success');
        setStatus(`Token: ${token.substring(0, 30)}...`);
      } else {
        addLog('❌ No token received', 'error');
        setStatus('No token received');
      }

      // Check 6: Setup notification listeners
      addLog('Setting up notification listeners...', 'info');
      
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        addLog(`📬 Notification received: ${JSON.stringify(notification)}`, 'success');
        alert(`Notification: ${notification.title}\n${notification.body}`);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        addLog(`🔔 Notification tapped: ${JSON.stringify(notification)}`, 'info');
      });

      addLog('✅ All listeners registered', 'success');
      setStatus('Ready to receive notifications');

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      setStatus(`Error: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus('');
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl text-white">
      <h4 className="font-bold text-yellow-500 text-sm mb-3">🔧 Notification Diagnostics</h4>
      
      <div className="flex gap-2 mb-3">
        <button
          onClick={runDiagnostics}
          className="flex-1 px-3 py-2 bg-green-500 text-white font-bold text-xs rounded-xl hover:bg-green-400 transition-all"
        >
          Run Diagnostics
        </button>
        <button
          onClick={clearLogs}
          className="px-3 py-2 bg-neutral-700 text-white font-bold text-xs rounded-xl hover:bg-neutral-600 transition-all"
        >
          Clear
        </button>
      </div>

      {status && (
        <div className="mb-3 p-2 bg-neutral-800 rounded-lg">
          <p className="text-xs text-yellow-500 font-mono break-all">{status}</p>
        </div>
      )}

      <div className="bg-black rounded-lg p-3 max-h-96 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="text-xs mb-1 font-mono">
            <span className="text-neutral-500">[{log.timestamp}]</span>{' '}
            <span className={
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'warning' ? 'text-yellow-400' :
              'text-neutral-300'
            }>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-xs text-neutral-500 italic">Click "Run Diagnostics" to check notification setup</p>
        )}
      </div>

      <div className="mt-3 p-2 bg-neutral-800 rounded-lg">
        <p className="text-xs text-neutral-400">
          <strong className="text-yellow-500">Common Issues:</strong>
        </p>
        <ul className="text-xs text-neutral-500 mt-1 list-disc list-inside space-y-1">
          <li>Permission denied - Check Android settings</li>
          <li>No token - Check google-services.json</li>
          <li>Channel not created - Android 13+ requires this</li>
          <li>Firebase not configured - Verify project setup</li>
        </ul>
      </div>
    </div>
  );
}