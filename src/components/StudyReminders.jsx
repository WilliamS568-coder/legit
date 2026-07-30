import React, { useState } from 'react';
import { registerPushNotifications, testNotification } from '../useFCMNotification';

export default function StudyReminders() {
  const [status, setStatus] = useState('');

  const handleEnableReminders = async () => {
    setStatus('Enabling...');
    await registerPushNotifications();
    setStatus('Check console for token');
  };

  const handleTestNotification = async () => {
    setStatus('Testing...');
    await testNotification();
    setStatus('Check console for token');
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl text-white">
      <h4 className="font-bold text-yellow-500 text-sm mb-1">Study Session Reminders</h4>
      <p className="text-xs text-neutral-400 mb-4">
        Enable notifications to receive alerts for your morning and night study sessions.
      </p>
      
      <div className="flex flex-col gap-2">
        <button
          onClick={handleEnableReminders}
          className="px-4 py-2 bg-yellow-500 text-black font-bold text-xs rounded-xl hover:bg-yellow-400 transition-all"
        >
          Enable Reminders
        </button>
        
        <button
          onClick={handleTestNotification}
          className="px-4 py-2 bg-blue-500 text-white font-bold text-xs rounded-xl hover:bg-blue-400 transition-all"
        >
          Test Notification
        </button>
      </div>
      
      {status && (
        <p className="text-xs text-neutral-500 mt-2 italic">{status}</p>
      )}
      
      <div className="mt-3 p-2 bg-neutral-800 rounded-lg">
        <p className="text-xs text-neutral-400">
          <strong className="text-yellow-500">How to test:</strong>
        </p>
        <ol className="text-xs text-neutral-500 mt-1 list-decimal list-inside space-y-1">
          <li>Click "Enable Reminders"</li>
          <li>Grant permission when prompted</li>
          <li>Check console for your device token</li>
          <li>Go to Firebase Console → Cloud Messaging</li>
          <li>Send test notification to your device token</li>
        </ol>
      </div>
    </div>
  );
}
