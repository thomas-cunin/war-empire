# ⚔️ War Empire

An idle/clicker military strategy game built with React Native and Expo.

## 🎮 Concept

Build and develop your army to conquer territories on a world map. Produce military units automatically and earn resources even when you're offline.

## 🛠️ Tech Stack

- **React Native** with **Expo** (managed workflow)
- **expo-router** for navigation
- **react-native-reanimated** for 60fps animations
- **react-native-gesture-handler** for tap mechanics
- **zustand** for state management
- **NativeWind** (Tailwind CSS) for styling
- **TypeScript** (strict mode)

## 🚀 Getting Started

```bash
npm install
npx expo start --tunnel
```

Scan the QR code with Expo Go on your phone.

## 🏗️ Architecture

```
src/
├── engine/       # Game loop, economic formulas, calculations
├── stores/       # Zustand stores (game state)
├── components/   # Reusable UI components
├── hooks/        # Custom hooks (useGameLoop, useOfflineRewards)
├── constants/    # Game data (units, territories, upgrades)
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

## 🎯 Features

- **12 military units** across 4 tiers (Infantry → Naval)
- **50 territories** across 6 continents with unique bonuses
- **Tap mechanics** with combos and critical hits
- **Prestige system** with permanent upgrades
- **Offline progression** with welcome back rewards
- **Synergy system** between unit types
- **Auto-save** with AsyncStorage

## 🧪 Tests

```bash
npx jest
```
