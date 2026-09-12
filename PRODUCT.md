# Product

<!-- impeccable:product-schema 1 -->

## Platform

Mobile (iOS and Android via React Native Expo)

## Stack

React Native with Expo (~57.0.22), Express.js backend with SQLite3. Mobile app built with expo-router, zustand state management, expo-sqlite for offline-first local storage. Server deployed on a VPS with Tailscale networking. Deployed to iOS and Android app stores.

## Users

Primary users are patients self-monitoring their blood pressure at home, typically after a hypertension or prehypertension diagnosis. They may be on medication and need to track readings regularly. The product's social dimension extends to family members and friends who support each other through gamified tracking — making it a shared accountability system rather than isolated logging.

Secondary users include caregivers who may monitor readings for elderly or dependent family members.

## Product Purpose

Enable consistent blood pressure self-monitoring through offline-first local recording, configurable reminders, medication tracking, and a social accountability layer where friends and family can see each other's readings and motivate one another. Success means users establish a regular measurement habit and maintain engagement through social support and gamification.

## Positioning

Gamified multiplayer blood pressure tracking. Unlike passive logging apps, this product creates a shared accountability circle — friends and family see each other's readings, compete on consistency streaks, and support each other through the journey of better health outcomes. The differentiator is social reinforcement, not just data collection.

## Operating Context

- Users measure blood pressure at home using a personal Bluetooth or cuff-based monitor
- Readings are entered manually into the app (no direct device Bluetooth integration yet)
- Morning and evening measurement windows with configurable push notifications
- Offline-first: readings are saved locally first, synced to cloud when connected
- Server runs on a VPS accessible via Tailscale private network (port 3001)
- Medication names stored in Portuguese (Losartana, Enalapril, Atenolol, Hidroclorotiazida, Amlodipina, Outro)

## Capabilities and Constraints

Confirmed capabilities:
- Offline-first local storage with expo-sqlite
- Cloud sync via Express.js REST API
- Configurable morning/evening push notification reminders
- Blood pressure reading capture with systolic, diastolic, and heart rate
- Medication tracking with named medication selection
- Symptoms and free-text notes per reading
- Color-coded pressure classification (Normal/Elevada/Alta)
- Historical chart visualization

Planned capabilities (not yet implemented):
- Social graph: friends and family connections
- Shared reading visibility between connected users
- Gamification: consistency streaks, achievements, challenges
- User authentication and account management
- Real-time or near-real-time sync between connected users

Constraints:
- Database schema must not be corrupted or desynchronized during any visual transition
- Existing API endpoints (`/api/readings`, `/api/medications`, `/health`) must remain functional
- Active login sessions must be preserved; no forced re-authentication
- High-frequency cognitive routes must be preserved (primary action: add a new reading)
- Information architecture hierarchy must remain directly mappable to existing navigation
- Error states, form validations, and edge cases must not be skipped during any design work
- Performance on older devices must be maintained (no heavy animations or GPU-intensive effects)
- App is in Portuguese (Brazil) — all UI text, dates, and content stay in pt-BR
- No current authentication system exists; social features require building user accounts from scratch

## Brand Commitments

App name: "Pressão Arterial Monitor" (v1.0)
Language: Portuguese (Brazil)
Default medications in Portuguese
No existing brand guidelines, style guide, or visual identity system documented

## Evidence on Hand

- Existing mobile app with 4 screens: home, history, new-reading, settings
- Server with Express.js REST API and SQLite database
- Current visual style: Material-inspired with blue (#2196f3) primary, card-based layout
- No user-generated content, testimonials, or case studies available
- No visual reference assets or brand guidelines

## Product Principles

1. Offline-first reliability — readings are always saved, always accessible, regardless of connection
2. Habit through support — consistency comes from social accountability, not just reminders
3. Simplicity at the point of entry — adding a reading must feel effortless, the primary action must be frictionless
4. Privacy by design — health data is personal; social sharing is opt-in and granular
5. Clarity over cleverness — blood pressure values and classifications must be instantly scannable at a glance
