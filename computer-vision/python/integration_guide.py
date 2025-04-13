from tello_webhooks import WebhookManager, TelloEvents

# 2. Add webhook variables to globals
webhook = None
tello_events = None

# 3. Modify the face_tracking function to initialize webhooks
def face_tracking(simulation_mode=False, force_real=False, direct_ip=None, debug=False, smoothness=1.0, 
                 command_timeout=5.0, command_cooldown=0.3, detection_method=DETECT_METHOD_BOTH,
                 webhook_url="http://localhost:3000/webhook", webhook_enabled=True):
    global DEBUG, AUDIO_ENABLED, webhook, tello_events
    DEBUG = debug
    
    # Initialize webhook if enabled
    if webhook_enabled:
        webhook = WebhookManager(webhook_url=webhook_url, enabled=True)
        # Will initialize tello_events after tello object is created
    
    # 4. After creating the tello object (around line 350-400)
    # Initialize tello events after tello object is created
    if webhook and webhook_enabled:
        tello_events = TelloEvents(tello=tello, webhook_manager=webhook)
        tello_events.startup(
            simulation_mode=simulation_mode,
            debug_mode=debug,
            detection_method=detection_method
        )
    
    # 5. After connecting to the drone (successful connection)
    if tello_events:
        tello_events.drone_connected(
            success=True,
            battery=battery,
            simulation_mode=simulation_mode
        )
    
    # 6. In the safe_movement_command function
    def safe_movement_command(command_func, *args, **kwargs):
        # Existing code...
        try:
            # Only add timeout for send_command_with_return, not movement commands
            if command_func.__name__ == 'send_command_with_return' and 'timeout' not in kwargs:
                kwargs['timeout'] = command_timeout
            result = command_func(*args, **kwargs)
            button_states["last_command_time"] = current_time
            
            # Report movement success to webhook
            if tello_events and result:
                cmd_name = command_func.__name__.replace('move_', '').replace('rotate_', 'rotate_')
                tello_events.movement(cmd_name, [str(arg) for arg in args], success=True)
                
            return result
        except Exception as e:
            print(f"Movement command failed: {e}")
            play_sound("error")  # Play error sound on command failure
            
            # Report movement failure to webhook
            if tello_events:
                cmd_name = command_func.__name__.replace('move_', '').replace('rotate_', 'rotate_')
                tello_events.movement(cmd_name, [str(arg) for arg in args], success=False)
                tello_events.error("movement_command", str(e))
                
            return False
    
    # 7. In the key handling code for takeoff (around key == ord('0'))
    if key == ord('0'):  # Press '0' to takeoff
        if not button_states["flying"]:
            print("Taking off!")
            tello.takeoff()
            button_states["flying"] = True
            play_sound("takeoff")
            if tello_events:
                tello_events.takeoff()
    
    # 8. In the key handling code for landing (around key == ord('l'))
    elif key == ord('l'):  # Press 'l' to land
        if button_states["flying"]:
            print("Landing!")
            tello.land()
            button_states["flying"] = False
            play_sound("land")
            if tello_events:
                tello_events.land()
    
    # 9. In the emergency stop code (around key == ord('e'))
    elif key == ord('e'):  # Press 'e' for emergency stop
        print("EMERGENCY STOP!")
        tello.emergency()
        button_states["flying"] = False
        play_sound("error")
        if tello_events:
            tello_events.emergency()
    
    # 10. In the face detection drawing code (after target_face processing)
    if target_face is not None:
        x, y, w, h, face_center_x, face_center_y, diff_x, diff_y = target_face
        # After existing face drawing code
        if tello_events:
            tello_events.face_detected(
                target_face,
                locked=button_states["face_locked"],
                following=button_states["follow_mode"],
                person_name=button_states["target_person_name"] if button_states["face_locked"] else "Unknown"
            )
    
    # 11. In the face lock toggle code (around key == ord('f'))
    elif key == ord('f'):  # Press 'f' to lock/unlock face
        if target_face is not None and not button_states["face_locked"]:
            button_states["face_locked"] = True
            button_states["locked_face_features"] = (x, y, w, h)
            print(f"Face locked! Tracking {button_states['target_person_name']}")
            play_sound("lock")
            if tello_events:
                tello_events.face_locked(
                    button_states["target_person_name"],
                    (x, y, w, h)
                )
        else:
            old_lock_state = button_states["face_locked"]
            button_states["face_locked"] = False
            button_states["locked_face_features"] = None
            button_states["follow_mode"] = False
            print("Face lock released!")
            play_sound("unlock")
            if tello_events and old_lock_state:
                tello_events.face_unlocked()
    
    # 12. In the face lost tracking code (around button_states["face_lost_time"] is None)
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
                if tello_events:
                    tello_events.face_lost(
                        button_states["target_person_name"],
                        search_mode_active=True
                    )
                    tello_events.search_mode_changed(
                        True, 
                        direction="clockwise",
                        phase=0
                    )
    
    # 13. When faces are found after searching
    elif button_states["face_locked"] and locked_face is not None:
        # Reset lost face timer if we have the face
        if button_states["face_lost_time"] is not None:
            button_states["face_lost_time"] = None
            # Also exit search mode if active
            if button_states["search_mode"]:
                button_states["search_mode"] = False
                button_states["search_phase"] = 0
                if tello_events:
                    tello_events.face_found(button_states["target_person_name"])
                    tello_events.search_mode_changed(False)
    
    # 14. In the follow mode toggle code (around key == ord('g'))
    elif key == ord('g'):  # Press 'g' to toggle follow mode
        old_follow_state = button_states["follow_mode"]
        # Can only enable follow mode if face is locked
        if button_states["face_locked"] or not button_states["follow_mode"]:
            button_states["follow_mode"] = not button_states["follow_mode"]
            if button_states["follow_mode"]:
                if not button_states["face_locked"]:
                    # Auto-enable face lock when follow mode is turned on
                    button_states["face_locked"] = True
                print(f"Follow mode enabled for {button_states['target_person_name']}")
                play_sound("follow")
                if tello_events:
                    tello_events.follow_mode_changed(True, button_states["target_person_name"])
            else:
                print("Follow mode disabled")
                play_sound("stop_follow")
                if tello_events and old_follow_state:
                    tello_events.follow_mode_changed(False)
    
    # 15. In the person name change code (around key == ord('n'))
    elif key == ord('n'):  # Press 'n' to change name of tracked person
        if button_states["face_locked"]:
            # After handling name input and updating button_states["target_person_name"]
            old_name = button_states["target_person_name"]
            # ... existing name input code ...
            if name_input:
                new_name = name_input
                button_states["target_person_name"] = new_name
                print(f"Now tracking: {button_states['target_person_name']}")
                if tello_events and old_name != new_name:
                    tello_events.person_renamed(old_name, new_name)
    
    # 16. In the tracking toggle code (around key == ord('t'))
    elif key == ord('t'):  # Toggle tracking
        old_tracking = button_states["tracking_enabled"]
        button_states["tracking_enabled"] = not button_states["tracking_enabled"]
        print(f"Tracking {'enabled' if button_states['tracking_enabled'] else 'disabled'}")
        if tello_events and old_tracking != button_states["tracking_enabled"]:
            tello_events.tracking_mode_changed(button_states["tracking_enabled"])
    
    # 17. In the sound toggle code (around key == ord('m'))
    elif key == ord('m'):  # Press 'm' to toggle audio feedback
        old_sound = button_states["sound_feedback"]
        button_states["sound_feedback"] = not button_states["sound_feedback"]
        AUDIO_ENABLED = button_states["sound_feedback"]
        print(f"Sound feedback {'enabled' if AUDIO_ENABLED else 'disabled'}")
        if tello_events and old_sound != button_states["sound_feedback"]:
            tello_events.sound_feedback_changed(button_states["sound_feedback"])
    
    # 18. In the hover code (around key == ord('p'))
    elif key == ord('p'):  # Emergency hover (stop all movement)
        print("HOVER: Stopping all movement")
        try:
            # Send SDK command to hover using the proper method
            tello.send_command_without_return("stop")
            play_sound("hover")
            if tello_events:
                tello_events.hover()
        except Exception as e:
            print(f"Hover command failed: {e}")
            play_sound("error")
            if tello_events:
                tello_events.error("hover_command", str(e))
    
    # 19. In the detection method toggle code (keys 1,2,3)
    elif key == ord('1'):  # Switch to cascade detection only
        old_method = button_states["detection_method"]
        button_states["detection_method"] = DETECT_METHOD_CASCADE
        print("Switched to Haar Cascade face detection (faster)")
        if tello_events and old_method != button_states["detection_method"]:
            tello_events.detection_method_changed(button_states["detection_method"])
    
    # 20. Add telemetry event in the main loop where telemetry is collected
    try:
        battery = tello.get_battery()
        height = tello.get_height()
        temp = tello.get_temperature()
        barometer = tello.get_barometer()
        flight_time = tello.get_flight_time()
        
        if tello_events:
            tello_events.telemetry(battery, height, temp, barometer, flight_time)
    except Exception as telem_error:
        print(f"Telemetry error: {telem_error}")
        if tello_events:
            tello_events.error("telemetry", str(telem_error))
    
    # 21. In the battery check code (if present)
    if battery < 15 and not simulation_mode and button_states["flying"]:
        print("WARNING: Battery critically low!")
        play_sound("warning") 
        if tello_events:
            tello_events.battery_low(battery)
    
    # 22. In the finally block for cleanup
    finally:
        # Report shutdown
        if tello_events:
            tello_events.shutdown(still_flying=button_states["flying"])
            
        # Clean up resources, but don't land automatically
        if button_states["flying"]:
            print("Program exiting but drone is still flying!")
            print("IMPORTANT: You should land the drone manually using the controller.")
        
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