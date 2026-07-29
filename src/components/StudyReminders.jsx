import React from 'react';
import { registerPushNotifications } from '../useFCMNotification';

export default function StudyReminders() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl text-white">
      <h4 className="font-bold text-yellow-500 text-sm mb-1">Study Session Reminders</h4>
      <p className="text-xs text-neutral-400 mb-4">
        Enable notifications to receive alerts for your morning and night study sessions.
      </p>
      
      <button
        onClick={registerPushNotifications}
        className="px-4 py-2 bg-yellow-500 text-black font-bold text-xs rounded-xl hover:bg-yellow-400 transition-all"
      >
        Enable Reminders
      </button>
    </div>
  );
}