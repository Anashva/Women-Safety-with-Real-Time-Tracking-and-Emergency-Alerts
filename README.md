# 🛡️ Women Safety Platform
### Real-Time Tracking & Emergency Alert System

<div align="center">

![Platform Banner](https://img.shields.io/badge/Safety-First-FF69B4?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A comprehensive safety platform empowering women with real-time tracking, instant emergency alerts, and secure communication channels.**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-features) • [🤝 Contributing](#-contributing) • [💬 Support](#-support)

</div>

---

## 🌟 Overview

The **Women Safety Platform** is a cutting-edge web and mobile application designed to ensure women's safety through advanced technology. It combines real-time GPS tracking, instant emergency alerts, automated police connectivity, and secure evidence submission in one comprehensive solution.

### 🎯 Core Objectives

- ✅ **Real-Time Location Tracking** - Continuous GPS monitoring
- ✅ **Instant Emergency Alerts** - One-tap SOS system
- ✅ **Automated Police Connectivity** - Direct connection to nearest station
- ✅ **Anonymity & Security** - End-to-end encryption
- ✅ **Evidence Collection** - Image/video submission capability
- ✅ **24/7 Background Monitoring** - Always-on protection

---

## ✨ Key Features

### 🔐 Core Safety Features

| Feature | Description | Status |
|---------|-------------|--------|
| **User Authentication** | Secure JWT-based login/registration | ✅ Active |
| **Real-Time GPS Tracking** | Continuous location monitoring | ✅ Active |
| **Emergency SOS Button** | One-tap emergency alert system | ✅ Active |
| **Auto Location Detection** | Automatic GPS coordinates capture | ✅ Active |
| **Police Station Integration** | Direct alerts to nearest station | ✅ Active |
| **Evidence Upload** | Image/Video submission support | ✅ Active |

### 🚀 Advanced Features

- 🗺️ **Heat Maps & Risk Zones** - Visual crime density mapping
- 👨‍👩‍👧 **Family Alert System** - Notify trusted contacts instantly
- 🌐 **Multilingual Support** - Accessible in multiple languages
- 📊 **Analytics Dashboard** - Crime statistics and trends
- 🔔 **Push Notifications** - Real-time alerts via WebSockets
- 👤 **Guest Mode** - Quick SOS without registration

---

## 🛠️ Technology Stack

<div align="center">

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

### Additional Technologies
- 🌍 **Geolocation API** - Browser & Mobile GPS
- 📡 **WebSockets** - Real-time communication
- 🔒 **bcrypt** - Password encryption
- 📧 **Nodemailer** - Email notifications

</div>

---

## 🚀 Quick Start

Get up and running in less than 5 minutes!

```bash
# Clone the repository
git clone https://github.com/Anashva/Women-Safety-with-Real-Time-Tracking-and-Emergency-Alerts.git

# Navigate to project directory
cd Women-Safety-with-Real-Time-Tracking-and-Emergency-Alerts

# Install dependencies for both frontend and backend
npm run install-all

# Start the application
npm run dev
```

**That's it!** 🎉 The application will be running on:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

---

## 📦 Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager
- **Git** - Version control

### Step-by-Step Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Anashva/Women-Safety-with-Real-Time-Tracking-and-Emergency-Alerts.git
cd Women-Safety-with-Real-Time-Tracking-and-Emergency-Alerts
```

#### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

#### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

#### 4️⃣ Database Setup

```bash
# Start MongoDB service
mongod

# Create database (in MongoDB shell)
use women_safety_db
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=8080

# Database
MONGODB_URI=mongodb://localhost:27017/women_safety_db

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Server Configuration
PORT=3000
```

---

## 📱 Usage Guide

### For Users

#### 1. Registration/Login

```
1. Open the application
2. Click "Register" or "Login"
3. Fill in required details
4. Verify email (if required)
5. Grant location permissions
```

#### 2. Setting Up Profile

```
1. Navigate to Settings → Profile
2. Update your personal information
3. Grant location permissions
4. Save your settings
```

#### 3. Using SOS Feature

```
🚨 IN CASE OF EMERGENCY:

1. Press and hold the SOS button for 3 seconds
2. Your location will be automatically sent to:
   - All emergency contacts
   - Nearest police station
   - Platform administrators
3. Audio/video recording starts automatically
4. Continue holding for continuous updates
```

#### 4. Uploading Evidence

```
1. Click "Upload Evidence"
2. Select images/videos from device
3. Add optional description
4. Submit (files are encrypted before upload)
```

#### 5. Viewing Safe/Unsafe Zones

```
1. Navigate to "Heat Map" section
2. View color-coded areas:
   - 🟢 Green = Safe zones
   - 🟡 Yellow = Moderate risk
   - 🔴 Red = High risk areas
3. Plan your routes accordingly
```

### For Administrators

#### Police Dashboard Access

```
1. Login with police credentials
2. Access real-time alert dashboard
3. View active emergencies on map
4. Respond to alerts
5. Update case status
```

---

## 📁 Project Structure

```
women-safety-app/
│
├── 📁 backend/                      # Node.js + Express (API + MongoDB)
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   └── db.js                # MongoDB connection
│   │   ├── 📁 models/
│   │   │   ├── User.js              # User schema
│   │   │   ├── Alert.js             # Alert schema
│   │   │   └── PoliceStation.js     # Police station schema
│   │   ├── 📁 routes/
│   │   │   ├── userRoutes.js        # User API routes
│   │   │   ├── alertRoutes.js       # Alert API routes
│   │   │   └── policeRoutes.js      # Police API routes
│   │   ├── 📁 controllers/
│   │   │   ├── userController.js    # User business logic
│   │   │   ├── alertController.js   # Alert handling logic
│   │   │   └── policeController.js  # Police operations logic
│   │   ├── 📁 utils/
│   │   │   ├── sendNotification.js  # Push notification service
│   │   │   └── getRiskLevel.js      # Risk assessment utility
│   │   ├── 📁 upload/               # File upload directory
│   │   └── server.js                # Main Express server
│   └── package.json
│
├── 📁 frontend/                     # React App
│   ├── 📁 public/                   # Static files
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── EmergencyButton.jsx  # SOS button component
│   │   │   ├── MapTracking.jsx      # Real-time location map
│   │   │   └── AlertHistory.jsx     # Alert history display
│   │   ├── 📁 pages/
│   │   │   ├── 📁 Home/
│   │   │   │   └── Home.jsx         # Landing page
│   │   │   ├── 📁 Register/
│   │   │   │   ├── UserRegister.jsx # User registration
│   │   │   │   └── PoliceRegister.jsx # Police registration
│   │   │   ├── 📁 Login/
│   │   │   │   ├── UserLogin.jsx    # User login page
│   │   │   │   └── PoliceLogin.jsx  # Police login page
│   │   │   └── 📁 Dashboard/
│   │   │       ├── UserDashboard.jsx # User dashboard
│   │   │       └── PoliceDashboard.jsx  # Police admin dashboard
│   │   ├── 📁 services/
│   │   │   └── api.js               # Axios API calls
│   │   ├── App.js                   # Main React component
│   │   └── index.js                 # Entry point
│   └── package.json
│
├── .env                             # Environment variables
├── package.json                     # Root package file
└── README.md                        # Project documentation
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork the repository**
   ```bash
   git fork https://github.com/Anashva/Women-Safety-Platform.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues

### Contribution Guidelines

- ✅ Follow the existing code style
- ✅ Write meaningful commit messages
- ✅ Update documentation as needed
- ✅ Test your changes thoroughly
- ✅ Be respectful and inclusive

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** MongoDB connection failed
```bash
Solution: Ensure MongoDB is running
sudo service mongod start
```

**Issue:** Port already in use
```bash
Solution: Change port in .env file or kill existing process
lsof -ti:5000 | xargs kill -9
```

**Issue:** Location permission denied
```bash
Solution: Enable location services in browser settings
Chrome → Settings → Privacy → Location
```

---

## 📊 Roadmap

- [ ] Mobile App (React Native)
- [ ] AI-based threat detection
- [ ] Offline mode support
- [ ] Voice-activated SOS
- [ ] Integration with smart wearables
- [ ] Community safety features
- [ ] Multi-language support expansion

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Women Safety Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 💬 Support

Need help? We're here for you!

- 📧 **Email:** support@womensafety.com
- 💬 **Discord:** [Join our community](https://discord.gg/womensafety)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Anashva/Women-Safety-Platform/issues)
- 📖 **Docs:** [Full Documentation](https://docs.womensafety.com)

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped build this platform
- Special thanks to law enforcement agencies for their cooperation
- Inspired by initiatives to make the world safer for everyone

---

<div align="center">

**Made with ❤️ for a safer tomorrow**

[⬆ Back to Top](#️-women-safety-platform)

</div>
