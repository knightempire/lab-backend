# Lab Tracker Backend
The Lab Tracker Backend is a **Node.js/Express** application with a **MongoDB** database, providing REST APIs for managing lab products, requests, issues, returns, users, and admin workflows. It handles authentication, data management, notifications, and integrates with the frontend for a complete Lab Tracker system.

## 🚀 Features
**Authentication & User Management:** Login, signup, forgot password, reset password, JWT-based authentication, refresh tokens, "Remember Me".  
**Product Management:** Add, update, delete, filter, search, sort products, track stock, low stock indicators, bulk-add products.  
**Request / Issue Management:** Create, review, reissue, return requests/issues, timeline tracking, close request feature, reissued request flow v2, correct return logic for damaged/replaced/normal items.  
**Admin Features:** Admin dashboard analytics APIs, admin profile API, notifications API (including mobile optimization), request/issue/reissue management, staff notifications, table redesigns, API endpoints for all admin workflows.  
**UI / UX Backend Integrations:** APIs supporting frontend dashboards (charts: bar, pie, line, radar), user and admin pages, product sorting, filtering, pagination, low stock table, checkout, and issued pages.  
**DevOps / Deployment:** Dockerfile & docker-compose support, server-compose YAML, proxy server configuration, production & staging deployment, continuous integration updates.

## 🛠 Tech Stack
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Authentication & Security:** JWT, bcrypt, dotenv  
**Email & Notifications:** Nodemailer, SMTP integrations  
**DevOps / Deployment:** Docker, docker-compose, server YAML, staging & production deployment

## ⚡ Getting Started
**Prerequisites:** Node.js v18+, npm or yarn, Docker (optional), MongoDB instance  
**Installation:**  
1. Clone the repo: `git clone https://github.com/knightempire/lab-backend.git && cd lab-backend`  
2. Install dependencies: `npm install` or `yarn install`  
3. Create `.env` file and add necessary variables 
4. Run development server: `npm run dev` or `yarn dev`  
API runs at [http://localhost:5000](http://localhost:5000)

**Build for Production:** `npm run build && npm start`

## 🧑‍💻 Core Development Team
- Abinesh – Lead Developer / Full-stack / Maintainer (@knightempire)  
- Raam Prathap R V – Backend Developer (@Raamprathap)  
- Akshay K S – Frontend Developer (@akshayks13)  
- Santhosh A S – Frontend Developer (@Santhosh292K)  
- Sharan K – QA / Testing / Maintainer (@Sharan450522)

**Special Thanks:** Shibi S. Kumar (@shibi1306) – Client, continuous guidance and support

## 📝 Contributing
1. Fork the repo  
2. Create a branch: `git checkout -b feature/my-feature`  
3. Commit changes: `git commit -m "Add my feature"`  
4. Push branch: `git push origin feature/my-feature`  
5. Open Pull Request

## 📦 License
MIT License. See [LICENSE](LICENSE)

## 🔗 Links
- Backend Repository: [https://github.com/knightempire/lab-backend](https://github.com/knightempire/lab-backend)  
- Frontend Repository: [https://github.com/knightempire/lab-frontend](https://github.com/knightempire/lab-frontend)  
- Full Release Changelog: [v1.0.0 Release](https://github.com/knightempire/lab-backend/commits/v1-release)

