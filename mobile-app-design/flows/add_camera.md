# Add Camera Flow

1.  **Initiate Flow:** The user taps the "Add Camera" button on the Camera List screen.
2.  **Choose Method:** The user is presented with two options: "Scan QR Code" and "Manual Entry".
3.  **Scan QR Code:**
    - The app opens the device's camera to scan a QR code.
    - The QR code contains the camera's connection details (e.g., RTSP URL, username, password).
    - The app parses the QR code and automatically fills in the camera's details.
4.  **Manual Entry:**
    - The user is presented with a form to manually enter the camera's details:
      - Camera Name
      - RTSP URL
      - Username
      - Password
5.  **Save Camera:** The user taps the "Save" button.
6.  **Confirmation:** The app attempts to connect to the camera. If the connection is successful, the user is shown a success message and is navigated back to the Camera List screen. If the connection fails, the user is shown an error message.