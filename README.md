# AsianLe Gift Card Admin

A cross-platform admin app for managing Asian Le restaurant gift cards. Built with React Native + Expo, it runs on iOS, Android, and web from a single codebase.

## Features

- **Card list** — view all gift cards with filter and sort options
- **Create card** — issue new gift cards with a label and initial balance
- **Card detail** — view card info, current balance, and QR code
- **QR code** — display and download/share the card's QR code
- **Balance management** — redeem or adjust balances; original balance is PIN-protected
- **QR scanner** — scan a card's QR code to navigate directly to its detail screen
- **Firebase backend** — cards are stored and synced in real time via Firestore

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React Native + Expo 54 |
| Routing | Expo Router (file-based) |
| Styling | NativeWind v4 (Tailwind CSS) |
| Database | Firebase Firestore |
| QR render | react-native-qrcode-svg |
| QR scan | expo-camera |
| QR export | react-native-view-shot + expo-sharing |
| Animation | React Native Reanimated v4 |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- A Firebase project with Firestore enabled

### 1. Clone and install

```bash
git clone <repo-url>
cd AsianLeGiftCardAmin
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firestore project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |
| `EXPO_PUBLIC_ORIGINAL_BALANCE_PIN` | PIN required to edit a card's original balance |

### 3. Run the dev server

```bash
# Interactive (choose platform at runtime)
npx expo start

# Target a specific platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

## Project Structure

```
app/
  _layout.tsx       # Root layout, stack navigator, theme
  index.tsx         # Card list (/)
  create.tsx        # Create card (/create)
  card/[id].tsx     # Card detail with QR (/card/:id)
  scan.tsx          # QR scanner (/scan)
  login.tsx         # Login screen

components/
  CardRow.tsx       # Single row in the card list
  BalanceInput.tsx  # Numeric input with validation
  DropdownPicker.tsx# Labelled dropdown for filter/sort
  QRDisplay.tsx     # QR code render and export
  PinModal.tsx      # PIN entry modal (cross-platform)

lib/
  firebase.ts       # Firebase initialisation
  cards.ts          # Typed Firestore helpers
  auth.ts           # Auth helpers
  config.ts         # App-wide constants (QR_BASE_URL)
  types.ts          # Shared TypeScript types
```

## Data Model

Each gift card document in Firestore has this shape:

```ts
type GiftCard = {
  id: string;
  label: string;
  balance: number;
  originalBalance: number;  // PIN-protected
  archived: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
};
```

## Deployment

The web build can be exported and deployed to Firebase Hosting:

```bash
npx expo export --platform web
firebase deploy --only hosting
```

## PIN Protection

Editing a card's original balance requires the PIN set in `EXPO_PUBLIC_ORIGINAL_BALANCE_PIN`. The PIN prompt uses the `PinModal` component — do not use `Alert.prompt` or `window.prompt` for this flow.
