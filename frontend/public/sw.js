self.addEventListener("push", (event) => {
  let payload = { title: "ProMarket", body: "You have a new notification" };
  try {
    payload = event.data.json();
  } catch {
    // Non-JSON payload — fall back to the default above.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/Google.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
