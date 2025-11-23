# Real-Time Women Safety & Crime Alert Platform

A smart, real-time platform to ensure women's safety using advanced tracking, instant emergency alerts, and secure communication.

---

## Objectives

- **Real-Time Location Tracking:** Continuous, live GPS tracking for women during travel or emergencies.
- **Instant Emergency Alerts:** One-tap SOS alerts to nearby police, emergency contacts, and helplines.
- **Automated Police Connectivity:** Auto-routes alerts to the nearest available police station.
- **Anonymity & Security:** Protects user identity while forwarding necessary data to authorities.
- **Culprit Identification:** Secure upload of suspect photos/videos, sent directly to the police.
- **24/7 Background System:** App runs safely in the background, always ready for emergencies.

---

## Features & Deliverables

1. **User Registration and Login**
   - Secure sign up/login (JWT authentication).
   - Guest/anonymous mode for emergencies.

2. **Real-Time Tracking**
   - Live user location tracking via GPS.
   - Shares tracking links with police, friends, or family.

3. **Emergency SOS System**
   - One-click SOS alert: Notifies police & helplines promptly.
   - Escalates alert to next station if nearest one is unavailable.
   - Police see high-priority alert with user’s exact location.

4. **Auto Location Detection**
   - Automated, precise GPS detection during incident reporting.
   - Reports logged with time, coordinates, and device info.

5. **Police Station Connectivity**
   - All stations digitally connected for seamless alerts.
   - Nearby stations communicate for quick action.

6. **Image/Video Evidence Submission**
   - Users can instantly upload images/videos of suspects.
   - Content securely sent to police and stored anonymously in the cloud.

---

## Advanced Features

- **Heat Maps & Risk Zones:**
  - Visualizes unsafe areas by aggregating incident reports.
- **24/7 Background Monitoring:**
  - Background app auto-detects deviations, sudden stops, and emergencies.
- **Multilingual Support:**
  - Available in multiple languages.
- **Family/Friend Alert System:**
  - Send parallel SOS and live location to pre-chosen contacts.

---

## Technology Stack

- **Backend:** Node.js, Express.js (REST APIs)
- **Database:** MongoDB
- **Frontend:** React.js with React Router
- **Authentication:** JWT Tokens
- **Real-Time:** Push Notifications & WebSockets
- **Geolocation:** Native browser & mobile APIs

---

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB instance
- [Optional] Docker (for easy setup)

### Setup

#### 1. Backend (Node.js/Express)
```bash
cd backend
npm install
npm start
```

#### 2. Frontend (React.js)
```bash
cd frontend
npm install
npm start
```

### Configuration

- Set up environment variables in `.env` files for backend and frontend (see `.env.example`).
- Add MongoDB URI, JWT secret, and third-party API keys.

---

## Usage

- Register or login as a user, or use guest mode for quick SOS.
- Allow location permissions for real-time tracking.
- Upload media evidence when needed.
- SOS button triggers notifications to emergency contacts & nearest police station.

---

## Contributing

We welcome contributions! Please fork the repository and submit pull requests.

---

## License

Distributed under the MIT License.

---

## Contact

For suggestions, please open an issue or contact the maintainer.
