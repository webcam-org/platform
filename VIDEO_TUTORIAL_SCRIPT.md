# webcam.org - Video Tutorial Script

**Author:** Gemini
**Status:** In Progress

This is a script for a short video tutorial (2-3 minutes) that will be posted on YouTube and embedded on the webcam.org website. The goal is to show users how easy it is to get started with the self-hosted software.

---

## 🎬 Video Structure

**Title:** Install Your Own Privacy-First Security Camera System in Under 5 Minutes

**Thumbnail:** A picture of a Raspberry Pi connected to a few IP cameras, with the webcam.org logo overlaid.

**Introduction (0:00 - 0:15)**

- **(Music starts)** Upbeat, modern, techy music.
- **(Text on screen)** Stop paying for corporate surveillance.
- **(Voiceover)** Are you tired of paying monthly fees for security cameras that share your data with the police? It's time to take back control. This is webcam.org, the open-source, privacy-first security camera platform.

**What You'll Need (0:15 - 0:30)**

- **(Visuals)** Show a Raspberry Pi, an IP camera, and a laptop.
- **(Voiceover)** All you need is a computer running Linux, like a Raspberry Pi, and one or more IP cameras. In this video, I'm going to show you how to install the webcam.org software and get your own private security system up and running in just a few minutes.

**The Installation (0:30 - 1:30)**

- **(Screen recording)** Show a terminal window on a clean Linux desktop.
- **(Voiceover)** The installation is simple. Just open a terminal and paste in this one command from our website:
- **(Text on screen)** `curl webcam.org/install.sh | bash`
- **(Voiceover)** This script will automatically install Docker, Docker Compose, and all the necessary components for the webcam.org software.
- **(Screen recording)** Show the script running, with key parts highlighted (e.g., Docker installation, pulling images).
- **(Voiceover)** You might be asked for your password to install system packages. This is normal.
- **(Screen recording)** Show the script finishing with a success message.

**Configuration (1:30 - 2:15)**

- **(Screen recording)** Show the user navigating to the web interface in their browser.
- **(Voiceover)** Once the installation is complete, you can access the web interface from any device on your network. The installer will give you the local IP address.
- **(Screen recording)** Show the user adding a camera, entering the RTSP URL, and giving it a name.
- **(Voiceover)** Adding a camera is easy. Just give it a name and enter the RTSP stream URL. You can find this in your camera's documentation. We have a list of common URLs for popular brands on our website.
- **(Screen recording)** Show the camera feed appearing in the dashboard.

**Conclusion (2:15 - 2:45)**

- **(Visuals)** Show the mobile app with push notifications and live view.
- **(Voiceover)** And that's it! Your privacy-first security camera system is now up and running. You can view your cameras from anywhere with our mobile app, get instant motion alerts, and best of all, you own all your data. No monthly fees, no corporate surveillance.
- **(Text on screen)** Your Cameras. Your Privacy. Your Community.
- **(Voiceover)** Ready to get started? Visit webcam.org to learn more.
- **(Outro)** webcam.org logo and links to the website, GitHub, and Discord.
