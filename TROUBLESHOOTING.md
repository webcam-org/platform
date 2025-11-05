# webcam.org - Troubleshooting Guide

**Author:** Gemini

This guide provides solutions to common problems you might encounter while installing or using the webcam.org self-hosted software.

---

## 🔧 Installation Issues

### `curl: (7) Failed to connect to webcam.org port 80: Connection refused`

- **Cause:** This error indicates that your system cannot reach the webcam.org server. This could be due to a network issue, a firewall blocking the connection, or a problem with your DNS resolver.
- **Solution:**
  1. Check your internet connection.
  2. Make sure your firewall is not blocking outgoing connections on port 80.
  3. Try pinging another website (e.g., `ping google.com`) to check your DNS resolution.

### `bash: permission denied`

- **Cause:** The installation script needs to be executed with user permissions. You might have downloaded the script but are trying to run it without the necessary permissions.
- **Solution:**
  1. Ensure you are running the command as a user with `sudo` privileges.
  2. You may be prompted for your password during the installation. This is normal and required to install system packages.

### Docker Installation Fails

- **Cause:** The installer script attempts to install Docker automatically. This can fail if your operating system is not supported or if there are conflicts with existing packages.
- **Solution:**
  1. Manually install Docker and Docker Compose by following the official instructions for your distribution: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
  2. Once Docker is installed, re-run the installation script.

---

## 📷 Camera & Video Issues

### Camera Not Detected

- **Cause:** The software may not be able to find your camera if it is not properly connected or if the RTSP stream URL is incorrect.
- **Solution:**
  1. **IP Cameras:**
     - Double-check the camera's IP address, username, and password.
     - Verify the RTSP URL for your camera model. Check the `COMPATIBLE_CAMERAS.md` file for examples.
     - Ensure the camera is on the same network as your server.
  2. **USB Webcams (Windows):**
     - Make sure the camera is properly connected to your computer.
     - Check if the camera is detected by Windows in the Device Manager.
     - Ensure you have the latest drivers for your webcam.

### No Video Stream

- **Cause:** Even if the camera is detected, the video stream may fail to start due to incorrect RTSP settings, firewall issues, or unsupported video codecs.
- **Solution:**
  1. **Check RTSP URL:** This is the most common cause. Verify the URL format, including the port number (usually 554).
  2. **Firewall:** Ensure your firewall is not blocking the RTSP port (554).
  3. **VLC Test:** Try opening the RTSP stream in VLC Media Player. If it doesn't work in VLC, it won't work in webcam.org.

---

## 🔔 Notification Issues

### Not Receiving Push Notifications

- **Cause:** This can be due to a variety of reasons, including incorrect Firebase configuration, network issues, or problems with the mobile app.
- **Solution:**
  1. **Check Firebase Setup:** Ensure you have correctly configured the Firebase credentials in the backend.
  2. **Mobile App:** Make sure you have granted the app permission to receive notifications.
  3. **Backend Logs:** Check the backend logs for any errors related to sending notifications.

---

## ❓ Other Issues

### I can't access the web interface.

- **Cause:** The web server may not be running, or it may be blocked by a firewall.
- **Solution:**
  1. **Check Docker:** Run `docker ps` to see if the `webcamorg-backend` container is running.
  2. **Firewall:** Ensure that the port the web interface is running on (usually port 80 or 8080) is not blocked by your firewall.

---

If you are still having trouble, please join our Discord community for help: [Link to Discord]
