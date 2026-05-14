# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AsianLe Gift Card Admin is a cross-platform mobile/web app built with **React Native + Expo + TypeScript**. It targets iOS, Android, and web via a single codebase.

## Commands

```bash
# Start dev server (choose platform interactively)
npx expo start

# Start targeting a specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

There is no lint, format, or test script configured yet.

## Architecture

**Routing**: Expo Router (file-based). Files inside `app/` map directly to routes:
- `app/_layout.tsx` — root layout; imports `global.css`, sets up the `<Stack>` navigator and applies light/dark themes
- `app/index.tsx` — card list (`/`)
- `app/create.tsx` — create card (`/create`)
- `app/card/[id].tsx` — card detail with QR display (`/card/:id`)
- `app/scan.tsx` — camera QR scan screen (`/scan`)

**TypeScript**: Strict mode enabled. All source files are `.ts`/`.tsx`. Use the `@/` path alias (maps to the repo root) for absolute imports.

**Styling**: NativeWind v4 (Tailwind CSS for React Native). Use `className` props on RN components. Do not use `StyleSheet.create` — use Tailwind classes instead. The only exception is `style` props needed for `Animated.Value` transforms, which cannot use className.

**Firebase**: `lib/firebase.ts` initialises Firestore. `lib/cards.ts` exports typed Firestore helpers. Config is read from `expo-constants` → `app.config.js` → `.env`. Never hardcode Firebase credentials.

**QR domain**: The base URL encoded in QR codes is a constant in `lib/config.ts`. Change `QR_BASE_URL` there when the real domain is known.

**New Architecture**: `newArchEnabled: true` in `app.config.js` — runs on Fabric/JSI. Reanimated (v4) is compatible.

## Components

Reusable components live in `components/`:
- `CardRow.tsx` — single row in the card list; accepts a `CardListFilter` type
- `BalanceInput.tsx` — numeric input for redeem/balance amounts with error display
- `DropdownPicker.tsx` — generic labelled dropdown used for filter/sort on the list screen
- `QRDisplay.tsx` — renders and exports the QR code for a card
- `PinModal.tsx` — cross-platform PIN entry modal; used to gate editing original balance. Props: `visible`, `onCancel`, `onSubmit(pin)`, `error?`, `maxLength?`. Shows inline error on wrong PIN (keeps modal open for retry). Uses `KeyboardAvoidingView` for keyboard handling on all platforms.

## PIN Protection

Original balance edits are gated behind a PIN stored in `EXPO_PUBLIC_ORIGINAL_BALANCE_PIN` (env var). The PIN prompt uses `PinModal` on all platforms — do not use `Alert.prompt` or `window.prompt` for this flow.

## Key Dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `react-navigation` v7 | Underlying navigator primitives |
| `nativewind` | Tailwind CSS for React Native |
| `firebase` | Firestore database |
| `expo-camera` | QR code scanning |
| `react-native-qrcode-svg` | QR code rendering |
| `react-native-view-shot` + `expo-sharing` | QR export/download |
| `expo-constants` | Reads env vars at runtime |
