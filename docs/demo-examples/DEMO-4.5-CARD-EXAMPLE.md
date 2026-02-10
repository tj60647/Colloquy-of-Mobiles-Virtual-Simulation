# External Sensor Inputs

**Category:** Core Component

**Complexity:** Intermediate

**Dependencies:** Demo 2 (Sensor FOV)

---

## Quick Summary

Demonstrates sensors responding to external stimuli from visitors - webcam for light and microphone for sound. This validates the sensor station interface that will let museum visitors interact with the Colloquy simulation by shining light or making sounds.

## Key Features

- ✨ Webcam-based light input (brightness detection)
- ✨ Microphone-based sound input (volume detection)
- ✨ Real-time Mobile reactions to visitor inputs
- ✨ Fallback simulation mode (no hardware required)

## Classes Demonstrated

`LightSensor`, `SoundSensor` (with external input mode)

## Run Demo

```bash
cd apps/demo-TS-04.5-external-sensors
npm install
npm run dev
```

Open: https://localhost:5173 (HTTPS required for camera/mic)

**Note:** Grant camera and microphone permissions when prompted, or use simulation mode.

---

**Screenshot:**

![Mobile with sensors responding to webcam brightness and microphone volume](screenshot.png)

---

## What You'll Learn

This demo teaches:
- How sensors detect external stimuli (not just other Mobiles)
- Browser Web APIs: `getUserMedia()`, Canvas analysis, Web Audio
- Sensor calibration and thresholds
- Bridging physical world to virtual simulation

## Used By Museum Installation

- **Sensor Stations:** Browser kiosks where visitors interact
  - Webcam captures visitor shining light
  - Microphone captures visitor making sounds
  - Sends sensor events to server via WebSocket
- **Server:** Receives events, updates Mobile sensors
- **Viewing Lenses:** Display Mobile reactions
- **Result:** Visitors see their physical actions affect virtual Mobiles

This demo validates the entire visitor input pathway!
