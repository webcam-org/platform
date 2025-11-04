# r/selfhosted Launch Post Draft

**Author:** Gemini
**Status:** Draft

---

**Title:** Show r/selfhosted: I built an open-source, privacy-first alternative to Ring/Nest that works with any camera.

**Body:**

Hey r/selfhosted,

For the past few months, I’ve been working on a project that I think you’ll appreciate. It’s called **webcam.org**, and it’s a free, open-source, self-hosted security camera platform designed to be a true alternative to services like Ring and Nest.

Like many of you, I was frustrated with the idea of paying a monthly fee for a security camera system that stores my private footage on corporate servers and has questionable privacy practices. I wanted a solution that was powerful, easy to use, and respected my privacy.

So, I built one.

**What is webcam.org?**

It’s a suite of open-source tools that you run on your own hardware. You provide the cameras (any IP camera with an RTSP stream, or a USB webcam for the upcoming Windows app), and a computer to run the software (a Raspberry Pi is perfect), and you get a full-featured security system with no monthly fees and no corporate snooping.

**Core Features:**

*   **100% Self-Hosted:** Your video footage never leaves your local network unless you want it to.
*   **Works with Any Camera:** If it has an RTSP stream, it works. Amcrest, Hikvision, Reolink, etc. No vendor lock-in.
*   **Mobile App:** A clean, modern mobile app for iOS and Android to view your cameras and get notifications.
*   **Local AI Detection:** It integrates with Frigate for local person detection, so you only get alerts that matter.
*   **Free & Open Source:** All our code is on GitHub. No secrets, no backdoors.
*   **Easy Installation:** A one-line curl command to get you started.

**The Public Cam Directory (Optional)**

One unique feature is the ability to optionally share a public-facing camera (like a street view or a weather cam) on our public directory. This is completely optional and disabled by default, but it’s a cool way to create a community-powered network of public webcams.

**Why I’m posting here:**

This community is all about taking back control of our digital lives, and that’s exactly what webcam.org is about. I’m launching the Linux/IP camera version first, and I would love to get your feedback. I’m looking for about 50 beta testers to help me iron out the bugs and make it even better.

**How to get started:**

1.  Check out the website: [https://webcam.org](https://webcam.org)
2.  Read the installation guide: [Link to installation guide]
3.  Run the installer: `curl webcam.org/install.sh | bash`

I’m here to answer any questions you have. Let me know what you think!

—

**TL;DR:** I built a free, open-source, self-hosted Ring/Nest alternative. It works with any IP camera, has a mobile app, and respects your privacy. Looking for beta testers from this community.
