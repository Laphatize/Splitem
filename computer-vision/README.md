# MarlowOS - Drone Control & Face Recognition

A modern web application for controlling Tello drones with integrated face recognition and live video streaming.

## Features

- **MarlowOS Interface**: Sleek, modern dark UI with cyan accents
- **Live Video Streaming**: Direct UDP video feed in the web interface
- **Face Recognition**: Detect and identify faces using the drone's camera
- **Drone Control**: Full flight controls for the Tello drone
- **Side-by-Side Interface**: Video feed and controls displayed efficiently

## Prerequisites

- Node.js (v14 or higher)
- npm
- Tello Drone with compatible firmware
- FFmpeg (optional, provides better video quality)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/computer-vision.git
   cd computer-vision
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3002
   TELLO_IP=192.168.10.1
   TELLO_CONTROL_PORT=8889
   TELLO_STATE_PORT=8890
   TELLO_VIDEO_PORT=11111
   SERVER_HOST=localhost
   ```

## Usage

1. Start the server:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3002`

3. Connect to your Tello drone:
   - Ensure your computer is connected to the Tello drone's WiFi network
   - Click "Connect Falcon" in the interface
   - Choose auto or manual connection mode
   - Once connected, the live video feed will automatically start

4. Use the interface to:
   - Control the drone's movement
   - Capture faces from the live feed
   - Add new faces to the recognition database
   - View recognized faces in real-time

## Troubleshooting

- **No video feed**: Make sure the drone is connected and has sufficient battery
- **Poor video quality**: Ensure you have a stable WiFi connection to the drone
- **Missing dependencies**: Run `npm install` to ensure all packages are installed

## Technology Stack

- Node.js with Express
- Socket.IO for real-time communication
- WebSockets for video streaming
- TailwindCSS for styling
- JavaScript Canvas API for video rendering

## License

MIT
