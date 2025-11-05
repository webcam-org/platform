# webcam.org - Compatible Cameras

**Author:** Gemini

This document provides a list of cameras that are known to be compatible with the webcam.org self-hosted security software. This is not an exhaustive list, and many other cameras may work as well. The key requirement is that the camera supports RTSP (Real Time Streaming Protocol).

---

## 📷 Tested and Verified Cameras

### Amcrest
- **Models:** ProHD 1080P, UltraHD 4K
- **Configuration:**
  - **RTSP URL:** `rtsp://<username>:<password>@<camera-ip>:554/cam/realmonitor?channel=1&subtype=0`

### Hikvision
- **Models:** DS-2CD2142FWD-IS, DS-2CD2032-I
- **Configuration:**
  - **RTSP URL:** `rtsp://<username>:<password>@<camera-ip>:554/Streaming/Channels/101`

### Axis
- **Models:** M1065-L, P1365
- **Configuration:**
  - **RTSP URL:** `rtsp://<username>:<password>@<camera-ip>:554/axis-media/media.amp`

### Foscam
- **Models:** R2, FI9900P
- **Configuration:**
  - **RTSP URL:** `rtsp://<username>:<password>@<camera-ip>:554/videoMain`

### Reolink
- **Models:** RLC-410, RLC-520
- **Configuration:**
  - **RTSP URL:** `rtsp://<username>:<password>@<camera-ip>:554/h264Preview_01_main`

---

##  generic RTSP

If your camera is not on this list, but it supports RTSP, you can likely use it with webcam.org. You will need to find the correct RTSP URL for your camera model. This information is often available in the camera's documentation or on the manufacturer's website.

- **Generic RTSP URL:** `rtsp://<username>:<password>@<camera-ip>:554/stream1`

---

## 💻 USB Webcams

Most modern USB webcams are compatible with the Windows/USB webcam version of the software. This includes popular models from Logitech, Razer, and Microsoft.

- **Logitech:** C920, Brio 4K, C270
- **Razer:** Kiyo Pro
- **Microsoft:** LifeCam Studio
