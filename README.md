# AudioToChat - React Native Audio Player with Transcript

A React Native application that plays audio files while displaying and highlighting synchronized transcript text in a chat-like interface.

## 📱 Features

- **Audio Playback Controls**: Play, Pause, Rewind, Forward, and Repeat functionality
- **Synchronized Transcript**: Chat-style display of spoken phrases with real-time highlighting
- **Cross-Platform**: Runs on Web, iOS, and Android
- **Phrase Navigation**: Skip to previous/next phrases during playback
- **Slow Repeat**: Repeat the last spoken phrase at 0.75x speed for better comprehension

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- React Native development environment set up
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and SDK

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AudioToChat
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios
   bundle exec pod install
   cd ..
   ```

## 🏃‍♂️ Running the Application

### Web Version
```bash
yarn web
```
The web version will be available at `http://localhost:3000`

### iOS Version
```bash
yarn ios
```

### Android Version
```bash
yarn android
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
│   │   ├── useAudioPlayer.ts    # Main audio player logic
│   │   └── useWebAudioPlayer.ts # Web-specific audio logic
│   ├── styles/              # Styled components
│   ├── utils/               # Utility functions
│   │   ├── transcriptionUtils.ts # Transcript processing
│   │   └── timeUtils.ts     # Time formatting utilities
│   ├── assets/              # Static assets
│   │   └── json/            # Sample transcript data
│   └── types/               # TypeScript type definitions
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

## 🎨 UI Features

- **Real-time Highlighting**: Current phrase is highlighted during playback
- **Chat Interface**: Messages displayed in a conversational format
- **Responsive Design**: Adapts to different screen sizes
- **Progress Bar**: Visual indication of playback progress
- **Time Display**: Shows current time and total duration

## 🔧 Technical Details

### Audio Playback
- **Mobile**: Uses `react-native-sound` for native audio playback
- **Web**: Uses `useWebAudioPlayer` with HTML5 Audio API
- **Synchronization**: 50ms interval updates for precise phrase timing

### State Management
- React hooks for audio state management
- Real-time phrase tracking and highlighting
- Efficient message visibility calculations

### Styling
- `styled-components` for consistent theming
- Platform-specific optimizations
- Modern, clean UI design

## 🧪 Testing

Run the test suite:
```bash
yarn test
```

## 📦 Building for Production

### Web Build
```bash
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
rm -rf node_modules yarn.lock
yarn install
```

## 📋 Requirements Fulfilled

✅ **Audio Player**: Play, Pause, Rewind, Forward, Repeat controls  
✅ **Transcript Display**: Phrases shown in order with highlighting  
✅ **Phrase Navigation**: Skip between phrases during playback  
✅ **Slow Repeat**: Last phrase replayed at 0.75x speed  
✅ **Cross-Platform**: Web, iOS, Android support  
✅ **Proper Metadata**: Supports specified JSON format  

## 🛠️ Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Git hooks for pre-commit checks

### Architecture
- Modular component structure
- Custom hooks for business logic
- Styled-components for theming
- Platform-specific optimizations

## 📄 License

This project is part of a React Native coding assessment.

---

**Built with React Native 0.81.0 and ❤️**