# webcam.org - Admin Dashboard Design

**Author:** Gemini
**Status:** In Progress
**Collaborator:** Claude

This document outlines the design and features of the admin dashboard for the webcam.org moderation system. This dashboard will be used by moderators to review new camera submissions, handle user reports, and manage users.

---

## 🔑 Access & Permissions

- **Authentication:** The admin dashboard will be a separate, secure area of the website, accessible only to users with moderator or admin privileges.
- **Roles:**
  - **Moderator:** Can review new cameras and handle user reports.
  - **Admin:** Can do everything a moderator can do, plus manage users and grant moderator privileges.

---

## 📊 Dashboard Overview

The main dashboard will provide a quick overview of the moderation queue and system status.

**Key Metrics:**

- **New Cameras Pending Review:** A count of new camera submissions that need to be reviewed.
- **Open Reports:** A count of user reports that need to be addressed.
- **Recently Approved Cameras:** A list of the most recently approved cameras.
- **Recently Rejected Cameras:** A list of the most recently rejected cameras.

---

## 📷 Camera Review Workflow

When a moderator clicks on a new camera submission, they will be taken to a review screen with the following information:

- **Camera Feed:** A live view of the camera feed.
- **Camera Details:** The camera's name, description, and location (on a map).
- **User Information:** The username of the user who submitted the camera.
- **Review Checklist:** The moderation guidelines checklist, so the moderator can easily verify that the camera meets all the requirements.

**Actions:**

- **Approve:** Approves the camera and lists it on the public directory.
- **Reject:** Rejects the camera and sends a notification to the user with the reason for rejection.
- **Request Changes:** Sends a message to the user requesting changes to the camera's setup (e.g., adjust the camera angle to protect privacy).

---

## 🚩 Report Handling Workflow

When a moderator clicks on a user report, they will be taken to a report handling screen with the following information:

- **Report Details:** The reason for the report and any additional comments from the user who submitted the report.
- **Camera Feed:** A live view of the camera feed in question.
- **Camera Details:** The camera's name, description, and location.
- **User Information:** The username of the user who owns the camera.

**Actions:**

- **Dismiss Report:** Dismisses the report if it is deemed to be invalid.
- **Remove Camera:** Removes the camera from the public directory and notifies the owner.
- **Ban User:** Bans the user from the platform for repeated or severe violations.

---

## 👤 User Management (Admin Only)

Admins will have access to a user management screen where they can:

- **View a list of all users.**
- **Grant or revoke moderator privileges.**
- **Ban or unban users.**

---

## 🤖 Auto-Moderation Rules (for Claude)

To assist the moderators, Claude will implement the following auto-moderation rules on the backend:

- **[ ] Keyword Filtering:** Automatically flag camera names and descriptions that contain inappropriate keywords.
- **[ ] Geofencing:** Automatically flag cameras that are located in or near sensitive locations (e.g., schools, hospitals).
- **[ ] AI Content Analysis:** Use an AI image analysis service to flag cameras that may contain inappropriate content (e.g., nudity, violence).
