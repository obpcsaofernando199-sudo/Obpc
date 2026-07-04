/* firebase-messaging-sw.js
   Service Worker do Firebase Cloud Messaging — OBPC São Fernando
   Este arquivo deve ficar na RAIZ do site (mesma pasta do painel.html / index.html)
*/
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

/* ⚠️ TROQUE pelos MESMOS dados do seu projeto Firebase usados no painel.html */
firebase.initializeApp({
  apiKey: "AIzaSyBwrxwxOVAkMuxg3KrBokms7DvVtZisRNM",
  authDomain: "obpc-saofernando-1d6f3.firebaseapp.com",
  databaseURL: "https://obpc-saofernando-1d6f3-default-rtdb.firebaseio.com",
  projectId: "obpc-saofernando-1d6f3",
  storageBucket: "obpc-saofernando-1d6f3.firebasestorage.app",
  messagingSenderId: "338504197999",
  appId: "1:338504197999:web:bef16273d1a7135da8ea9a"
});

var messaging = firebase.messaging();

/* Notificação recebida com o site/navegador em segundo plano ou fechado */
messaging.onBackgroundMessage(function(payload) {
  var titulo = (payload.notification && payload.notification.title) || 'OBPC São Fernando';
  var opcoes = {
    body: (payload.notification && payload.notification.body) || '',
    icon: (payload.notification && payload.notification.icon) || 'https://obpcsaofernando199-sudo.github.io/Obpc/icone.png',
    badge: 'https://obpcsaofernando199-sudo.github.io/Obpc/icone.png',
    data: payload.data || {}
  };
  self.registration.showNotification(titulo, opcoes);
});

/* Ao clicar na notificação, abre o site */
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || 'https://obpcsaofernando199-sudo.github.io/Obpc/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
