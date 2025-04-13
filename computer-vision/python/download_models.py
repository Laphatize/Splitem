#!/usr/bin/env python3
import os
import sys
import subprocess
import platform
import urllib.request

def download_models():
    print("Downloading OpenCV DNN face detection model files...")
    
    # Create models directory if it doesn't exist
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(script_dir, "models")
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        print(f"Created models directory at {model_dir}")
    
    # Model file URLs
    model_url = "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20180205_fp16/opencv_face_detector_uint8.pb"
    config_url = "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/opencv_face_detector.pbtxt"
    
    # Target paths
    model_path = os.path.join(model_dir, "opencv_face_detector_uint8.pb")
    config_path = os.path.join(model_dir, "opencv_face_detector.pbtxt")
    
    # Check if files already exist
    if os.path.exists(model_path) and os.path.exists(config_path):
        print("Model files already exist. Skipping download.")
        return True
    
    # Try using curl if available
    curl_available = False
    try:
        subprocess.run(["curl", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        curl_available = True
    except:
        print("curl not found, will use urllib instead")
    
    # Download files
    try:
        if curl_available:
            # Use curl
            print("Downloading model file (opencv_face_detector_uint8.pb)...")
            subprocess.run(["curl", "-L", "-o", model_path, model_url], check=True)
            
            print("Downloading config file (opencv_face_detector.pbtxt)...")
            subprocess.run(["curl", "-L", "-o", config_path, config_url], check=True)
        else:
            # Use urllib
            print("Downloading model file (opencv_face_detector_uint8.pb)...")
            urllib.request.urlretrieve(model_url, model_path)
            
            print("Downloading config file (opencv_face_detector.pbtxt)...")
            urllib.request.urlretrieve(config_url, config_path)
        
        print("Download completed successfully!")
        
        # Verify files were downloaded
        if os.path.exists(model_path) and os.path.getsize(model_path) > 0 and \
           os.path.exists(config_path) and os.path.getsize(config_path) > 0:
            print("Files verified. DNN face detector is ready to use.")
            print(f"Files saved to: {model_dir}")
            return True
        else:
            print("Error: Downloaded files appear to be empty or incomplete.")
            return False
            
    except Exception as e:
        print(f"Error downloading model files: {e}")
        return False

if __name__ == "__main__":
    print("OpenCV DNN Face Detection Model Downloader")
    print("==========================================")
    success = download_models()
    
    if success:
        print("\nYou can now use the DNN face detector by running:")
        print("python demo.py --detection 1  # DNN only")
        print("python demo.py --detection 2  # Both Cascade and DNN (default)")
    else:
        print("\nDownload failed. You can manually download these files:")
        print("1. opencv_face_detector_uint8.pb")
        print("   URL: https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20180205_fp16/opencv_face_detector_uint8.pb")
        print("2. opencv_face_detector.pbtxt")
        print("   URL: https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/opencv_face_detector.pbtxt")
        print("\nPlace them in the 'models' directory inside the python folder.") 