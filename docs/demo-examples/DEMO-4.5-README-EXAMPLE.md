# Demo 4.5: External Sensor Inputs

## Purpose

Demonstrates how sensors respond to external stimuli from visitors - using webcam for light input and microphone for sound input. This validates the sensor station interface that will be used in the museum installation.

## What You'll See

- One or two Mobiles with external-facing sensors
- Real-time webcam feed (small preview window)
- Brightness detection from webcam (light sensor input)
- Audio waveform visualization
- Volume detection from microphone (sound sensor input)
- Mobile reactions to external stimuli
- Threshold indicators showing when sensors are activated
- Fallback simulation mode (if webcam/mic not available)

## Core Concepts Demonstrated

- `LightSensor.ts` - Detecting external light intensity
- `SoundSensor.ts` - Detecting external sound volume
- Browser Web APIs - `getUserMedia()`, Canvas brightness analysis, Web Audio API
- Sensor thresholds and activation states
- External input → simulation state pathway

## Controls

### Camera Controls (Standard Across All 3D Demos)
- **Left Mouse Drag:** Rotate camera around scene (orbit)
- **Right Mouse Drag:** Pan camera
- **Mouse Wheel:** Zoom in/out
- **R Key:** Reset camera to default view
- **T Key:** Toggle perspective/orthographic projection
- **F Key:** Focus camera on Mobile
- **1-4 Keys:** Preset views (Top, Front, Side, Isometric)

### Demo-Specific Controls
- **Permission Buttons:** Grant webcam/microphone access
- **Calibrate Button:** Set baseline light/sound levels
- **Simulate Button:** Generate synthetic inputs (no hardware needed)
- **Threshold Sliders:** Adjust sensor sensitivity

### Interaction
- **Shine light at webcam** → Light sensor activates
- **Make sound at microphone** → Sound sensor activates
- Watch Mobile respond to your inputs

### UI Buttons
- **Request Camera:** Request webcam permission
- **Request Microphone:** Request microphone permission
- **Toggle Simulation Mode:** Use synthetic inputs instead of real hardware
- **Calibrate:** Set current environment as baseline
- **Reset Thresholds:** Return to default sensitivity

## Configuration

**Config File:** `public/config.json`

Defines 1-2 Mobiles with external-facing sensors:
```json
{
  "mobiles": [
    {
      "id": 1,
      "name": "Visitor-Responsive Mobile",
      "sensors": [
        {
          "type": "light",
          "externalInput": true,
          "threshold": 0.5
        },
        {
          "type": "sound",
          "externalInput": true,
          "threshold": 0.3
        }
      ]
    }
  ]
}
```

The `externalInput: true` flag indicates these sensors read from webcam/mic rather than from actuators in the scene.

## Technical Details

### Simulation Classes Used
- `lib/components/LightSensor.ts` - External input mode
- `lib/components/SoundSensor.ts` - External input mode
- `lib/Mobile.ts` - Container for sensors
- `lib/Transform.ts` - Positioning

### Visualization
- **Renderer:** `ThreeJSRenderer` with standard `CameraController`
- **Update Rate:** 60 fps
- **Camera:** Perspective with orbit controls
- **Additional UI:** Canvas elements for webcam preview and audio waveform

### Camera Controls
Uses standardized `CameraController` from Phase A:
- Orbit, pan, zoom
- Reset and preset views
- Perspective/orthographic toggle
- Object focus (Mobile)

### Web API Integration

#### Webcam (Light Input)
```typescript
// Request camera access
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'user' } 
});

// Analyze brightness frame-by-frame
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const brightness = calculateAverageBrightness(imageData);

// Feed to light sensor
lightSensor.setExternalInput(brightness);
```

#### Microphone (Sound Input)
```typescript
// Request microphone access
const stream = await navigator.mediaDevices.getUserMedia({ 
  audio: true 
});

// Analyze volume
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const microphone = audioContext.createMediaStreamSource(stream);
microphone.connect(analyser);

// Get volume level
const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteTimeDomainData(dataArray);
const volume = calculateRMS(dataArray);

// Feed to sound sensor
soundSensor.setExternalInput(volume);
```

### Fallback Simulation Mode

If webcam/mic not available or permission denied:
- Generate synthetic light patterns (sine waves, pulses)
- Generate synthetic sound patterns (amplitude variations)
- UI controls to manually trigger inputs
- Maintains full demo functionality without hardware

## Dependencies

**Required Demos:** Demo 2 (Sensor FOV - understanding sensor mechanics)  
**Blocks Demos:** None (validates sensor stations, doesn't block other demos)

## Relationship to Museum Installation

This demo directly validates the **Sensor Station** component of the museum installation:

**In Demo (this code):**
- Single browser window
- Webcam/mic feeds directly to sensors
- Immediate local response

**In Museum Installation:**
- **Sensor Stations (separate apps):**
  - Visitor-facing kiosks with webcam/mic
  - Run browser app similar to this demo
  - Publish sensor events via WebSocket to server
  ```typescript
  socket.emit('sensor_event', {
    type: 'light',
    intensity: brightness,
    timestamp: Date.now()
  });
  ```

- **Simulation Server:**
  - Receives sensor events from multiple stations
  - Updates Mobile sensor states
  - Broadcasts updated simulation state to viewing lenses

- **Viewing Lenses:**
  - Show Mobile reactions to visitor inputs
  - Multiple visitors can interact simultaneously

**What's Reusable:**
- Webcam/mic capture code → Runs in sensor stations
- Brightness/volume analysis → Runs in sensor stations
- Sensor activation logic → Runs on server
- Sensor classes (`LightSensor`, `SoundSensor`) → Used by server

**What Changes:**
- Demo: Direct function calls from capture to sensor
- Installation: WebSocket messages from station to server

## Development Notes

### Browser Permissions
- Must be served over HTTPS or localhost for `getUserMedia()`
- User must grant camera/microphone permissions
- Handle permission denied gracefully with simulation mode

### Performance Considerations
- Webcam analysis runs at ~30fps (browser video frame rate)
- Microphone analysis runs at audio sample rate (44.1kHz typical)
- Throttle analysis to match simulation update rate (60fps)

### Calibration
- Environment lighting varies (bright room vs dark room)
- Ambient noise varies (quiet vs noisy environment)
- Calibration button sets baseline for relative detection
- Store calibration in localStorage for persistence

### Privacy
- Webcam feed is analyzed locally (never sent to server in demo)
- No video/audio recording
- Only intensity values extracted
- Clear UI indication when camera/mic are active

### Common Pitfalls
- Forgetting HTTPS requirement
- Not handling permission denial
- Analyzing too many pixels (slow) - downsample first
- Audio frequency analysis when only amplitude needed

## See Also

- [LightSensor.ts Source](../../../lib/components/LightSensor.ts)
- [SoundSensor.ts Source](../../../lib/components/SoundSensor.ts)
- [Demo 2: Sensor FOV](../demo-TS-02-sensor-fov/) - Sensor detection basics
- [README - Sensor Stations](../../../readme.md#1-interactive-sensor-stations) - Museum installation context
- [MDN: getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
