# Privacy Policy - webcam.org

**Effective Date:** [DATE]
**Last Updated:** 2025-11-04

---

## Our Privacy Promise

**webcam.org is built on a fundamental principle: Your cameras, your data, your control.**

This Privacy Policy explains what data we collect, what we DON'T collect, and how we protect your privacy. Unlike Ring, Nest, and other corporate surveillance platforms, we believe privacy is a right, not a feature you pay for.

---

## Table of Contents

1. [What We Collect](#1-what-we-collect)
2. [What We Do NOT Collect](#2-what-we-do-not-collect)
3. [How We Use Your Information](#3-how-we-use-your-information)
4. [Data Storage and Security](#4-data-storage-and-security)
5. [Data Sharing and Disclosure](#5-data-sharing-and-disclosure)
6. [Your Rights and Choices](#6-your-rights-and-choices)
7. [Children's Privacy](#7-childrens-privacy)
8. [International Users](#8-international-users)
9. [Changes to This Policy](#9-changes-to-this-policy)
10. [Contact Us](#10-contact-us)

---

## 1. What We Collect

### 1.1 Account Information
When you create an account, we collect:
- **Email address** (required for login and notifications)
- **Username** (public display name)
- **Password** (encrypted with bcrypt, we cannot see your password)
- **Subscription tier** (free, plus, pro)

### 1.2 Camera Metadata (NOT Video)
When you register a camera, we collect:
- **Camera name and description** (set by you)
- **GPS location** (only if you mark camera as public)
- **Camera type** (doorbell, security, traffic, etc.)
- **Technical details** (resolution, FPS, stream type)
- **Last seen timestamp** (to show if camera is online)
- **Thumbnail images** (for public cameras only, auto-generated)

**WE DO NOT COLLECT OR STORE YOUR CAMERA VIDEO.**

### 1.3 Integration Data
If you connect Frigate, MotionEye, or other software:
- **Integration type** (frigate, motioneye, etc.)
- **Webhook URLs** (for sending you notifications)
- **API keys** (encrypted, used only for authorized actions)

### 1.4 Mobile App Data
When you use our mobile app:
- **Device type** (iOS or Android)
- **Firebase Cloud Messaging token** (to send push notifications)
- **App version** (for compatibility)
- **Last active timestamp**

### 1.5 Usage Analytics
We collect anonymized usage data:
- **Pages visited** (via Google Analytics)
- **Button clicks** (e.g., "Start camera test")
- **Feature usage** (which features are popular)
- **Error logs** (to fix bugs)

**Analytics are anonymized - we cannot identify individual users.**

### 1.6 Camera Events (Self-Hosted Users Only)
If you enable cloud backup or notifications:
- **Event type** (motion, person detected, doorbell press)
- **Timestamp**
- **Short video clips** (5-30 seconds, only if you enable cloud backup)
- **Snapshot images**

**Event video is stored ONLY if you enable cloud backup. You can delete anytime.**

---

## 2. What We Do NOT Collect

This is just as important as what we DO collect.

### ❌ We Do NOT Collect:
- **Your private camera video feeds** (video stays on your device)
- **Live surveillance footage** (we cannot watch your cameras)
- **Audio recordings** (unless you explicitly upload clips)
- **Biometric data** (facial recognition, fingerprints)
- **Precise home address** (only GPS if you share publicly)
- **Payment card details** (handled by Stripe, not stored by us)
- **Passwords in plain text** (encrypted with bcrypt)
- **Browsing history outside webcam.org**

### 🔐 Technical Proof:

**Private cameras:**
- Stream via WebRTC peer-to-peer (direct device-to-device)
- Or through Tailscale VPN (encrypted tunnel, we're not in the middle)
- We only provide "signaling" (helping devices find each other)

**Self-hosted software:**
- All AI detection runs on YOUR hardware
- Video is stored on YOUR hard drive or cloud storage
- Our plugin only sends event metadata (not video) unless you enable cloud backup

**Open source:**
- Our code is on GitHub: [LINK TO BE ADDED]
- Security researchers can verify these claims
- No hidden data collection

---

## 3. How We Use Your Information

### 3.1 To Provide the Service
- Authenticate your login
- Register and manage your cameras
- Send push notifications (person detected, doorbell press)
- Display public cameras on the map
- Process payments (via Stripe)

### 3.2 To Improve the Service
- Fix bugs and improve performance
- Understand which features are used (anonymous analytics)
- Develop new features based on usage patterns

### 3.3 To Communicate With You
- Send important service updates (downtime, security alerts)
- Respond to support requests
- Send optional newsletters (you can unsubscribe)

### 3.4 To Ensure Safety and Security
- Detect and prevent abuse, fraud, and illegal activity
- Enforce our Terms of Service
- Respond to legal requests (see section 5.4)

### 3.5 What We Do NOT Do
- ❌ Sell your data to third parties
- ❌ Show you targeted ads based on your cameras
- ❌ Share data with police without legal process
- ❌ Train AI models on your private footage
- ❌ Use your cameras for our own surveillance

---

## 4. Data Storage and Security

### 4.1 Where Data is Stored
- **User data:** PostgreSQL database on secure servers in [LOCATION - US East]
- **Metadata:** Encrypted at rest
- **Video clips** (if cloud backup enabled): Amazon S3 with encryption
- **Passwords:** Bcrypt hashed (industry standard)

### 4.2 Security Measures
- HTTPS/TLS encryption for all connections
- Two-factor authentication available
- Regular security audits
- Intrusion detection monitoring
- Encrypted database backups

### 4.3 Data Retention
- **Account data:** Until you delete your account
- **Public camera listings:** Until you remove camera from public directory
- **Cloud backup clips:** 7 days (Plus tier) or 30 days (Pro tier), then auto-deleted
- **Analytics:** 26 months (Google Analytics standard)
- **Logs:** 90 days for security purposes

### 4.4 Your Data After Account Deletion
When you delete your account:
- User data is permanently deleted within 30 days
- Public cameras are immediately removed from directory
- Cloud backup clips are permanently deleted
- Some data may be retained if required by law (e.g., payment records for tax purposes)

---

## 5. Data Sharing and Disclosure

### 5.1 What We Share Publicly
If you mark a camera as PUBLIC:
- Camera name, description, location (GPS coordinates)
- Thumbnail image
- Live stream (visible to anyone viewing the map)

**You control this.** You can make cameras private anytime.

### 5.2 Service Providers
We share limited data with:
- **Firebase** (push notifications) - Google's privacy policy applies
- **Stripe** (payments) - PCI-DSS compliant, we never see full card numbers
- **Amazon S3** (cloud backup storage if enabled) - encrypted
- **Google Analytics** (anonymized usage stats)

These providers are contractually required to protect your data.

### 5.3 Public Camera Directory
Public cameras are listed on our map with:
- Camera name
- Location (GPS)
- Thumbnail
- Live stream access

**This is intentional and controlled by you.** Do not mark cameras public if you want privacy.

### 5.4 Legal Requirements
We may disclose data if required by:
- Valid subpoena or court order
- Legal process (search warrant)
- National security demands (we will challenge overly broad requests)
- Emergencies involving danger to life

**Our Policy:**
- We notify users before disclosure unless legally prohibited
- We require proper legal process (no informal requests)
- We publish transparency reports annually

**Police Access:**
Unlike Ring, we do NOT have agreements with police departments to facilitate warrantless access to user cameras.

### 5.5 Business Transfers
If webcam.org is acquired or merged:
- Your data may be transferred to the new entity
- This policy remains in effect unless you're notified of changes
- You can delete your account before the transfer

---

## 6. Your Rights and Choices

### 6.1 Access Your Data
You can:
- View all your account data in settings
- Export your camera metadata (JSON format)
- Download your cloud backup clips

### 6.2 Control Your Data
You can:
- Edit account information anytime
- Make cameras public or private
- Disable cloud backup
- Opt out of analytics cookies
- Unsubscribe from emails

### 6.3 Delete Your Data
You can:
- Delete individual cameras
- Delete specific cloud clips
- Delete your entire account (permanent)

To delete your account: Settings → Account → Delete Account

### 6.4 Privacy Settings
You control:
- Which cameras are public vs private
- Push notification preferences
- Email notification frequency
- Data sharing preferences

### 6.5 Do Not Track
We respect browser "Do Not Track" signals by:
- Disabling Google Analytics tracking
- Not using advertising trackers

---

## 7. Children's Privacy

webcam.org is not intended for children under 18.

- We do not knowingly collect data from anyone under 18
- If we discover a child's data, we will delete it immediately
- Parents: If your child created an account, contact us at privacy@webcam.org

**Public cameras:**
We prohibit cameras primarily focused on children (schools, playgrounds) without proper authorization and signage.

---

## 8. International Users

### 8.1 Data Location
Our servers are located in the United States. By using webcam.org, you consent to data transfer to the US.

### 8.2 GDPR (European Users)
If you're in the EU/UK, you have additional rights:

**Legal Basis for Processing:**
- Contract (to provide service you signed up for)
- Legitimate interests (service improvement, security)
- Consent (optional features like newsletters)

**Your GDPR Rights:**
- Right to access your data
- Right to rectification (correct errors)
- Right to erasure ("right to be forgotten")
- Right to restrict processing
- Right to data portability (export your data)
- Right to object to processing
- Right to withdraw consent

**Contact our Data Protection Officer:** gdpr@webcam.org

**Supervisory Authority:**
You can lodge complaints with your local data protection authority.

### 8.3 California Users (CCPA)
California residents have rights under the California Consumer Privacy Act:
- Right to know what data is collected
- Right to delete personal information
- Right to opt-out of "sale" of data (we don't sell data, but you can opt-out)
- Right to non-discrimination

**Exercise your rights:** privacy@webcam.org

---

## 9. Changes to This Policy

We may update this Privacy Policy to:
- Reflect changes in the service
- Address new privacy regulations
- Improve clarity

**When we make changes:**
- We update the "Last Updated" date
- We notify you via email for significant changes
- We post an in-app notification
- Continued use after changes = acceptance

**You can always view previous versions:** [LINK TO VERSION HISTORY]

---

## 10. Contact Us

### Privacy Questions or Requests
Email: privacy@webcam.org
Response time: Within 7 business days

### Data Protection Officer (GDPR)
Email: gdpr@webcam.org

### Security Issues
Email: security@webcam.org
For urgent security issues, use our PGP key: [LINK]

### General Support
Email: support@webcam.org
Website: https://webcam.org/support

### Mailing Address
webcam.org
[ADDRESS TO BE ADDED]

---

## Transparency Report

We believe in transparency. We will publish an annual report detailing:
- Number of legal requests received
- Types of data requested
- Number of requests we complied with
- Number of requests we challenged

**First report:** [TO BE PUBLISHED]

---

## Our Commitment

**Privacy is not a feature you pay for at webcam.org - it's our foundation.**

- We will never sell your data
- We will never give warrantless police access
- We will notify you before complying with legal requests (when legally allowed)
- We will keep our code open source so you can verify these promises

**Open Source Verification:**
- Backend: [GITHUB LINK]
- Mobile App: [GITHUB LINK]
- Plugins: [GITHUB LINK]

Security researchers: We welcome audits. Contact security@webcam.org for responsible disclosure.

---

**Questions? Concerns? We're here to help.**

Email: privacy@webcam.org

---

## Document Version

Version: 1.0 (Beta)
Last Updated: 2025-11-04
Effective Date: [TO BE DETERMINED]

---

**By using webcam.org, you acknowledge that you have read and understood this Privacy Policy.**
