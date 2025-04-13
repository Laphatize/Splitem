# Import at the beginning of demo.py
from webhook_integration import WebhookManager

# Add this after other global variables
webhook = None

# Modify the face_tracking function to initialize webhook
def face_tracking(simulation_mode=False, force_real=False, direct_ip=None, debug=False, smoothness=1.0, 
                 command_timeout=5.0, command_cooldown=0.3, detection_method=DETECT_METHOD_BOTH,
                 webhook_url="http://localhost:3000/webhook", webhook_enabled=True):
    global DEBUG, AUDIO_ENABLED, webhook
    DEBUG = debug
    
    # Initialize webhook if enabled
    if webhook_enabled:
        webhook = WebhookManager(webhook_url=webhook_url, enabled=True)
        # Send startup event
        webhook.send_event("system_startup", {
            "simulation_mode": simulation_mode,
            "debug_mode": debug,
            "detection_method": detection_method
        })
    
    # Rest of the function...

# Add webhook calls throughout the code, for example:

# When connecting to drone
if webhook:
    webhook.send_event("drone_connection", {
        "success": True,
        "battery": battery,
        "simulation_mode": simulation_mode
    })

# For takeoff
if key == ord('0'):  # Press '0' to takeoff
    if not button_states["flying"]:
        print("Taking off!")
        tello.takeoff()
        button_states["flying"] = True
        play_sound("takeoff")
        if webhook:
            webhook.send_event("drone_takeoff", {
                "battery": tello.get_battery(),
                "height": tello.get_height()
            })

# For landing
if key == ord('l'):  # Press 'l' to land
    if button_states["flying"]:
        print("Landing!")
        tello.land()
        button_states["flying"] = False
        play_sound("land")
        if webhook:
            webhook.send_event("drone_land", {
                "flight_time": tello.get_flight_time(),
                "battery": tello.get_battery()
            })

# For face detection
if target_face is not None:
    # After drawing face
    if webhook:
        webhook.send_event("face_detected", {
            "locked": button_states["face_locked"],
            "following": button_states["follow_mode"],
            "face_size": w * h,
            "position": {
                "x": face_center_x,
                "y": face_center_y,
                "diff_x": diff_x,
                "diff_y": diff_y
            },
            "person_name": button_states["target_person_name"] if button_states["face_locked"] else "Unknown"
        })

# For movement commands
def safe_movement_command(command_func, *args, **kwargs):
    # Existing code...
    result = command_func(*args, **kwargs)
    button_states["last_command_time"] = current_time
    
    # Add webhook notification
    if webhook and result:
        webhook.send_event("drone_movement", {
            "command": command_func.__name__,
            "args": [str(arg) for arg in args],
            "success": True
        })
    
    return result

# For face lock
elif key == ord('f'):  # Press 'f' to lock/unlock face
    if target_face is not None and not button_states["face_locked"]:
        button_states["face_locked"] = True
        button_states["locked_face_features"] = (x, y, w, h)
        # Original code...
        print(f"Face locked! Tracking {button_states['target_person_name']}")
        play_sound("lock")
        if webhook:
            webhook.send_event("face_lock", {
                "person_name": button_states["target_person_name"],
                "face_features": {
                    "x": x, "y": y, "width": w, "height": h
                }
            })
    else:
        button_states["face_locked"] = False
        button_states["locked_face_features"] = None
        # Disable follow mode if face lock is disabled
        button_states["follow_mode"] = False
        print("Face lock released!")
        play_sound("unlock")
        if webhook:
            webhook.send_event("face_unlock", {})

# In the finally block for proper shutdown
finally:
    # Existing code...
    if webhook:
        webhook.send_event("system_shutdown", {
            "still_flying": button_states["flying"]
        })
    
    print("Program shutdown complete - drone may still be in flight")

# Update the main function to accept webhook parameters
if __name__ == "__main__":
    # Existing argument parsing...
    parser.add_argument('--webhook-url', type=str, default="http://localhost:3000/webhook", 
                      help='URL for the webhook server')
    parser.add_argument('--no-webhook', action='store_true', help='Disable webhook integration')
    args = parser.parse_args()
    
    # Run the program with webhook parameters
    face_tracking(simulation_mode=args.sim, force_real=args.force, direct_ip=args.direct_ip, 
                  debug=args.debug, smoothness=args.smooth, command_timeout=args.timeout, 
                  command_cooldown=args.cooldown, detection_method=args.detection,
                  webhook_url=args.webhook_url, webhook_enabled=not args.no_webhook) 