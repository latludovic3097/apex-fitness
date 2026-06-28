// FITStark v9 — service worker d'auto-désinstallation.
// L'app vanilla v8.x avait installé un SW qui mettait en cache index.html + .js
// vanilla. Sans ce SW de remplacement, les anciens visiteurs continueraient à
// voir l'app vanilla en cache pendant des jours (jusqu'à ce que leur navigateur
// décide de rafraîchir). Ce SW :
//   1. Prend le contrôle immédiatement (skipWaiting + clients.claim)
//   2. Vide tous les caches existants
//   3. Se désenregistre lui-même
//   4. Force un reload des clients ouverts → ils chargent l'app React fraîche
self.addEventListener("install", (e) => {
  self.skipWaiting()
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))))
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
      await self.registration.unregister()
      const clientsList = await self.clients.matchAll({ type: "window" })
      clientsList.forEach((c) => c.navigate(c.url))
    })(),
  )
})
