from djitellopy import Tello
import cv2
import time

def tello_face_tracking():
    """Basic Tello face tracking without any extras"""
    
    # Initialize the Tello drone
    print("Connecting to Tello drone...")
    tello = Tello()
    tello.connect()
    
    print(f"Battery: {tello.get_battery()}%")
    
    # Turn on video stream
    tello.streamon()
    
    # Get the first frame to calculate dimensions
    frame = tello.get_frame_read().frame
    frame_height, frame_width = frame.shape[:2]
    
    # Load face detection classifier
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    # Take off
    tello.takeoff()
    time.sleep(2)  # Give it time to stabilize
    
    try:
        while True:
            # Get current frame
            frame = tello.get_frame_read().frame
            
            # Convert to neutralscale for face detection
            neutral = cv2.cvtColor(frame, cv2.COLOR_BGR2neutral)
            
            # Detect faces
            faces = face_cascade.detectMultiScale(neutral, 1.3, 5)
            
            # Calculate center of frame
            frame_center_x = frame_width // 2
            frame_center_y = frame_height // 2
            
            # Draw center crosshair
            cv2.line(frame, (frame_center_x - 20, frame_center_y), (frame_center_x + 20, frame_center_y), (0, 255, 255), 1)
            cv2.line(frame, (frame_center_x, frame_center_y - 20), (frame_center_x, frame_center_y + 20), (0, 255, 255), 1)
            
            # Show battery info
            battery = tello.get_battery()
            cv2.putText(frame, f"Battery: {battery}%", (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            # Find and track faces
            for (x, y, w, h) in faces:
                # Draw rectangle around face
                cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
                
                # Calculate center of the face
                face_center_x = x + w // 2
                face_center_y = y + h // 2
                
                # Draw crosshair on face
                cv2.line(frame, (face_center_x - 20, face_center_y), (face_center_x + 20, face_center_y), (0, 255, 0), 2)
                cv2.line(frame, (face_center_x, face_center_y - 20), (face_center_x, face_center_y + 20), (0, 255, 0), 2)
                
                # Calculate difference between face center and frame center
                diff_x = face_center_x - frame_center_x
                diff_y = frame_center_y - face_center_y  # Inverted because y increases downward
                
                # Track face by rotating or moving the drone
                if abs(diff_x) > 70:  # Threshold for horizontal movement
                    if diff_x > 0:  # Face is to the right
                        print("Face right - rotating clockwise")
                        tello.rotate_clockwise(15)
                    else:  # Face is to the left
                        print("Face left - rotating counter-clockwise")
                        tello.rotate_counter_clockwise(15)
                
                if abs(diff_y) > 70:  # Threshold for vertical movement
                    if diff_y > 0:  # Face is below center
                        print("Face below - moving down")
                        tello.move_down(20)
                    else:  # Face is above center
                        print("Face above - moving up")
                        tello.move_up(20)
                
                # Adjust distance to face
                if w * h > 25000:  # Face too close (large face area)
                    print("Face too close - moving back")
                    tello.move_back(30)
                elif w * h < 9000:  # Face too far (small face area)
                    print("Face too far - moving forward")
                    tello.move_forward(30)
                
                break  # Only track the first face
            
            # Display the frame
            cv2.imshow("Tello Face Tracking", frame)
            
            # Process key commands
            key = cv2.waitKey(1) & 0xff
            if key == ord('q'):  # Press 'q' to quit
                break
            elif key == ord('l'):  # Press 'l' to land
                break
            
            # Short delay for stability
            time.sleep(0.1)
        
    finally:
        # Always land and close resources properly
        print("Landing...")
        tello.land()
        time.sleep(1)
        
        # Close video stream and windows
        tello.streamoff()
        cv2.destroyAllWindows()
        print("Done!")

if __name__ == "__main__":
    tello_face_tracking() 