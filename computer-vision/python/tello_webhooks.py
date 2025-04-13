import requests
import json
import threading
import time
import queue
from datetime import datetime

class WebhookManager:
    def __init__(self, webhook_url="http://localhost:3000/webhook", enabled=True):
        self.webhook_url = webhook_url
        self.enabled = enabled
        self.event_queue = queue.Queue()
        self.connected = False
        self.last_connection_attempt = 0
        self.throttled_events = {}  # For throttling high-frequency events
        
        # Start the background sender thread
        self.sender_thread = threading.Thread(target=self._process_queue, daemon=True)
        self.sender_thread.start()
        
        # Test connection
        self.test_connection()
    
    def test_connection(self):
        """Test if the webhook server is available"""
        try:
            response = requests.get(self.webhook_url.replace('/webhook', '/'), timeout=1)
            if response.status_code == 200:
                print(f"Webhook server connected at {self.webhook_url}")
                self.connected = True
                return True
        except Exception as e:
            print(f"Webhook server not available: {e}")
            self.connected = False
        return False
    
    def send_event(self, event_type, data=None, throttle_seconds=0):
        """Queue an event to be sent to the webhook"""
        if not self.enabled:
            return False
            
        # Check if we should throttle this event
        current_time = time.time()
        if throttle_seconds > 0:
            last_time = self.throttled_events.get(event_type, 0)
            if current_time - last_time < throttle_seconds:
                return False  # Skip this event due to throttling
            self.throttled_events[event_type] = current_time
            
        # Create the event payload
        event = {
            "type": event_type,
            "data": data or {},
            "source": "tello_drone",
            "local_timestamp": datetime.now().isoformat()
        }
        
        # Add to queue for background processing
        self.event_queue.put(event)
        return True
    
    def _process_queue(self):
        """Background thread that processes and sends events from the queue"""
        while True:
            try:
                # If not connected, try to reconnect periodically
                if not self.connected and time.time() - self.last_connection_attempt > 30:
                    self.test_connection()
                    self.last_connection_attempt = time.time()
                
                # Wait for events in the queue
                try:
                    event = self.event_queue.get(timeout=1)
                except queue.Empty:
                    continue
                
                # Skip if not connected
                if not self.connected:
                    print(f"Event {event['type']} not sent: server not connected")
                    self.event_queue.task_done()
                    continue
                
                # Send the event
                try:
                    response = requests.post(
                        self.webhook_url,
                        json=event,
                        headers={"Content-Type": "application/json"},
                        timeout=2
                    )
                    
                    if response.status_code == 200:
                        print(f"Event {event['type']} sent successfully")
                    else:
                        print(f"Failed to send event {event['type']}: {response.status_code}")
                except Exception as e:
                    print(f"Error sending event {event['type']}: {e}")
                    self.connected = False
                    self.last_connection_attempt = time.time()
                
                self.event_queue.task_done()
                
            except Exception as e:
                print(f"Error in webhook sender thread: {e}")
                time.sleep(5)  # Avoid tight loop if there's an error


class TelloEvents:
    """Handles Tello drone events integration"""
    
    def __init__(self, tello=None, webhook_manager=None):
        self.tello = tello
        self.webhook = webhook_manager
        
    def startup(self, **kwargs):
        """System startup event"""
        if self.webhook:
            self.webhook.send_event("system_startup", kwargs)
    
    def shutdown(self, still_flying=False):
        """System shutdown event"""
        if self.webhook:
            self.webhook.send_event("system_shutdown", {
                "still_flying": still_flying
            })
    
    def drone_connected(self, success=True, battery=None, simulation_mode=False):
        """Drone connection event"""
        if self.webhook:
            self.webhook.send_event("drone_connection", {
                "success": success,
                "battery": battery,
                "simulation_mode": simulation_mode
            })
    
    def takeoff(self):
        """Takeoff event"""
        if not self.webhook or not self.tello:
            return
            
        try:
            battery = self.tello.get_battery()
            height = self.tello.get_height()
            
            self.webhook.send_event("takeoff", {
                "battery": battery,
                "height": height
            })
        except Exception as e:
            print(f"Error sending takeoff event: {e}")
    
    def land(self):
        """Landing event"""
        if not self.webhook or not self.tello:
            return
            
        try:
            flight_time = self.tello.get_flight_time()
            battery = self.tello.get_battery()
            
            self.webhook.send_event("land", {
                "flight_time": flight_time,
                "battery": battery
            })
        except Exception as e:
            print(f"Error sending land event: {e}")
    
    def emergency(self):
        """Emergency stop event"""
        if self.webhook:
            self.webhook.send_event("emergency_stop", {
                "timestamp": datetime.now().isoformat()
            })
    
    def face_detected(self, face_info, locked=False, following=False, person_name="Unknown"):
        """Face detection event - throttled to avoid flooding"""
        if not self.webhook:
            return
            
        x, y, w, h, face_center_x, face_center_y, diff_x, diff_y = face_info
        
        self.webhook.send_event("face_detected", {
            "locked": locked,
            "following": following,
            "face_size": w * h,
            "position": {
                "x": face_center_x,
                "y": face_center_y,
                "diff_x": diff_x,
                "diff_y": diff_y
            },
            "person_name": person_name if locked else "Unknown"
        }, throttle_seconds=0.5)  # Only send every 0.5 seconds
    
    def face_locked(self, person_name, face_features):
        """Face lock event"""
        if self.webhook:
            x, y, w, h = face_features
            self.webhook.send_event("face_lock", {
                "person_name": person_name,
                "face_features": {
                    "x": x, "y": y, "width": w, "height": h
                }
            })
    
    def face_unlocked(self):
        """Face unlock event"""
        if self.webhook:
            self.webhook.send_event("face_unlock", {})
    
    def face_lost(self, person_name, search_mode_active=False):
        """Lost track of face event"""
        if self.webhook:
            self.webhook.send_event("face_lost", {
                "person_name": person_name,
                "search_mode_active": search_mode_active
            })
    
    def face_found(self, person_name):
        """Found face after searching"""
        if self.webhook:
            self.webhook.send_event("face_found", {
                "person_name": person_name
            })
    
    def follow_mode_changed(self, enabled, person_name=None):
        """Follow mode toggle event"""
        if self.webhook:
            self.webhook.send_event("follow_mode_changed", {
                "enabled": enabled,
                "person_name": person_name
            })
    
    def tracking_mode_changed(self, enabled):
        """Tracking mode toggle event"""
        if self.webhook:
            self.webhook.send_event("tracking_mode_changed", {
                "enabled": enabled
            })
    
    def person_renamed(self, old_name, new_name):
        """Person name change event"""
        if self.webhook:
            self.webhook.send_event("person_renamed", {
                "old_name": old_name,
                "new_name": new_name
            })
    
    def battery_low(self, level):
        """Low battery warning event"""
        if self.webhook:
            self.webhook.send_event("battery_low", {
                "level": level
            })
    
    def movement(self, command, args, success=True):
        """Drone movement event"""
        if self.webhook:
            self.webhook.send_event("movement", {
                "command": command,
                "args": args,
                "success": success
            })
    
    def hover(self):
        """Drone hover command event"""
        if self.webhook:
            self.webhook.send_event("hover", {
                "timestamp": datetime.now().isoformat()
            })
    
    def search_mode_changed(self, active, direction=None, phase=None):
        """Search mode status change"""
        if self.webhook:
            self.webhook.send_event("search_mode_changed", {
                "active": active,
                "direction": direction,
                "phase": phase
            })
    
    def detection_method_changed(self, method):
        """Face detection method change"""
        methods = {0: "cascade", 1: "dnn", 2: "both"}
        if self.webhook:
            self.webhook.send_event("detection_method_changed", {
                "method": methods.get(method, "unknown")
            })
    
    def sound_feedback_changed(self, enabled):
        """Sound feedback toggle event"""
        if self.webhook:
            self.webhook.send_event("sound_feedback_changed", {
                "enabled": enabled
            })
    
    def telemetry(self, battery, height, temp, barometer, flight_time):
        """Periodic telemetry data - highly throttled"""
        if self.webhook:
            self.webhook.send_event("telemetry", {
                "battery": battery,
                "height": height,
                "temperature": temp,
                "barometer": barometer,
                "flight_time": flight_time
            }, throttle_seconds=5)  # Only send every 5 seconds
    
    def error(self, error_type, message):
        """Error event"""
        if self.webhook:
            self.webhook.send_event("error", {
                "type": error_type,
                "message": message
            }) 