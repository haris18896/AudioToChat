# AudioToChat

A React Native application that plays audio files while displaying and highlighting synchronized transcript text in a chat-like interface.

## 📱 Features

- **Audio Playback Controls**: Play, Pause, Rewind, Forward, and Repeat functionality
- **Synchronized Transcript**: Chat-style display of spoken phrases with real-time highlighting
- **Cross-Platform**: Runs on Web, iOS, and Android
- **Phrase Navigation**: Skip to previous/next phrases during playback
- **Slow Repeat**: Repeat the last spoken phrase at 0.75x speed for better comprehension

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and SDK

## ⚡ Installation

1. **Clone the repository**
   ```bash
   git clone [AudioToChat](https://github.com/haris18896/AudioToChat)
   cd AudioToChat
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

## 🚀 Running the Application

### Web
```bash
npm run web
# or
yarn web
```
Access the application at `http://localhost:3000`

### iOS
```bash
npm run ios
# or
yarn ios
```

### Android
```bash
npm run android
# or
yarn android
```

## 🧪 Testing

### Run all tests
```bash
npm test
# or
yarn test
```

### Run unit tests only
```bash
npm run test:unit
```

### Run integration tests only
```bash
npm run test:integration
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in watch mode
```bash
npm run test:watch
```

## 📁 Project Structure

```
AudioToChat/
├── src/
│   ├── components/          # React components
│   │   ├── ChatScreen.tsx   # Main chat interface
│   │   ├── Message.tsx      # Individual message component
│   │   └── MediaPlayer.tsx  # Audio player controls
│   ├── hooks/               # Custom React hooks
│   │   └── useUnifiedAudioPlayer.ts # Audio player logic
│   ├── styles/              # Styled components
│   ├── utils/               # Utility functions
│   │   ├── transcriptionUtils.ts # Transcript processing
│   │   └── timeUtils.ts     # Time formatting utilities
│   ├── assets/              # Static assets
│   │   └── json/            # Sample transcript data
│   └── types/               # TypeScript type definitions
├── __tests__/               # Test files
├── ios/                     # iOS-specific files
├── android/                 # Android-specific files
└── public/                  # Web static files
```

## 🎵 Audio Controls

| Button | Function |
|--------|----------|
| **Play** | Start audio playback from current position |
| **Pause** | Pause audio playback |
| **Rewind** | Go to beginning of current phrase (or previous phrase if at start) |
| **Forward** | Skip to beginning of next phrase |
| **Repeat** | Replay the last spoken phrase at 0.75x speed |

## 📝 Transcript Format

The application expects transcript metadata in the following JSON format:

```json
{
  "pause": 250,
  "speakers": [
    {
      "name": "Speaker1",
      "phrases": [
        {
          "words": "This is the spoken text",
          "time": 2000
        }
      ]
    }
  ]
}
```

- `pause`: Duration (ms) of silence after each phrase
- `time`: Duration (ms) of the phrase in audio
- Audio plays phrases in interleaved order between speakers

## 🔧 Technical Details

### Audio Playback
- **Mobile**: Uses `react-native-sound` for native audio playback
- **Web**: Uses HTML5 Audio API
- **Synchronization**: 50ms interval updates for precise phrase timing

### State Management
- React hooks for audio state management
- Real-time phrase tracking and highlighting
- Efficient message visibility calculations

### Styling
- `styled-components` for consistent theming
- Platform-specific optimizations
- Modern, clean UI design

## 📦 Building for Production

### Web Build
```bash
npm run build:web
# or
yarn build:web
```

### iOS Build
1. Open `ios/AudioToChat.xcworkspace` in Xcode
2. Select your target device/simulator
3. Build and run (⌘+R)

### Android Build
```bash
cd android
./gradlew assembleRelease
```

## 🐛 Troubleshooting

### iOS Build Issues
```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install
cd ..
```

### Metro/Web Port Conflicts
```bash
# Kill processes on port 3000/8081
lsof -ti:3000 | xargs kill -9
lsof -ti:8081 | xargs kill -9
```

### Node Modules Issues
```bash
# Clean reinstall
rm -rf node_modules package-lock.json yarn.lock
npm install
```

## 🛠️ Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Jest for testing
- Git hooks for pre-commit checks

### Architecture
- Modular component structure
- Custom hooks for business logic
- Styled-components for theming
- Platform-specific optimizations

## 📄 License

This project is part of a React Native coding assessment.

---

**Built with React Native and ❤️**