importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your_firebase_api_key",
  projectId: "your_firebase_project_id",
  messagingSenderId: "your_firebase_messaging_sender_id",
  appId: "1:656395612665:web:418c56b55913db35dc0d28"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Study Session Reminder', {
    body: body || 'Time for your study session! Stay on track.',
    icon: '/favicon.ico'
  });
});