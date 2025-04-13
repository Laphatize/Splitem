from djitellopy import Tello
import cv2
import numpy as np
import time
import argparse
import threading
import socket
import sys
import subprocess
import traceback
import os
try:
    import pygame
    AUDIO_AVAILABLE = True
except ImportError:
    AUDIO_AVAILABLE = False
    print("pygame not available - audio feedback disabled")
import requests
import json
from datetime import datetime
import queue
import platform
# see: https://github.com/damiafuentes/DJITelloPy

# Add global variables
DEBUG = False
COMMAND_TIMEOUT = 5.0  # Default command timeout in seconds
MAX_CONSECUTIVE_FAILURES = 5  # Max number of failures before emergency actions
AUDIO_ENABLED = True  # Global audio feedback flag

# Face detection methods
DETECT_METHOD_CASCADE = 0  # Haar Cascade (faster but less accurate)
DETECT_METHOD_DNN = 1      # Deep Neural Network (more accurate, handles tilted faces better)
DETECT_METHOD_BOTH = 2     # Use both methods combined

# Face detection confidence threshold for DNN model
FACE_DNN_CONFIDENCE = 0.5  # Minimum confidence to consider a detection valid

# Audio file paths - relative to script location
AUDIO_PATHS = {
    "takeoff": "sounds/takeoff.wav",
    "land": "sounds/land.wav",
    "lock": "sounds/lock.wav",
    "unlock": "sounds/unlock.wav",
    "follow": "sounds/follow.wav",
    "stop_follow": "sounds/stop_follow.wav",
    "warning": "sounds/warning.wav",
    "error": "sounds/error.wav",
    "hover": "sounds/hover.wav",
    "alert": "sounds/alert.wav",
    "startup": "sounds/startup.wav"
}

# Initialize pygame audio
def initialize_audio():
    global AUDIO_AVAILABLE, AUDIO_ENABLED
    
    if not AUDIO_AVAILABLE:
        return False
        
    try:
        pygame.mixer.init()
        
        # Create sounds directory if it doesn't exist
        script_dir = os.path.dirname(os.path.abspath(__file__))
        sounds_dir = os.path.join(script_dir, "sounds")
        if not os.path.exists(sounds_dir):
            os.makedirs(sounds_dir)
            print(f"Created sounds directory at {sounds_dir}")
            print("Please add sound files to this directory for audio feedback")
            
        # Check if sound files exist, and provide message if they don't
        missing_files = []
        for name, path in AUDIO_PATHS.items():
            full_path = os.path.join(script_dir, path)
            if not os.path.exists(full_path):
                missing_files.append(path)
                
        if missing_files:
            print(f"Missing audio files: {', '.join(missing_files)}")
            print(f"Place .wav files in the sounds directory for audio feedback")
            
        return len(missing_files) < len(AUDIO_PATHS)  # Return True if at least some files exist
    except Exception as e:
        print(f"Failed to initialize audio: {e}")
        AUDIO_ENABLED = False
        return False

# Function to play sound
def play_sound(sound_name):
    global AUDIO_ENABLED, AUDIO_AVAILABLE
    
    if not AUDIO_ENABLED or not AUDIO_AVAILABLE:
        return
        
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        sound_path = os.path.join(script_dir, AUDIO_PATHS.get(sound_name, ""))
        
        if os.path.exists(sound_path):
            sound = pygame.mixer.Sound(sound_path)
            sound.play()
        else:
            if DEBUG:
                print(f"Sound file not found: {sound_path}")
    except Exception as e:
        if DEBUG:
            print(f"Error playing sound: {e}")

class TelloSimulator:
    """A simulator class that mimics Tello API for demo purposes"""
    def __init__(self):
        self.battery = 90
        self.height = 120
        self.temperature = 32
        self.barometer = 150.5
        self.flight_time = 0
        self.camera = None
        self.flying = False
        self.start_time = None
        
    def connect(self):
        print("Connecting to simulated Tello")
        return True
        
    def get_battery(self):
        # Gradually decrease battery
        if self.flying and self.battery > 0:
            self.battery = max(0, self.battery - 0.01)
        return int(self.battery)
        
    def get_height(self):
        return self.height
        
    def get_temperature(self):
        return self.temperature
        
    def get_barometer(self):
        return self.barometer
        
    def get_flight_time(self):
        if self.flying and self.start_time:
            return int(time.time() - self.start_time)
        return self.flight_time
    
    def takeoff(self):
        print("Simulated takeoff")
        self.flying = True
        self.start_time = time.time()
        self.height = 100
        return True
    
    def land(self):
        print("Simulated landing")
        self.flying = False
        self.height = 0
        return True
        
    def emergency(self):
        print("EMERGENCY STOP (simulated)")
        self.flying = False
        self.height = 0
        return True
    
    def streamon(self):
        print("Starting simulated video stream")
        # Try to use the webcam
        self.camera = cv2.VideoCapture(0)
        if not self.camera.isOpened():
            print("Could not open webcam, using simulated video")
            self.camera = None
        return True
    
    def streamoff(self):
        print("Stopping simulated video stream")
        if self.camera:
            self.camera.release()
        return True
    
    def get_frame_read(self):
        return self
        
    @property
    def frame(self):
        if self.camera and self.camera.isOpened():
            ret, frame = self.camera.read()
            if ret:
                return frame
                
        # Create a simulated frame if webcam not available
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Add some visual elements
        cv2.putText(frame, "SIMULATED CAMERA", (180, 240), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
        
        # Draw a grid pattern
        for x in range(0, 640, 50):
            cv2.line(frame, (x, 0), (x, 480), (50, 50, 50), 1)
        for y in range(0, 480, 50):
            cv2.line(frame, (0, y), (640, y), (50, 50, 50), 1)
            
        return frame
    
    # Dummy movement methods
    def move_left(self, cm):
        print(f"Simulated move left {cm}cm")
        return True
        
    def move_right(self, cm):
        print(f"Simulated move right {cm}cm")
        return True
        
    def move_forward(self, cm):
        print(f"Simulated move forward {cm}cm")
        return True
        
    def move_back(self, cm):
        print(f"Simulated move back {cm}cm")
        return True
        
    def move_up(self, cm):
        print(f"Simulated move up {cm}cm")
        self.height += cm
        return True
        
    def move_down(self, cm):
        print(f"Simulated move down {cm}cm")
        self.height = max(0, self.height - cm)
        return True
        
    def rotate_clockwise(self, degrees):
        print(f"Simulated rotate clockwise {degrees} degrees")
        return True
        
    def rotate_counter_clockwise(self, degrees):
        print(f"Simulated rotate counter-clockwise {degrees} degrees")
        return True

# Function to handle button clicks
def handle_button_click(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        tello, buttons, button_states = param
        
        for i, (text, x1, y1, x2, y2, color, action) in enumerate(buttons):
            if x1 <= x <= x2 and y1 <= y <= y2:
                # Execute the action
                if action == "takeoff" and not button_states["flying"]:
                    print("Taking off!")
                    tello.takeoff()
                    button_states["flying"] = True
                    
                elif action == "land" and button_states["flying"]:
                    print("Landing!")
                    tello.land()
                    button_states["flying"] = False
                    
                elif action == "emergency":
                    print("EMERGENCY STOP!")
                    tello.emergency()
                    button_states["flying"] = False
                    
                elif action == "toggle_tracking":
                    button_states["tracking_enabled"] = not button_states["tracking_enabled"]
                    print(f"Tracking {'enabled' if button_states['tracking_enabled'] else 'disabled'}")
                    
                elif action == "toggle_face_lock":
                    button_states["face_locked"] = not button_states["face_locked"]
                    if not button_states["face_locked"]:
                        button_states["locked_face_features"] = None
                        # Disable follow mode if face lock is disabled
                        button_states["follow_mode"] = False
                    print(f"Face lock {'enabled' if button_states['face_locked'] else 'disabled'}")
                
                elif action == "toggle_follow":
                    # Can only enable follow mode if face is locked
                    if button_states["face_locked"] or not button_states["follow_mode"]:
                        button_states["follow_mode"] = not button_states["follow_mode"]
                        if button_states["follow_mode"] and not button_states["face_locked"]:
                            # Auto-enable face lock when follow mode is turned on
                            button_states["face_locked"] = True
                        print(f"Follow mode {'enabled' if button_states['follow_mode'] else 'disabled'}")
                    
                break

def check_wifi_connection(expected_prefix="TELLO"):
    """Check if currently connected to a Tello WiFi network"""
    try:
        # Different commands based on OS
        if sys.platform == 'darwin':  # macOS
            output = subprocess.check_output(["networksetup", "-getairportnetwork", "en0"]).decode('utf-8')
            if "Current Wi-Fi Network" in output:
                ssid = output.split(": ")[1].strip()
                print(f"Currently connected to WiFi: {ssid}")
                return expected_prefix in ssid
        elif sys.platform == 'win32':  # Windows
            output = subprocess.check_output(["netsh", "wlan", "show", "interfaces"]).decode('utf-8')
            if "SSID" in output:
                for line in output.split('\n'):
                    if "SSID" in line and "BSSID" not in line:
                        ssid = line.split(":")[1].strip()
                        print(f"Currently connected to WiFi: {ssid}")
                        return expected_prefix in ssid
        elif sys.platform == 'linux':  # Linux
            output = subprocess.check_output(["iwgetid", "-r"]).decode('utf-8').strip()
            print(f"Currently connected to WiFi: {output}")
            return expected_prefix in output
    except Exception as e:
        print(f"Error checking WiFi connection: {e}")
    
    print("Could not determine WiFi connection")
    return False

def test_direct_connection(ip="192.168.10.1", port=8889, timeout=2):
    """Test if we can connect to the Tello via socket directly"""
    if DEBUG:
        print(f"Testing direct socket connection to {ip}:{port}...")
    
    try:
        # Create socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(timeout)
        
        # Send connection command
        sock.sendto(b'command', (ip, port))
        
        # Wait for response
        response, _ = sock.recvfrom(1024)
        
        sock.close()
        
        if response == b'ok':
            if DEBUG:
                print("Direct socket connection successful!")
            return True
        else:
            if DEBUG:
                print(f"Unexpected response: {response}")
            return False
    except socket.timeout:
        if DEBUG:
            print("Socket connection timed out")
        return False
    except Exception as e:
        if DEBUG:
            print(f"Socket connection error: {e}")
        return False

def face_tracking(simulation_mode=False, force_real=False, direct_ip=None, debug=False, smoothness=1.0, 
                 command_timeout=5.0, command_cooldown=0.3, detection_method=DETECT_METHOD_BOTH):
    global DEBUG, AUDIO_ENABLED, webhook  # Add webhook to globals
    DEBUG = debug
    
    # Initialize audio if available
    if AUDIO_AVAILABLE and AUDIO_ENABLED:
        AUDIO_ENABLED = initialize_audio()
        if AUDIO_ENABLED:
            play_sound("startup")
            
    # Send initialization event
    if webhook:
        webhook.send_event("initialization", {
            "simulation_mode": simulation_mode,
            "debug_mode": debug,
            "detection_method": detection_method,
            "smoothness": smoothness,
            "command_timeout": command_timeout,
            "command_cooldown": command_cooldown,
            "audio_enabled": AUDIO_ENABLED
        })

    # Validate smoothness factor
    smoothness = max(0.5, min(2.0, smoothness))
    if DEBUG:
        print(f"Using smoothness factor: {smoothness}")
        print(f"Command timeout: {command_timeout}s")
        print(f"Command cooldown: {command_cooldown}s")
    
    if DEBUG:
        print("DEBUG MODE ENABLED")
        print(f"Python version: {sys.version}")
        print(f"OpenCV version: {cv2.__version__}")
        try:
            import pkg_resources
            tello_version = pkg_resources.get_distribution("djitellopy").version
            print(f"DJITelloPy version: {tello_version}")
        except:
            print("Could not determine DJITelloPy version")
    
    print("Create Tello object")
    
    # Try to connect to real drone if not in simulation mode
    tello = None
    if not simulation_mode:
        try:
            # Check if we're on the Tello WiFi network
            is_on_tello_wifi = check_wifi_connection("TELLO")
            
            if not is_on_tello_wifi and not force_real and direct_ip is None:
                print("WARNING: Not connected to a Tello WiFi network!")
                print("Please connect your computer to the Tello's WiFi network.")
                print("The Tello's network name typically starts with 'TELLO-'")
                print("Falling back to simulation mode. Use --force to try connecting anyway.")
                print("Or use --direct-ip to specify a direct IP address.")
                simulation_mode = True
                tello = None
                raise Exception("Not connected to Tello WiFi network")
            
            if not simulation_mode:
                # Try direct socket connection first
                if direct_ip:
                    tello_ip = direct_ip
                else:
                    tello_ip = "192.168.10.1"  # Default Tello IP address
                
                if DEBUG:
                    print(f"Testing connection to Tello at {tello_ip}")
                
                socket_test = test_direct_connection(ip=tello_ip)
                if not socket_test and not force_real and direct_ip is None:
                    print(f"Could not establish socket connection to Tello at {tello_ip}")
                    print("Falling back to simulation mode. Use --force to try anyway.")
                    simulation_mode = True
                    tello = None
                    raise Exception(f"Cannot reach Tello at {tello_ip}")
                
                print("Attempting to connect to real Tello drone...")
                
                # Create Tello instance with custom IP if provided
                if direct_ip:
                    if DEBUG:
                        print(f"Using custom IP address: {direct_ip}")
                    tello = Tello(host=direct_ip)
                else:
                    tello = Tello()
                
                print("Sending connection command...")
                
                # Try to connect with different timeouts
                try:
                    if DEBUG:
                        print("Calling tello.connect() with default parameters")
                    
                    tello.connect(wait_for_state=False)
                    
                    if DEBUG:
                        print("Initial connection call completed")
                    
                    time.sleep(1)  # Give it a moment
                    
                    if DEBUG:
                        print("Testing battery command...")
                    
                    battery = tello.get_battery()
                    
                    print(f"Successfully connected to Tello drone!")
                    print(f"Battery Life Percentage: {battery}%")
                    
                    if webhook:
                        webhook.send_event("drone_connected", {
                            "battery": battery,
                            "ip": tello_ip if direct_ip else "192.168.10.1"
                        })
                        
                except Exception as detail_error:
                    if DEBUG:
                        print("Exception during connection:")
                        traceback.print_exc()
                    
                    print(f"Connection failed with error: {detail_error}")
                    if webhook:
                        webhook.send_event("connection_error", {
                            "error": str(detail_error)
                        })
                    raise Exception(f"Could not connect to Tello: {detail_error}")
        except Exception as e:
            if DEBUG:
                print("Exception during overall connection process:")
                traceback.print_exc()
            
            print(f"Failed to connect to real Tello drone: {e}")
            if not force_real:
                print("Falling back to simulation mode")
                simulation_mode = True
                tello = None
            else:
                print("Force real mode is enabled but connection failed. Exiting.")
                sys.exit(1)
    
    # Use simulator if in simulation mode or if real connection failed
    if simulation_mode:
        print("Using Tello simulator")
        tello = TelloSimulator()
        tello.connect()
        print(f"Battery Life Percentage: {tello.get_battery()}")
        if webhook:
            webhook.send_event("simulator_started", {
                "battery": tello.get_battery()
            })

    # Turn on video stream
    print("Starting video stream")
    tello.streamon()
    if webhook:
        webhook.send_event("video_stream_started", {})
    
    # Load face detection model with improved parameters for real-world use
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
    
    # Initialize DNN face detector if enabled
    dnn_face_detector = None
    if detection_method in [DETECT_METHOD_DNN, DETECT_METHOD_BOTH]:
        try:
            # Load face detection model files
            model_file = "models/opencv_face_detector_uint8.pb"
            config_file = "models/opencv_face_detector.pbtxt"
            
            # Create the model directory if it doesn't exist
            script_dir = os.path.dirname(os.path.abspath(__file__))
            model_dir = os.path.join(script_dir, "models")
            if not os.path.exists(model_dir):
                os.makedirs(model_dir)
                print(f"Created models directory at {model_dir}")
                print("You need to download the face detection model files:")
                print("- opencv_face_detector_uint8.pb")
                print("- opencv_face_detector.pbtxt")
                print("Place them in the models directory")
            
            # Check if model files exist
            model_path = os.path.join(script_dir, model_file)
            config_path = os.path.join(script_dir, config_file)
            
            if os.path.exists(model_path) and os.path.exists(config_path):
                # Load the DNN model
                dnn_face_detector = cv2.dnn.readNetFromTensorflow(model_path, config_path)
                print("DNN face detector loaded successfully")
            else:
                print("DNN model files not found. Falling back to cascade detector only.")
                detection_method = DETECT_METHOD_CASCADE
        except Exception as e:
            print(f"Failed to load DNN face detector: {e}")
            detection_method = DETECT_METHOD_CASCADE

    # Keep track of drone movement state
    tracking = True
    
    # Font settings for UI
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.6
    font_thickness = 2
    
    # Define button states
    button_states = {
        "flying": False,
        "tracking_enabled": True,
        "face_locked": False,
        "locked_face_features": None,
        "follow_mode": False,  # New state for follow mode
        "face_lost_time": None,  # Track when a locked face was last seen
        "lost_face_timeout": 5.0,  # Seconds before giving up on a lost face (increased from 3.0)
        "last_command_time": 0,  # Track when last command was sent
        "command_cooldown": command_cooldown,  # Minimum seconds between movement commands
        "consecutive_frame_failures": 0,  # Count consecutive frame failures
        "last_watchdog_time": time.time(),  # For watchdog functionality
        "ui_frame_rate": 0,  # Track UI frame rate
        "last_frame_time": time.time(),  # For calculating frame rate
        "target_person_name": "Person",  # Default name for tracked person
        "sound_feedback": AUDIO_ENABLED,  # Whether sound feedback is enabled
        "search_mode": False,  # Whether search mode is active
        "search_direction": 1,  # Search rotation direction (1 = clockwise, -1 = counter-clockwise)
        "last_search_time": 0,  # Last time a search movement was made
        "search_phase": 0,  # Current search phase (0 = initial rotation, 1 = wider rotation)
        "detection_method": detection_method,  # Face detection method
        "prev_face_positions": [],  # History of recent face positions for stabilization
        "face_angle": 0,  # Estimated face angle (head tilt)
        "face_tracking_history": [],  # Track face positions over time for better matching
        "last_detection_time": time.time()  # Time of last successful detection
    }
    
    # Function to update simulated battery in a separate thread
    def update_simulator_values():
        while tracking and simulation_mode:
            if isinstance(tello, TelloSimulator):
                # Random slight fluctuation in height to simulate hovering
                if button_states["flying"]:
                    tello.height += np.random.randint(-3, 4)
                    tello.height = max(50, min(200, tello.height))
                    # Slight temperature change
                    tello.temperature = 30 + np.random.random() * 5
                    tello.barometer = 150 + np.random.random() * 10
            time.sleep(1)
    
    # Watchdog thread to prevent hangs
    def watchdog_thread():
        while tracking:
            # Check if the main loop is still running
            if time.time() - button_states["last_watchdog_time"] > 3.0:
                print("WARNING: Watchdog detected main loop hang!")
                
                # If flying, log warning but don't land automatically
                if button_states["flying"] and not simulation_mode:
                    print("WARNING: Main loop hang detected while flying! Consider landing manually.")
                    play_sound("warning")
                    # Do not auto-land
            
            # Sleep for a bit between checks
            time.sleep(1)
    
    # Safe command wrapper for movement commands
    def safe_movement_command(command_func, *args, **kwargs):
        # Check if we're in cooldown period
        current_time = time.time()
        if current_time - button_states["last_command_time"] < button_states["command_cooldown"]:
            if DEBUG:
                print("Command ignored due to cooldown")
            return False
        
        # Try to send the command with timeout
        try:
            # Only add timeout for send_command_with_return, not movement commands
            if command_func.__name__ == 'send_command_with_return' and 'timeout' not in kwargs:
                kwargs['timeout'] = command_timeout
            result = command_func(*args, **kwargs)
            button_states["last_command_time"] = current_time
            
            # Send webhook for movement command
            if webhook:
                webhook.send_event("movement", {
                    "command": command_func.__name__,
                    "args": [str(arg) for arg in args],
                    "success": True
                })
                
            return result
        except Exception as e:
            print(f"Movement command failed: {e}")
            play_sound("error")  # Play error sound on command failure
            
            # Send webhook for failed movement
            if webhook:
                webhook.send_event("movement_error", {
                    "command": command_func.__name__,
                    "args": [str(arg) for arg in args],
                    "error": str(e)
                })
                
            return False
    
    # Start simulator update thread if in simulation mode
    if simulation_mode:
        sim_thread = threading.Thread(target=update_simulator_values)
        sim_thread.daemon = True
        sim_thread.start()
    
    # Start watchdog thread if not in simulation mode
    if not simulation_mode:
        watchdog = threading.Thread(target=watchdog_thread)
        watchdog.daemon = True
        watchdog.start()
    
    # Create window and set mouse callback
    window_name = "Tello Face Tracking"
    cv2.namedWindow(window_name)
    
    # Additional variable to track the last frame processing time
    last_successful_frame_time = time.time()
    
    try:
        while tracking:
            try:
                # Update watchdog timer
                button_states["last_watchdog_time"] = time.time()
                
                # Get frame from drone with timeout
                try:
                    frame = tello.get_frame_read().frame
                    # Reset counter on successful frame capture
                    button_states["consecutive_frame_failures"] = 0
                    last_successful_frame_time = time.time()
                except Exception as frame_error:
                    button_states["consecutive_frame_failures"] += 1
                    print(f"Frame capture error: {frame_error}")
                    
                    # If too many consecutive frame failures, take action
                    if button_states["consecutive_frame_failures"] >= MAX_CONSECUTIVE_FAILURES:
                        if button_states["flying"] and not simulation_mode:
                            print("WARNING: Too many frame failures detected! Video feed may be unreliable.")
                            print("Consider landing manually with 'l' key or LAND button if control is compromised.")
                            play_sound("warning")
                            # No automatic landing
                        
                        # Create blank frame if we can't get a real one
                        if 'frame' not in locals() or frame is None:
                            if 'frame' in locals() and frame is not None:
                                # Keep same dimensions if we had a previous frame
                                frame = np.zeros_like(frame)
                            else:
                                # Default size if we never got a frame
                                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                                
                            # Add error message to frame
                            cv2.putText(frame, "VIDEO ERROR - CHECK CONNECTION", 
                                      (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                # Calculate UI frame rate
                current_time = time.time()
                frame_time_diff = current_time - button_states["last_frame_time"]
                button_states["last_frame_time"] = current_time
                if frame_time_diff > 0:
                    button_states["ui_frame_rate"] = 1.0 / frame_time_diff
                
                # Check if frame capture is too slow (possible hang indicator)
                if current_time - last_successful_frame_time > 1.0 and not simulation_mode:
                    print(f"WARNING: Slow frame capture ({current_time - last_successful_frame_time:.1f}s since last frame)")
                    if webhook:
                        webhook.send_event("slow_frame_capture", {
                            "time_since_last_frame": current_time - last_successful_frame_time
                        })
                
                # Get telemetry data with error handling
                try:
                    battery = tello.get_battery()
                    height = tello.get_height()
                    temp = tello.get_temperature()
                    barometer = tello.get_barometer()
                    flight_time = tello.get_flight_time()
                    
                    # Send periodic telemetry updates (throttled to every 5 seconds)
                    if webhook and int(time.time()) % 5 == 0:
                        webhook.send_event("telemetry", {
                            "battery": battery,
                            "height": height,
                            "temperature": temp,
                            "barometer": barometer,
                            "flight_time": flight_time
                        })
                        
                    # Send low battery warning
                    if webhook and battery < 20 and battery > 0 and int(time.time()) % 30 == 0:
                        webhook.send_event("low_battery", {
                            "level": battery,
                            "flight_time": flight_time
                        })
                        
                except Exception as telem_error:
                    print(f"Telemetry error: {telem_error}")
                    if webhook:
                        webhook.send_event("telemetry_error", {
                            "error": str(telem_error)
                        })
                
                # Create a status bar at the top
                status_bar_height = 60  # Reduced from 80
                status_bar = np.zeros((status_bar_height, frame.shape[1], 3), dtype=np.uint8)
                
                # Add battery info with color based on level
                battery_color = (0, 255, 0)  # Green
                if battery < 30:
                    battery_color = (0, 0, 255)  # Red
                elif battery < 50:
                    battery_color = (0, 165, 255)  # Orange
                
                # Adjust font scale for more compact text
                status_font_scale = 0.5  # Smaller font for status bar
                button_font_scale = 0.5  # Smaller font for buttons
                control_font_scale = 0.45  # Even smaller font for control instructions
                
                # Rearrange status bar elements for better use of space
                cv2.putText(status_bar, f"BAT:{battery}%", (10, 20), font, status_font_scale, battery_color, font_thickness)
                cv2.putText(status_bar, f"H:{height}cm", (10, 40), font, status_font_scale, (255, 255, 255), font_thickness)
                cv2.putText(status_bar, f"T:{temp}°C", (120, 20), font, status_font_scale, (255, 255, 255), font_thickness)
                cv2.putText(status_bar, f"B:{barometer:.1f}", (120, 40), font, status_font_scale, (255, 255, 255), font_thickness)
                cv2.putText(status_bar, f"FT:{flight_time}s", (230, 20), font, status_font_scale, (255, 255, 255), font_thickness)
                
                # Show simulation mode indicator (more compact)
                if simulation_mode:
                    cv2.putText(status_bar, "SIM MODE", (230, 40), font, status_font_scale, (0, 165, 255), font_thickness)
                
                # Tracking status (more compact)
                tracking_status = "TRACK:ON" if button_states["tracking_enabled"] else "TRACK:OFF"
                tracking_color = (0, 255, 0) if button_states["tracking_enabled"] else (0, 0, 255)
                cv2.putText(status_bar, tracking_status, (350, 20), font, status_font_scale, tracking_color, font_thickness)
                
                # Face lock status (more compact)
                face_lock_status = "FACE:LOCK" if button_states["face_locked"] else "FACE:UNLOCK"
                face_lock_color = (0, 165, 255) if button_states["face_locked"] else (255, 255, 255)
                cv2.putText(status_bar, face_lock_status, (350, 40), font, status_font_scale, face_lock_color, font_thickness)
                
                # Add follow mode status (more compact)
                follow_status = "FOLLOW:ON" if button_states["follow_mode"] else "FOLLOW:OFF"
                follow_color = (0, 255, 0) if button_states["follow_mode"] else (255, 255, 255)
                cv2.putText(status_bar, follow_status, (480, 20), font, status_font_scale, follow_color, font_thickness)
                
                # Flight status (more compact)
                flight_status = "FLY" if button_states["flying"] else "LAND"
                flight_color = (0, 165, 255) if button_states["flying"] else (255, 255, 255)
                cv2.putText(status_bar, flight_status, (480, 40), font, status_font_scale, flight_color, font_thickness)
                
                # Show sound status (more compact)
                sound_status = "SOUND:ON" if button_states["sound_feedback"] else "SOUND:OFF"
                sound_color = (0, 255, 0) if button_states["sound_feedback"] else (0, 0, 255)
                cv2.putText(status_bar, sound_status, (580, 20), font, status_font_scale, sound_color, font_thickness)
                
                # Process image for face detection
                GRAY = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # Apply histogram equalization to improve detection in varied lighting
                GRAY = cv2.equalizeHist(GRAY)
                
                # Variables for face detection results
                all_faces = []
                
                # Method 1: Haar Cascade detection (fast but less robust to tilted faces)
                if button_states["detection_method"] in [DETECT_METHOD_CASCADE, DETECT_METHOD_BOTH]:
                    # Detect frontal faces with optimized parameters
                    frontal_faces = face_cascade.detectMultiScale(
                        GRAY, 
                        scaleFactor=1.2, 
                        minNeighbors=6, 
                        minSize=(30, 30), 
                        flags=cv2.CASCADE_SCALE_IMAGE
                    )
                    
                    # Also detect profile faces for better handling of side views
                    profile_faces = profile_cascade.detectMultiScale(
                        GRAY, 
                        scaleFactor=1.2, 
                        minNeighbors=6, 
                        minSize=(30, 30), 
                        flags=cv2.CASCADE_SCALE_IMAGE
                    )
                    
                    # Try mirrored image for profiles facing the other direction
                    flipped = cv2.flip(GRAY, 1)
                    profile_faces_flipped = profile_cascade.detectMultiScale(
                        flipped, 
                        scaleFactor=1.2, 
                        minNeighbors=6, 
                        minSize=(30, 30), 
                        flags=cv2.CASCADE_SCALE_IMAGE
                    )
                    
                    # Convert flipped coordinates back to original image
                    for (x, y, w, h) in profile_faces_flipped:
                        profile_faces = np.append(profile_faces, [[frame.shape[1] - x - w, y, w, h]], axis=0) if len(profile_faces) > 0 else np.array([[frame.shape[1] - x - w, y, w, h]])
                    
                    # Add the cascade detections to the result list
                    for (x, y, w, h) in frontal_faces:
                        all_faces.append((x, y, w, h, 0.9))  # Add confidence of 0.9 for frontal faces
                    
                    for (x, y, w, h) in profile_faces:
                        all_faces.append((x, y, w, h, 0.8))  # Add confidence of 0.8 for profile faces
                
                # Method 2: DNN-based detection (more robust to tilted faces but slower)
                if dnn_face_detector is not None and button_states["detection_method"] in [DETECT_METHOD_DNN, DETECT_METHOD_BOTH]:
                    # Prepare image for deep neural network
                    blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300), [104, 117, 123], False, False)
                    dnn_face_detector.setInput(blob)
                    detections = dnn_face_detector.forward()
                    
                    # Process DNN detections
                    for i in range(detections.shape[2]):
                        confidence = detections[0, 0, i, 2]
                        if confidence > FACE_DNN_CONFIDENCE:
                            # Get coordinates and convert to image scale
                            x1 = int(detections[0, 0, i, 3] * frame.shape[1])
                            y1 = int(detections[0, 0, i, 4] * frame.shape[1])
                            x2 = int(detections[0, 0, i, 5] * frame.shape[1])
                            y2 = int(detections[0, 0, i, 6] * frame.shape[1])
                            
                            # Ensure coordinates are within frame bounds
                            x1 = max(0, min(x1, frame.shape[1]))
                            y1 = max(0, min(y1, frame.shape[0]))
                            x2 = max(0, min(x2, frame.shape[1]))
                            y2 = max(0, min(y2, frame.shape[0]))
                            
                            # Convert to (x, y, w, h) format
                            x, y, w, h = x1, y1, x2 - x1, y2 - y1
                            
                            # Only add valid detections with reasonable size
                            if w > 20 and h > 20:
                                all_faces.append((x, y, w, h, confidence))
                
                # Remove duplicate detections (merge overlapping faces)
                filtered_faces = []
                
                # Sort by confidence (highest first)
                all_faces.sort(key=lambda f: f[4], reverse=True)
                
                # Filter out overlapping detections
                for face in all_faces:
                    x1, y1, w1, h1, conf1 = face
                    is_duplicate = False
                    
                    for existing_face in filtered_faces:
                        x2, y2, w2, h2, conf2 = existing_face
                        
                        # Calculate overlap
                        overlap_x = max(0, min(x1 + w1, x2 + w2) - max(x1, x2))
                        overlap_y = max(0, min(y1 + h1, y2 + h2) - max(y1, y2))
                        overlap_area = overlap_x * overlap_y
                        face1_area = w1 * h1
                        face2_area = w2 * h2
                        
                        # If overlap is significant, consider as duplicate
                        if overlap_area > 0.5 * min(face1_area, face2_area):
                            is_duplicate = True
                            break
                    
                    if not is_duplicate:
                        filtered_faces.append(face)
                
                # Use the filtered faces instead of the direct detection result
                faces = [(int(x), int(y), int(w), int(h)) for x, y, w, h, _ in filtered_faces]
                
                # Variables for face selection
                best_face = None
                best_face_score = 0
                locked_face = None
                
                # Update face tracking history
                if len(faces) > 0:
                    button_states["last_detection_time"] = time.time()
                
                # Draw rectangles around detected faces
                frame_center_x = frame.shape[1] // 2
                frame_center_y = frame.shape[0] // 2
                face_detected = False
                
                # Process all detected faces
                for (x, y, w, h) in faces:
                    face_detected = True
                    face_area = w * h
                    face_center_x = x + w // 2
                    face_center_y = y + h // 2
                    
                    # Calculate distance from center
                    diff_x = face_center_x - frame_center_x
                    diff_y = frame_center_y - face_center_y
                    
                    # Find the largest face or closest to center if we're not locked
                    if not button_states["face_locked"]:
                        # Prefer faces closer to center
                        center_distance = diff_x**2 + diff_y**2
                        
                        # Choose based on combination of size and center proximity
                        face_score = face_area - (center_distance / 1000)
                        
                        if best_face is None or face_score > best_face_score:
                            best_face = (x, y, w, h, face_center_x, face_center_y, diff_x, diff_y)
                            best_face_score = face_score
                    # If we're locked, try to find the face that matches our locked features
                    elif button_states["locked_face_features"] is not None:
                        lx, ly, lw, lh = button_states["locked_face_features"]
                        
                        # Enhanced matching based on position, size, ratio and history
                        position_diff = abs(x - lx) + abs(y - ly)
                        size_diff = abs(w - lw) + abs(h - lh)
                        
                        # Calculate aspect ratio with safeguards for division by zero
                        aspect_ratio = w / max(1, h)
                        locked_aspect_ratio = lw / max(1, lh)
                        ratio_diff = abs(aspect_ratio - locked_aspect_ratio)
                        
                        # Track position relative to previous frame
                        if len(button_states["face_tracking_history"]) > 0:
                            prev_x, prev_y, prev_w, prev_h = button_states["face_tracking_history"][-1]
                            # Expected position based on movement trend
                            expected_x = prev_x + (prev_x - lx)
                            expected_y = prev_y + (prev_y - ly)
                            # Difference from expected position
                            trend_diff = abs(x - expected_x) + abs(y - expected_y)
                        else:
                            trend_diff = 0
                        
                        # Weight different factors
                        position_weight = 1.0
                        size_weight = 2.0
                        ratio_weight = 50.0
                        trend_weight = 0.5
                        
                        # Calculate overall similarity score (lower is better)
                        similarity_score = (position_diff * position_weight) + \
                                           (size_diff * size_weight) + \
                                           (ratio_diff * ratio_weight) - \
                                           (trend_diff * trend_weight)
                        
                        # Adjust threshold based on time since lock - more lenient as time passes
                        if button_states["face_lost_time"] is not None:
                            time_since_lost = time.time() - button_states["face_lost_time"]
                            # Gradually increase threshold (be more lenient) as time passes
                            threshold = 150 + min(200, time_since_lost * 20)
                        else:
                            threshold = 150
                        
                        # If this face is close to our locked face characteristics
                        if similarity_score < threshold:  # Adjusted threshold
                            locked_face = (x, y, w, h, face_center_x, face_center_y, diff_x, diff_y)
                            # Update locked face features to track movement
                            button_states["locked_face_features"] = (x, y, w, h)
                            # Add to tracking history (keep last 5 positions)
                            button_states["face_tracking_history"].append((x, y, w, h))
                            if len(button_states["face_tracking_history"]) > 5:
                                button_states["face_tracking_history"] = button_states["face_tracking_history"][-5:]
                            # Reset lost face timer
                            button_states["face_lost_time"] = None
                            # Disable search mode if face is found
                            if button_states["search_mode"]:
                                button_states["search_mode"] = False
                                button_states["search_phase"] = 0
                                print(f"Found {button_states['target_person_name']} - resuming tracking")
                                play_sound("lock")
                            break
                
                # Check if we've lost track of the locked face
                if button_states["face_locked"] and locked_face is None:
                    # Start timing how long we've lost the face
                    if button_states["face_lost_time"] is None:
                        button_states["face_lost_time"] = time.time()
                        play_sound("warning")
                        # If person was being followed, start search mode
                        if button_states["follow_mode"]:
                            button_states["search_mode"] = True
                            button_states["search_direction"] = 1  # Start searching clockwise
                            button_states["last_search_time"] = time.time()
                            button_states["search_phase"] = 0
                            print(f"Lost {button_states['target_person_name']} - starting search")
                            
                            if webhook:
                                webhook.send_event("face_lost", {
                                    "person_name": button_states["target_person_name"],
                                    "search_mode": True,
                                    "time_visible": time.time() - (button_states["face_lost_time"] or time.time())
                                }, frame)
                                
                    # If we've been in search mode for too long without success, try the other direction
                    elif button_states["search_mode"] and time.time() - button_states["face_lost_time"] > button_states["lost_face_timeout"] * 0.5:
                        if button_states["search_phase"] == 0:
                            # Move to phase 1 - switch direction and continue searching
                            button_states["search_direction"] *= -1
                            button_states["search_phase"] = 1
                            print("Switching search direction")
                            
                            if webhook:
                                webhook.send_event("search_phase_changed", {
                                    "phase": 1,
                                    "direction": "counter-clockwise" if button_states["search_direction"] < 0 else "clockwise",
                                    "time_searching": time.time() - button_states["face_lost_time"]
                                })
                                
                    elif time.time() - button_states["face_lost_time"] > button_states["lost_face_timeout"] * 2:  # Much longer timeout before giving up completely
                        # We've lost the face for too long, release the lock only if not in follow mode
                        if not button_states["follow_mode"]:
                            print("Face lost for too long, releasing lock")
                            button_states["face_locked"] = False
                            button_states["locked_face_features"] = None
                            button_states["follow_mode"] = False
                            button_states["face_lost_time"] = None
                            button_states["search_mode"] = False
                            play_sound("alert")
                            
                            if webhook:
                                webhook.send_event("face_lock_released", {
                                    "reason": "lost_for_too_long",
                                    "time_searching": time.time() - button_states["face_lost_time"]
                                })
                                
                elif button_states["face_locked"] and locked_face is not None:
                    # Reset lost face timer if we have the face
                    if button_states["face_lost_time"] is not None:
                        time_lost = time.time() - button_states["face_lost_time"]
                        button_states["face_lost_time"] = None
                        # Also exit search mode if active
                        if button_states["search_mode"]:
                            button_states["search_mode"] = False
                            button_states["search_phase"] = 0
                            
                            if webhook:
                                webhook.send_event("face_found", {
                                    "person_name": button_states["target_person_name"],
                                    "time_lost": time_lost
                                }, frame)
                
                # Determine which face to track
                target_face = None
                if button_states["face_locked"] and locked_face is not None:
                    target_face = locked_face
                    face_color = (0, 165, 255)  # Orange for locked face
                elif not button_states["face_locked"] and best_face is not None:
                    target_face = best_face
                    face_color = (255, 0, 0)  # Blue for normal tracking
                
                # Draw and track the selected face
                if target_face is not None:
                    x, y, w, h, face_center_x, face_center_y, diff_x, diff_y = target_face
                    
                    # Draw rectangle around face
                    cv2.rectangle(frame, (x, y), (x+w, y+h), face_color, 2)
                    
                    # Estimate face angle/tilt based on aspect ratio compared to expected
                    expected_ratio = 0.8  # Typical face width/height ratio
                    current_ratio = w / max(1, h)
                    tilt_factor = current_ratio / expected_ratio
                    
                    # Store estimated tilt for use in tracking
                    button_states["face_angle"] = (tilt_factor - 1.0) * 45  # Rough estimate of tilt angle
                    
                    # Draw angle indicator if significantly tilted
                    if abs(button_states["face_angle"]) > 10:
                        tilt_text = f"Tilt: {int(button_states['face_angle'])}°"
                        cv2.putText(frame, tilt_text, (x, y+h+20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, face_color, 2)
                    
                    # Add confidence to tracking in UI if using DNN
                    if dnn_face_detector is not None and button_states["detection_method"] in [DETECT_METHOD_DNN, DETECT_METHOD_BOTH]:
                        # Find confidence for this face if it's in the filtered_faces list
                        confidence = 0.0
                        for fx, fy, fw, fh, conf in filtered_faces:
                            if fx == x and fy == y and fw == w and fh == h:
                                confidence = conf
                                break
                        
                        if confidence > 0:
                            conf_text = f"Conf: {confidence:.2f}"
                            cv2.putText(frame, conf_text, (x, y+h+40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, face_color, 2)
                    
                    # Show target label
                    if button_states["follow_mode"] and button_states["face_locked"]:
                        if button_states["search_mode"]:
                            face_label = f"SEARCHING FOR {button_states['target_person_name']}"
                        else:
                            face_label = f"FOLLOWING {button_states['target_person_name']}"
                    elif button_states["face_locked"]:
                        face_label = f"LOCKED: {button_states['target_person_name']}"
                    else:
                        face_label = "TARGET"
                    
                    cv2.putText(frame, face_label, (x, y-10), font, 0.7, face_color, 2)
                    
                    # Draw crosshair on face
                    cv2.line(frame, (face_center_x - 20, face_center_y), (face_center_x + 20, face_center_y), face_color, 2)
                    cv2.line(frame, (face_center_x, face_center_y - 20), (face_center_x, face_center_y + 20), face_color, 2)
                    
                    # Only move if tracking is enabled and drone is flying
                    if button_states["tracking_enabled"] and button_states["flying"]:
                        # First, check if we're in search mode - this takes priority
                        if button_states["search_mode"] and button_states["face_locked"]:
                            # Only execute search movements at intervals to avoid overwhelming the drone
                            current_time = time.time()
                            if current_time - button_states["last_search_time"] > 0.5:  # Search movements every 0.5 seconds
                                # Execute search pattern
                                search_rotation = 20 if button_states["search_phase"] == 0 else 30  # Wider rotation in phase 1
                                if button_states["search_direction"] > 0:
                                    print(f"Searching for {button_states['target_person_name']} - rotating clockwise")
                                    safe_movement_command(tello.rotate_clockwise, search_rotation)
                                else:
                                    print(f"Searching for {button_states['target_person_name']} - rotating counter-clockwise")
                                    safe_movement_command(tello.rotate_counter_clockwise, search_rotation)
                                button_states["last_search_time"] = current_time
                        # If follow mode is enabled, actively follow the locked face
                        elif button_states["follow_mode"] and button_states["face_locked"] and not button_states["search_mode"]:
                            # Horizontal position correction (keep face centered)
                            if abs(diff_x) > 40:  # Lower threshold for more responsive movements (was 50)
                                # Apply smoothness factor to rotation amount
                                rotation_amount = min(15, max(8, int(abs(diff_x) // (10 * smoothness))))
                                if diff_x > 0:
                                    print(f"Following: Face right - rotate clockwise {rotation_amount}°")
                                    safe_movement_command(tello.rotate_clockwise, rotation_amount)
                                else:
                                    print(f"Following: Face left - rotate counter-clockwise {rotation_amount}°")
                                    safe_movement_command(tello.rotate_counter_clockwise, rotation_amount)
                            
                            # Vertical position correction (keep face at eye level)
                            if abs(diff_y) > 40:  # Lower threshold (was 50)
                                # Apply smoothness factor to movement amount
                                move_amount = min(25, max(10, int(abs(diff_y) // (5 * smoothness))))
                                if diff_y > 0:
                                    print(f"Following: Face below - move down {move_amount}cm")
                                    safe_movement_command(tello.move_down, move_amount)
                                else:
                                    print(f"Following: Face above - move up {move_amount}cm")
                                    safe_movement_command(tello.move_up, move_amount)
                            
                            # Distance correction (maintain ideal distance) - ADJUSTED FOR CLOSER FOLLOWING
                            face_area = w * h
                            ideal_area = 25000  # Target face area (increased from 15000 for closer following)
                            area_tolerance = 3000  # Tolerance range
                            
                            # Only adjust distance if face significantly deviates from ideal size
                            if face_area > ideal_area + area_tolerance:  # Face too close
                                # Apply smoothness factor to movement amount
                                move_back = min(40, max(20, int((face_area - ideal_area) // (1000 * smoothness))))
                                print(f"Following: Face too close - move back {move_back}cm")
                                safe_movement_command(tello.move_back, move_back)
                            elif face_area < ideal_area - area_tolerance:  # Face too far
                                # Apply smoothness factor to movement amount
                                move_forward = min(40, max(20, int((ideal_area - face_area) // (500 * smoothness))))
                                print(f"Following: Face too far - move forward {move_forward}cm")
                                safe_movement_command(tello.move_forward, move_forward)
                        
                        # Standard tracking (only when not in follow mode or search mode)
                        elif not button_states["follow_mode"] and not button_states["search_mode"]:
                            # Original tracking logic
                            if abs(diff_x) > 70:
                                if diff_x > 0:
                                    print("Face right - rotate clockwise")
                                    safe_movement_command(tello.rotate_clockwise, 15)
                                else:
                                    print("Face left - rotate counter-clockwise")
                                    safe_movement_command(tello.rotate_counter_clockwise, 15)
                            
                            if abs(diff_y) > 70:
                                if diff_y > 0:
                                    print("Face below - move down")
                                    safe_movement_command(tello.move_down, 20)
                                else:
                                    print("Face above - move up")
                                    safe_movement_command(tello.move_up, 20)
                            
                            # Adjust distance if face is too large or too small - ALSO ADJUSTED FOR STANDARD TRACKING
                            if w * h > 30000:  # Face too close (increased from 25000)
                                print("Face too close - move back")
                                safe_movement_command(tello.move_back, 30)
                            elif w * h < 12000 and face_detected:  # Face too far (increased from 9000)
                                print("Face too far - move forward")
                                safe_movement_command(tello.move_forward, 30)
                
                # Draw center crosshair on frame
                cv2.line(frame, (frame_center_x - 20, frame_center_y), (frame_center_x + 20, frame_center_y), (0, 255, 255), 1)
                cv2.line(frame, (frame_center_x, frame_center_y - 20), (frame_center_x, frame_center_y + 20), (0, 255, 255), 1)
                
                # Combine status bar and frame
                display = np.vstack((status_bar, frame))
                
                # Create button bar
                button_bar_height = 40  # Reduced from 60
                button_bar = np.zeros((button_bar_height, frame.shape[1], 3), dtype=np.uint8)
                
                # Define buttons with smaller dimensions
                buttons = [
                    ("TAKEOFF", 10, 15, 90, 35, (0, 255, 0) if not button_states["flying"] else (100, 100, 100), "takeoff"),
                    ("LAND", 100, 15, 180, 35, (0, 165, 255) if button_states["flying"] else (100, 100, 100), "land"),
                    ("EMERGENCY", 190, 15, 270, 35, (0, 0, 255), "emergency"),
                    ("TRACK:" + ("ON" if button_states["tracking_enabled"] else "OFF"), 
                     280, 15, 360, 35, 
                     (0, 255, 0) if button_states["tracking_enabled"] else (0, 0, 255), 
                     "toggle_tracking"),
                    ("LOCK FACE:" + ("ON" if button_states["face_locked"] else "OFF"),
                     370, 15, 450, 35,
                     (0, 165, 255) if button_states["face_locked"] else (255, 255, 255),
                     "toggle_face_lock"),
                    ("FOLLOW:" + ("ON" if button_states["follow_mode"] else "OFF"),
                     460, 15, 540, 35,
                     (0, 255, 0) if button_states["follow_mode"] else (100, 100, 100),
                     "toggle_follow")
                ]
                
                # Draw buttons with smaller font
                for text, x1, y1, x2, y2, color, action in buttons:
                    cv2.rectangle(button_bar, (x1, y1), (x2, y2), color, -1)
                    cv2.rectangle(button_bar, (x1, y1), (x2, y2), (255, 255, 255), 1)  # Thinner border
                    
                    # Calculate text position for centering
                    text_size = cv2.getTextSize(text, font, button_font_scale, 1)[0]  # Thinner text
                    text_x = x1 + (x2 - x1 - text_size[0]) // 2
                    text_y = y1 + (y2 - y1 + text_size[1]) // 2
                    
                    cv2.putText(button_bar, text, (text_x, text_y), font, button_font_scale, (255, 255, 255), 1)  # Thinner text
                
                # Add updated keyboard control instructions
                control_bar_height = 30  # Reduced from 50
                control_bar = np.zeros((control_bar_height, frame.shape[1], 3), dtype=np.uint8)
                
                # Split controls into two rows with smaller font
                cv2.putText(control_bar, "0:Takeoff | L:Land | E:Emergency | T:Toggle Track | F:Lock Face | G:Follow | N:Name | M:Sound | Q:Quit", 
                           (10, 12), font, control_font_scale, (255, 255, 255), 1)  # Thinner text
                cv2.putText(control_bar, "Controls: W/S:Up/Down | A/D:Rotate | R/V:Fwd/Back | Z/X:Left/Right | P:Hover | 1:Cascade | 2:DNN | 3:Both", 
                           (10, 24), font, control_font_scale, (255, 255, 255), 1)  # Thinner text
                
                # Show smoothness setting
                if not simulation_mode and button_states["follow_mode"]:
                    cv2.putText(control_bar, f"Smooth:{smoothness:.1f}", (550, 12), font, control_font_scale, 
                               (0, 255, 0) if smoothness <= 1.0 else (0, 165, 255), 1)  # Thinner text
                
                # Update the FPS counter to be more compact
                if not simulation_mode:
                    fps_text = f"FPS:{button_states['ui_frame_rate']:.1f}"
                    fps_color = (0, 255, 0) if button_states['ui_frame_rate'] > 15 else (0, 165, 255) if button_states['ui_frame_rate'] > 5 else (0, 0, 255)
                    cv2.putText(control_bar, fps_text, (550, 24), font, control_font_scale, fps_color, 1)  # Thinner text
                
                # Combine all elements
                display = np.vstack((display, button_bar, control_bar))
                
                # Update mouse callback with current buttons
                cv2.setMouseCallback(window_name, handle_button_click, (tello, buttons, button_states))
                
                # Show the frame
                cv2.imshow(window_name, display)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xff
                if key == ord('q'):  # Press 'q' to quit
                    tracking = False
                    if webhook:
                        webhook.send_event("program_quit", {
                            "reason": "user_keypress",
                            "key": "q"
                        })
                elif key == ord('t'):  # Toggle tracking
                    new_state = not button_states["tracking_enabled"]
                    button_states["tracking_enabled"] = new_state
                    print(f"Tracking {'enabled' if new_state else 'disabled'}")
                    
                    if webhook:
                        webhook.send_event("tracking_toggled", {
                            "enabled": new_state
                        })
                elif key == ord('0'):  # Press '0' to takeoff
                    if not button_states["flying"]:
                        print("Taking off!")
                        tello.takeoff()
                        button_states["flying"] = True
                        play_sound("takeoff")
                        
                        if webhook:
                            webhook.send_event("takeoff", {
                                "battery": tello.get_battery(),
                                "height": tello.get_height()
                            }, frame)
                elif key == ord('l'):  # Press 'l' to land
                    if button_states["flying"]:
                        print("Landing!")
                        tello.land()
                        button_states["flying"] = False
                        play_sound("land")
                        
                        if webhook:
                            webhook.send_event("land", {
                                "flight_time": tello.get_flight_time(),
                                "battery": tello.get_battery()
                            }, frame)
                elif key == ord('e'):  # Press 'e' for emergency stop
                    print("EMERGENCY STOP!")
                    tello.emergency()
                    button_states["flying"] = False
                    play_sound("error")
                    
                    if webhook:
                        webhook.send_event("emergency_stop", {
                            "reason": "user_keypress"
                        }, frame)
                elif key == ord('f'):  # Press 'f' to lock/unlock face
                    if target_face is not None and not button_states["face_locked"]:
                        button_states["face_locked"] = True
                        button_states["locked_face_features"] = (x, y, w, h)
                        # Ask for person name using a text input dialog
                        if not simulation_mode:
                            name_window = "Enter Person's Name"
                            cv2.namedWindow(name_window)
                            # Create a blank image for text input
                            input_img = np.zeros((100, 400, 3), dtype=np.uint8)
                            cv2.putText(input_img, "Enter name (press Enter when done)", (10, 30), font, 0.7, (255, 255, 255), 2)
                            cv2.putText(input_img, "Current: " + button_states["target_person_name"], (10, 70), font, 0.7, (255, 255, 255), 2)
                            cv2.imshow(name_window, input_img)
                            
                            # Wait for key presses to build the name
                            name_input = ""
                            while True:
                                key_press = cv2.waitKey(0) & 0xFF
                                if key_press == 13:  # Enter key
                                    break
                                elif key_press == 8:  # Backspace
                                    name_input = name_input[:-1]
                                elif 32 <= key_press <= 126:  # Printable ASCII characters
                                    name_input += chr(key_press)
                                
                                # Update display
                                input_img = np.zeros((100, 400, 3), dtype=np.uint8)
                                cv2.putText(input_img, "Enter name (press Enter when done)", (10, 30), font, 0.7, (255, 255, 255), 2)
                                cv2.putText(input_img, "Current: " + name_input, (10, 70), font, 0.7, (255, 255, 255), 2)
                                cv2.imshow(name_window, input_img)
                            
                            if name_input:
                                button_states["target_person_name"] = name_input
                                
                            cv2.destroyWindow(name_window)
                        
                        print(f"Face locked! Tracking {button_states['target_person_name']}")
                        play_sound("lock")
                        
                        if webhook:
                            webhook.send_event("face_locked", {
                                "person_name": button_states["target_person_name"],
                                "face_position": {
                                    "x": x, "y": y, "width": w, "height": h
                                }
                            }, frame)
                    else:
                        old_state = button_states["face_locked"]
                        button_states["face_locked"] = False
                        button_states["locked_face_features"] = None
                        # Disable follow mode if face lock is disabled
                        button_states["follow_mode"] = False
                        print("Face lock released!")
                        play_sound("unlock")
                        
                        if webhook and old_state:
                            webhook.send_event("face_unlocked", {
                                "reason": "user_keypress"
                            }, frame)
                elif key == ord('g'):  # Press 'g' to toggle follow mode
                    # Can only enable follow mode if face is locked
                    old_follow = button_states["follow_mode"]
                    
                    if button_states["face_locked"] or not button_states["follow_mode"]:
                        button_states["follow_mode"] = not button_states["follow_mode"]
                        if button_states["follow_mode"]:
                            if not button_states["face_locked"]:
                                # Auto-enable face lock when follow mode is turned on
                                button_states["face_locked"] = True
                            print(f"Follow mode enabled for {button_states['target_person_name']}")
                            play_sound("follow")
                            
                            if webhook:
                                webhook.send_event("follow_mode_enabled", {
                                    "person_name": button_states["target_person_name"]
                                })
                        else:
                            print("Follow mode disabled")
                            play_sound("stop_follow")
                            
                            if webhook and old_follow:
                                webhook.send_event("follow_mode_disabled", {
                                    "reason": "user_keypress"
                                })
                elif key == ord('n'):  # Press 'n' to change name of tracked person
                    if button_states["face_locked"]:
                        # Ask for person name using a text input dialog
                        name_window = "Change Person's Name"
                        cv2.namedWindow(name_window)
                        # Create a blank image for text input
                        input_img = np.zeros((100, 400, 3), dtype=np.uint8)
                        cv2.putText(input_img, "Enter name (press Enter when done)", (10, 30), font, 0.7, (255, 255, 255), 2)
                        cv2.putText(input_img, "Current: " + button_states["target_person_name"], (10, 70), font, 0.7, (255, 255, 255), 2)
                        cv2.imshow(name_window, input_img)
                        
                        # Wait for key presses to build the name
                        name_input = ""
                        while True:
                            key_press = cv2.waitKey(0) & 0xFF
                            if key_press == 13:  # Enter key
                                break
                            elif key_press == 8:  # Backspace
                                name_input = name_input[:-1]
                            elif 32 <= key_press <= 126:  # Printable ASCII characters
                                name_input += chr(key_press)
                            
                            # Update display
                            input_img = np.zeros((100, 400, 3), dtype=np.uint8)
                            cv2.putText(input_img, "Enter name (press Enter when done)", (10, 30), font, 0.7, (255, 255, 255), 2)
                            cv2.putText(input_img, "Current: " + name_input, (10, 70), font, 0.7, (255, 255, 255), 2)
                            cv2.imshow(name_window, input_img)
                        
                        if name_input:
                            button_states["target_person_name"] = name_input
                            print(f"Now tracking: {button_states['target_person_name']}")
                            
                            if webhook:
                                webhook.send_event("person_renamed", {
                                    "old_name": button_states["target_person_name"],
                                    "new_name": name_input
                                })
                        
                        cv2.destroyWindow(name_window)
                elif key == ord('m'):  # Press 'm' to toggle audio feedback
                    old_audio = button_states["sound_feedback"]
                    button_states["sound_feedback"] = not button_states["sound_feedback"]
                    AUDIO_ENABLED = button_states["sound_feedback"]
                    print(f"Sound feedback {'enabled' if AUDIO_ENABLED else 'disabled'}")
                    
                    if webhook and old_audio != button_states["sound_feedback"]:
                        webhook.send_event("audio_feedback_toggled", {
                            "enabled": AUDIO_ENABLED
                        })
                elif key == ord('p'):  # Emergency hover (stop all movement)
                    print("HOVER: Stopping all movement")
                    try:
                        # Send SDK command to hover using the proper method
                        tello.send_command_without_return("stop")
                        play_sound("hover")
                        
                        if webhook:
                            webhook.send_event("hover", {
                                "reason": "user_keypress"
                            })
                    except Exception as e:
                        print(f"Hover command failed: {e}")
                        play_sound("error")
                        
                        if webhook:
                            webhook.send_event("hover_error", {
                                "error": str(e)
                            })
                elif key == ord('1'):  # Switch to cascade detection only
                    old_method = button_states["detection_method"]
                    button_states["detection_method"] = DETECT_METHOD_CASCADE
                    print("Switched to Haar Cascade face detection (faster)")
                    
                    if webhook and old_method != DETECT_METHOD_CASCADE:
                        webhook.send_event("detection_method_changed", {
                            "method": "cascade",
                            "method_id": DETECT_METHOD_CASCADE
                        })
                elif key == ord('2'):  # Switch to DNN detection only
                    if dnn_face_detector is not None:
                        old_method = button_states["detection_method"]
                        button_states["detection_method"] = DETECT_METHOD_DNN
                        print("Switched to DNN face detection (better for tilted faces)")
                        
                        if webhook and old_method != DETECT_METHOD_DNN:
                            webhook.send_event("detection_method_changed", {
                                "method": "dnn",
                                "method_id": DETECT_METHOD_DNN
                            })
                    else:
                        print("DNN detector not available - needs model files")
                        
                        if webhook:
                            webhook.send_event("detection_method_error", {
                                "error": "DNN model files not available"
                            })
                elif key == ord('3'):  # Switch to combined detection
                    if dnn_face_detector is not None:
                        old_method = button_states["detection_method"]
                        button_states["detection_method"] = DETECT_METHOD_BOTH
                        print("Switched to combined face detection (most robust)")
                        
                        if webhook and old_method != DETECT_METHOD_BOTH:
                            webhook.send_event("detection_method_changed", {
                                "method": "combined",
                                "method_id": DETECT_METHOD_BOTH
                            })
                    else:
                        print("DNN detector not available - needs model files")
                
                # Manual control options (only when flying)
                if button_states["flying"]:
                    manual_movement = None
                    
                    if key == ord('w'):  # Up
                        manual_movement = ("up", 30)
                        safe_movement_command(tello.move_up, 30)
                    elif key == ord('s'):  # Down
                        manual_movement = ("down", 30)
                        safe_movement_command(tello.move_down, 30)
                    elif key == ord('a'):  # Rotate counter-clockwise
                        manual_movement = ("rotate_ccw", 30)
                        safe_movement_command(tello.rotate_counter_clockwise, 30)
                    elif key == ord('d'):  # Rotate clockwise
                        manual_movement = ("rotate_cw", 30)
                        safe_movement_command(tello.rotate_clockwise, 30)
                    elif key == ord('r'):  # Forward
                        manual_movement = ("forward", 30)
                        safe_movement_command(tello.move_forward, 30)
                    elif key == ord('v'):  # Back
                        manual_movement = ("back", 30)
                        safe_movement_command(tello.move_back, 30)
                    elif key == ord('z'):  # Move left
                        manual_movement = ("left", 30)
                        safe_movement_command(tello.move_left, 30)
                    elif key == ord('x'):  # Move right
                        manual_movement = ("right", 30)
                        safe_movement_command(tello.move_right, 30)
                        
                    # Manual control webhook
                    if webhook and manual_movement:
                        webhook.send_event("manual_control", {
                            "direction": manual_movement[0],
                            "amount": manual_movement[1]
                        })
                
                # Sleep a bit to give time for drone to stabilize - shorter sleep time in follow mode
                if button_states["follow_mode"] and button_states["face_locked"]:
                    time.sleep(0.05)  # Quicker response time for follow mode
                else:
                    time.sleep(0.1)  # Normal delay
                
            except Exception as loop_error:
                print(f"Loop iteration error: {loop_error}")
                if DEBUG:
                    traceback.print_exc()
                    
                if webhook:
                    webhook.send_event("loop_error", {
                        "error": str(loop_error),
                        "traceback": traceback.format_exc() if DEBUG else None
                    })
    
    except KeyboardInterrupt:
        print("Keyboard interrupt received")
        if button_states["flying"] and not simulation_mode:
            print("Drone is still flying! You should land manually.")
            play_sound("warning")
            
        if webhook:
            webhook.send_event("keyboard_interrupt", {
                "still_flying": button_states["flying"]
            })
            
        button_states["flying"] = False  # Update state but don't land automatically
    
    except Exception as e:
        print(f"Critical error: {e}")
        if DEBUG:
            traceback.print_exc()
            
        if webhook:
            webhook.send_event("critical_error", {
                "error": str(e),
                "traceback": traceback.format_exc() if DEBUG else None,
                "still_flying": button_states.get("flying", False)
            })
    
    finally:
        # Clean up resources, but don't land automatically
        if button_states["flying"]:
            print("Program exiting but drone is still flying!")
            print("IMPORTANT: You should land the drone manually using the controller.")
            
        # Send shutdown event
        if webhook:
            webhook.send_event("shutdown", {
                "still_flying": button_states.get("flying", False),
                "reason": "normal_exit"
            })
            # Give the webhook thread a moment to send the final event
            time.sleep(0.5)
        
        # Stop video stream
        try:
            tello.streamoff()
        except:
            pass
            
        try:
            cv2.destroyAllWindows()
        except:
            pass
            
        print("Program shutdown complete - drone may still be in flight")

# Add this webhook class right before the if __name__ == "__main__" section
class WebhookManager:
    def __init__(self, url="http://localhost:3000/webhook"):
        self.url = url
        self.queue = queue.Queue()
        self.connected = False
        
        # Start sender thread
        self.thread = threading.Thread(target=self._sender_thread, daemon=True)
        self.thread.start()
        
        # Send startup event
        self.send_event("startup", {
            "timestamp": datetime.now().isoformat(),
            "system_info": {
                "os": platform.system(),
                "hostname": socket.gethostname(),
                "python_version": platform.python_version()
            }
        })
    
    def send_event(self, event_type, data=None, frame=None):
        """
        Send an event to the webhook server with optional screenshot
        
        Args:
            event_type: Type of event (string)
            data: Dict with event data
            frame: Optional OpenCV frame to include as screenshot
        """
        event = {
            "type": event_type,
            "data": data or {},
            "source": "tello_drone",
            "local_timestamp": datetime.now().isoformat()
        }
        
        # If frame is provided, capture a screenshot
        screenshot_data = None
        if frame is not None:
            try:
                # Create temp file name with timestamp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                temp_filename = f"temp_screenshot_{timestamp}.jpg"
                
                # Save frame as JPEG
                cv2.imwrite(temp_filename, frame)
                
                # Read the file as binary data
                with open(temp_filename, 'rb') as img_file:
                    screenshot_data = img_file.read()
                    
                # Remove temporary file
                os.remove(temp_filename)
            except Exception as e:
                print(f"Error capturing screenshot: {e}")
        
        # Add event and screenshot to queue
        self.queue.put((event, screenshot_data))
    
    def _sender_thread(self):
        while True:
            try:
                # Get the next event from the queue
                item = self.queue.get(timeout=1)
                
                if isinstance(item, tuple) and len(item) == 2:
                    event, screenshot_data = item
                else:
                    event, screenshot_data = item, None
                
                try:
                    if screenshot_data:
                        # Multipart request with image
                        import io
                        from requests_toolbelt.multipart.encoder import MultipartEncoder
                        
                        # Convert event to JSON string
                        event_json = json.dumps(event)
                        
                        # Create multipart form data
                        mp_encoder = MultipartEncoder(
                            fields={
                                'event': event_json,
                                'screenshot': ('screenshot.jpg', io.BytesIO(screenshot_data), 'image/jpeg')
                            }
                        )
                        
                        # Send with multipart content type
                        response = requests.post(
                            self.url,
                            data=mp_encoder,
                            headers={'Content-Type': mp_encoder.content_type},
                            timeout=5
                        )
                    else:
                        # Regular JSON request
                        response = requests.post(
                            self.url,
                            json=event,
                            headers={"Content-Type": "application/json"},
                            timeout=2
                        )
                    
                    if response.status_code == 200:
                        self.connected = True
                    else:
                        print(f"Failed to send event: {response.status_code}")
                except Exception as e:
                    if self.connected:  # Only show error if previously connected
                        print(f"Error sending event: {e}")
                    self.connected = False
                self.queue.task_done()
            except queue.Empty:
                pass
            except Exception as e:
                print(f"Error in webhook thread: {e}")
                time.sleep(5)  # Prevent tight loop on error

if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Tello Face Tracking')
    parser.add_argument('--sim', action='store_true', help='Run in simulation mode without a real drone')
    parser.add_argument('--force', action='store_true', help='Force real mode even if not connected to Tello WiFi')
    parser.add_argument('--direct-ip', type=str, help='Specify a direct IP address to connect to')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    parser.add_argument('--smooth', type=float, default=1.0, help='Smoothness factor for following (0.5-2.0, lower is smoother)')
    parser.add_argument('--timeout', type=float, default=5.0, help='Command timeout in seconds')
    parser.add_argument('--cooldown', type=float, default=0.3, help='Cooldown between movement commands in seconds')
    parser.add_argument('--no-sound', action='store_true', help='Disable sound feedback')
    parser.add_argument('--detection', type=int, default=2, choices=[0, 1, 2], 
                      help='Face detection method: 0=Cascade (fast), 1=DNN (better for tilted faces), 2=Both (default)')
    parser.add_argument('--webhook', type=str, default="http://localhost:3004/webhook",
                      help='Webhook URL for event notifications')
    parser.add_argument('--no-webhook', action='store_true',
                      help='Disable webhook notifications')
    
    args = parser.parse_args()
    
    # Initialize webhook
    webhook = None if args.no_webhook else WebhookManager(args.webhook)
    
    # Set global audio flag
    if args.no_sound:
        AUDIO_ENABLED = False
    
    # Run the program
    face_tracking(simulation_mode=args.sim, force_real=args.force, direct_ip=args.direct_ip, 
                  debug=args.debug, smoothness=args.smooth, command_timeout=args.timeout, 
                  command_cooldown=args.cooldown, detection_method=args.detection)