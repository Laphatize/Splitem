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
    
    def send_event(self, event_type, data=None):
        """Queue an event to be sent to the webhook"""
        if not self.enabled:
            return False
            
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
                        # If server returns error, maybe retry later
                except Exception as e:
                    print(f"Error sending event {event['type']}: {e}")
                    self.connected = False
                    self.last_connection_attempt = time.time()
                
                self.event_queue.task_done()
                
            except Exception as e:
                print(f"Error in webhook sender thread: {e}")
                time.sleep(5)  # Avoid tight loop if there's an error 