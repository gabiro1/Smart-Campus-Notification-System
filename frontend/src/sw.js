import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

// ================================================================
// STATE MACHINE — monotonic, never regresses
// ================================================================

const STATE = { INIT: 0, INSTALLED: 1, ACTIVE: 2, READY: 3 }

// ================================================================
// LIFECYCLE TRUTH — browser's actual registration state (spec-defined)
// ================================================================
// Captures the SW spec's full state space at parse time.
// The browser sets registration.{installing,waiting,active} BEFORE
// script evaluation per the SW specification.
//
//   installing ≠ null → install WILL fire (new SW / update)
//   waiting ≠ null    → SW was installed, waiting to activate
//   active ≠ null     → SW is/will-be the active controller
// ================================================================

const _lifecycleState = (() => {
  try {
    if (self.registration.installing) return 'installing'
    if (self.registration.waiting) return 'waiting'
    if (self.registration.active) return 'active'
    return 'unknown'
  } catch (_) { return 'unknown' }
})()

// Will lifecycle events fire for this evaluation?
const _lifecycleWillFire = _lifecycleState === 'installing'
let _state = _lifecycleWillFire ? STATE.INIT : STATE.ACTIVE

// ================================================================
// DEPENDENCY LOCK — hard boundary for push processing
// ================================================================
// Prevents ANY push handler execution until ALL are confirmed:
//   1. _state >= STATE.READY
//   2. _messagingRegistered (onBackgroundMessage bound successfully)
// ================================================================

let _dependenciesMet = false

// ================================================================
// INTERNAL STATE
// ================================================================

let _firebaseInitialized = false
let _messagingRegistered = false
let _firebaseReady = false
let _pendingMessages = []

// ================================================================
// HEALTH METRICS — runtime self-verification data
// ================================================================

const _health = {
  lifecycleState: _lifecycleState,
  lifecyclePath: 'unknown',        // set by activate handler ('lifecycle-event') or cold start ('cold-restart')
  coldStart: _lifecycleState === 'active',
  firebaseInitOk: false,
  messagingRegistered: false,
  dependenciesMet: false,
  clientsClaimed: false,
  pushesQueued: 0,
  pushesDelivered: 0,
  lastPushReceived: null,           // timestamp of most recent push event
  lastPushHandled: null,            // timestamp of most recent handled push
  errors: []
}

// ================================================================
// CACHE NAMES
// ================================================================

const CACHE_PREFIX = 'uninotify'
const CACHE_VERSION = 'v1'
const RUNTIME_CACHE_NAMES = [
  `${CACHE_PREFIX}-${CACHE_VERSION}-pages`,
  `${CACHE_PREFIX}-${CACHE_VERSION}-images`,
  `${CACHE_PREFIX}-${CACHE_VERSION}-api`
]
const _OLD_FLAT_NAMES = ['pages', 'images', 'api-cache']

// ================================================================
// Firebase App Initialization — idempotent, guarded by flag
// ================================================================

function _initFirebaseApp() {
  if (_firebaseInitialized) return
  _firebaseInitialized = true
  try {
    initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    })
    _firebaseReady = true
    _health.firebaseInitOk = true
  } catch (e) {
    console.error('[SW] Firebase app init failed:', e)
  }
}

// ================================================================
// Messaging Registration — only after _state === READY
// ================================================================

function _registerMessaging() {
  if (!_firebaseReady || _messagingRegistered) return
  _messagingRegistered = true
  try {
    const messaging = getMessaging()
    onBackgroundMessage(messaging, (payload) => {
      _health.lastPushReceived = Date.now()
      // HARD LIFECYCLE GATE + DEPENDENCY LOCK
      if (_state < STATE.READY || !_dependenciesMet) {
        _pendingMessages.push(payload)
        _health.pushesQueued++
        return
      }
      _handlePushPayload(payload)
    })
    _health.messagingRegistered = true
  } catch (e) {
    console.error('[SW] Firebase messaging registration failed:', e)
  }
}

// ================================================================
// Push Payload Handler — atomic notification display
// ================================================================

function _handlePushPayload(payload) {
  if (!payload || !payload.notification) return
  const { title, body } = payload.notification
  if (!title) return
  self.registration.showNotification(title, {
    body: body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  })
  _health.lastPushHandled = Date.now()
  _health.pushesDelivered++
}

// ================================================================
// Pending Message Flush — drain queue when dependencies met
// ================================================================

function _flushPendingMessages() {
  const count = _pendingMessages.length
  while (_pendingMessages.length > 0) {
    _handlePushPayload(_pendingMessages.shift())
  }
  if (count > 0) {
    _health.pushesDelivered -= count // avoid double-count
  }
}

// ================================================================
// Dependency Lock Activate — called at end of transition
// ================================================================

function _lockDependencies() {
  if (_state >= STATE.READY && _messagingRegistered) {
    _dependenciesMet = true
    _health.dependenciesMet = true
  }
}

// ================================================================
// TRANSITION TO READY — authoritative lifecycle transition
// ================================================================
// Called from:
//   - activate handler (for new install / update)
//   - cold start init (SW restart, no lifecycle events)
//
// Runs synchronously — zero micro-window between:
//   _state = READY  →  _registerMessaging()
// ================================================================

function _transitionToReady() {
  _state = STATE.ACTIVE
  _initFirebaseApp()
  _state = STATE.READY
  _registerMessaging()
  _flushPendingMessages()
  _lockDependencies()
}

// ================================================================
// INSTALL HANDLER — skipWaiting + state transition
// ================================================================

self.addEventListener('install', () => {
  self.skipWaiting()
  _state = STATE.INSTALLED
})

// ================================================================
// ACTIVATE HANDLER — clients claim + cache cleanup + transition
// ================================================================

self.addEventListener('activate', (event) => {
  _health.lifecyclePath = 'lifecycle-event'
  event.waitUntil((async () => {
    await self.clients.claim()
    _health.clientsClaimed = true

    const cacheKeys = await caches.keys()
    const active = new Set(RUNTIME_CACHE_NAMES)
    await Promise.all(
      cacheKeys
        .filter(key => {
          if (key.startsWith('workbox-')) return false
          if (active.has(key)) return false
          if (key.startsWith(`${CACHE_PREFIX}-`)) return true
          if (_OLD_FLAT_NAMES.includes(key)) return true
          return false
        })
        .map(key => caches.delete(key))
    )

    _transitionToReady()
  })())
})

// ================================================================
// LAYER 2: WORKBOX — Caching engine
// ================================================================

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({ cacheName: RUNTIME_CACHE_NAMES[0] })
)

registerRoute(
  ({ request, url }) => request.destination === 'image' && !url.pathname.startsWith('/icons/'),
  new CacheFirst({ cacheName: RUNTIME_CACHE_NAMES[1] })
)

registerRoute(
  /\/api\//,
  new NetworkFirst({ cacheName: RUNTIME_CACHE_NAMES[2] })
)

// ================================================================
// EVENT ISOLATION GUARD — fetch handler registration seal
// ================================================================

{
  const _orig = self.addEventListener.bind(self)
  let _sealed = false

  self.addEventListener = function(type, ...args) {
    if (type === 'fetch' && _sealed) {
      console.warn('[SW] Blocked fetch handler outside Workbox')
      return
    }
    _orig(type, ...args)
  }

  Promise.resolve().then(() => { _sealed = true })
}

// ================================================================
// COLD START TRANSITION — only when browser signals no lifecycle
// ================================================================
// Guarded by _lifecycleWillFire from self.registration state.
// No timers, no fallback guesses.
//
// This path handles:
//   - Browser restart (SW was active, now revived)
//   - Waiting SW revived (registration.waiting was set, now active)
//   - Any evaluation where install event will NOT fire
// ================================================================

if (!_lifecycleWillFire) {
  _health.lifecyclePath = 'cold-restart'
  _transitionToReady()
}

// ================================================================
// LAYER 4: MESSAGE ROUTER — App <-> SW communication
// Includes self-diagnostic health check handler
// ================================================================

self.addEventListener('message', (event) => {
  if (_state < STATE.READY) {
    event.source?.postMessage({
      type: 'SW_STATE',
      payload: { status: 'NOT_READY', reason: 'SW initializing' }
    })
    return
  }

  const { type } = event.data || {}

  switch (type) {
    case 'SW_GET_STATE':
      event.source?.postMessage({
        type: 'SW_STATE',
        payload: {
          status: 'READY',
          lifecyclePath: _health.lifecyclePath,
          lifecycleState: _health.lifecycleState,
          firebaseReady: _firebaseReady,
          messagingRegistered: _messagingRegistered,
          dependenciesMet: _dependenciesMet,
          stateIndex: _state
        }
      })
      break

    case 'SW_SELF_CHECK':
      event.source?.postMessage({
        type: 'SW_SELF_CHECK_RESULT',
        payload: {
          timestamp: Date.now(),
          state: Object.keys(STATE).find(k => STATE[k] === _state),
          lifecyclePath: _health.lifecyclePath,
          lifecycleState: _health.lifecycleState,
          firebaseReady: _firebaseReady,
          messagingRegistered: _messagingRegistered,
          dependenciesMet: _dependenciesMet,
          clientsClaimed: _health.clientsClaimed,
          coldStart: _health.coldStart,
          pushesQueued: _health.pushesQueued,
          pushesDelivered: _health.pushesDelivered,
          lastPushReceived: _health.lastPushReceived,
          lastPushHandled: _health.lastPushHandled,
          errorCount: _health.errors.length,
          errors: _health.errors.slice(0, 10)
        }
      })
      break

    case 'PUSH_PIPELINE_CHECK':
      self.registration.showNotification('[SW] Pipeline Test', {
        body: 'Test at ' + Date.now(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'sw-pipeline-test'
      }).then(() => {
        event.source?.postMessage({
          type: 'PUSH_PIPELINE_CHECK_RESULT',
          payload: { success: true, timestamp: Date.now() }
        })
        setTimeout(() => self.registration.getNotifications({ tag: 'sw-pipeline-test' }).then(n => n.forEach(n => n.close())), 5000)
      }).catch(err => {
        event.source?.postMessage({
          type: 'PUSH_PIPELINE_CHECK_RESULT',
          payload: { success: false, error: err.message, timestamp: Date.now() }
        })
      })
      break
  }
})

// ================================================================
// NOTIFICATION HANDLER — user interaction with push notifications
// ================================================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        return clients.length > 0
          ? clients[0].focus()
          : self.clients.openWindow('/')
      })
  )
})
