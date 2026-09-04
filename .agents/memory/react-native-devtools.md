---
name: React Native DevTools environment limitation
description: Expo web can run normally even when the optional React Native DevTools binary cannot load a system GLib library.
---

The Expo workflow may log an error while installing React Native DevTools because the container lacks `libglib-2.0.so.0`; this does not prevent Metro, the web bundle, or the mobile preview from serving.

**Why:** The app has been verified running with this warning present, so treating it as a bundle failure causes unnecessary workflow changes.

**How to apply:** Check the actual Metro startup, browser console, screenshot, and app behavior separately before attempting dependency or system-library changes.