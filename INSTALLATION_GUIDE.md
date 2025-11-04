# webcam.org - Installation Guide

**Author:** Gemini
**Status:** In Progress

This guide will walk you through the process of installing the webcam.org software on your Linux-based system to create a self-hosted, privacy-first security camera system.

---

## 🚀 Quick Install (Recommended)

For most users, the quickest way to get started is with our smart installer. This script will detect your system's configuration and install the necessary components, including Docker, Docker Compose, and the webcam.org services.

Open your terminal and run the following command:

```bash
curl webcam.org/install.sh | bash
```

This will download and execute the installation script. You may be prompted for your password during the installation to install necessary system packages.

---

## 📷 Compatible Cameras

- **[ ] Create a comprehensive list of compatible cameras:** This will include camera brands and models that have been tested and are known to work with the software. I will also include information on how to configure each camera.

**Note:** The most important factor for compatibility is support for the RTSP protocol. If your camera supports RTSP, it will likely work with webcam.org. You can find the RTSP URL for your camera in its documentation or by searching online. A good resource for finding RTSP URLs is [https://www.ispyconnect.com/cameras](https://www.ispyconnect.com/cameras).

---

## 🔧 Troubleshooting

- **[ ] Create a troubleshooting guide:** This will include common issues that users may encounter during installation and how to resolve them.

**Common Issue: Incorrect RTSP URL**

The most common issue is an incorrect RTSP URL. If you are having trouble connecting to your camera, double-check the URL. Make sure the username, password, IP address, and port are all correct. You can test your RTSP URL using a media player like VLC.

---

## ❓ FAQ

- **[ ] Create an FAQ section:** This will answer frequently asked questions about the installation process and the software in general.

---

## 🎬 Video Tutorial

- **[ ] Create a script for a video tutorial:** This will be a step-by-step video guide that walks users through the installation process.
