# webcam.org - FAQ

**Author:** Gemini

This document answers frequently asked questions about the webcam.org platform.

---

## General

**What is webcam.org?**

webcam.org is an open-source platform for both public webcam browsing and private, self-hosted home security. It's designed to be a privacy-first alternative to corporate surveillance services like Ring and Nest.

**Is it free?**

Yes, the core software is 100% free and open source. We plan to offer optional paid tiers for features like cloud video backup, but the self-hosted solution will always be free.

**How does webcam.org make money?**

We plan to generate revenue through optional paid tiers for advanced features and through affiliate links on our `best-webcams.html` page.

---

## 🐧 Linux/IP Camera Version

**What do I need to get started?**

You'll need a Linux-based computer (like a Raspberry Pi or an old laptop) and one or more IP cameras that support the RTSP protocol.

**What is RTSP?**

RTSP (Real Time Streaming Protocol) is a standard for streaming video over a network. Most IP cameras support it. You can find the RTSP URL for your camera in its documentation.

**Do I need to know how to code?**

No. Our installation script handles the setup for you. You'll just need to be comfortable with the command line.

**What is Frigate?**

Frigate is an open-source NVR (Network Video Recorder) with real-time object detection. Our software integrates with Frigate to provide a complete home security solution.

---

## 💻 Windows/USB Webcam Version

**When will the Windows version be available?**

The Windows version is currently in development and is planned for release after the Linux version has been validated by the community.

**What kind of webcams will it support?**

It will support most modern USB webcams from major brands like Logitech, Razer, and Microsoft.

**Will the Windows version also be free?**

Yes, the core functionality of the Windows version will also be free and open source.

---

## 🔒 Privacy & Security

**Can webcam.org see my camera footage?**

No. For private, self-hosted cameras, your video footage never leaves your local network unless you explicitly enable cloud backup. We cannot and do not access your private video streams.

**How is this different from Ring or Nest?**

1.  **Data Control:** You own your data. Your video is stored on your own hardware, not on our servers.
2.  **Privacy:** We have no access to your private cameras. We don't share your data with police without a warrant.
3.  **Open Source:** Our code is open for anyone to inspect, so you can be sure there are no backdoors.
4.  **No Monthly Fees:** The core software is free, with no required subscriptions.

**What about public cameras?**

If you choose to share a camera publicly, the video stream will be visible to anyone on our website. You should only share cameras that are pointed at public spaces and do not infringe on anyone's privacy.
