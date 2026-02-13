# CharityHelper - Family Aid Management System

A comprehensive full-stack web application for managing charity operations, family registrations, and aid distribution with support for recurring aid (monthly/yearly) and multilingual interface (English/Arabic).

## 🌟 Features

### Family Management
- **Family Registration** - Register families with detailed information (head of family + members)
- **Member Management** - Track family members with roles, clothing sizes, and personal details
- **Search & Filter** - Quick search by name or national ID
- **Edit & Update** - Full CRUD operations for families and members

### Aid Distribution
- **Multiple Aid Types**
  - Family Aid - Aid for entire families
  - Individual Aid - Aid for specific family members
- **Recurrence Types**
  - **Custom (One-time)** - Single occurrence
  - **Monthly** - Automatically appears in every monthly report
  - **Yearly** - Appears annually on the same month
- **Aid History** - Complete audit trail of all aid distributions

### Reporting System
- **Clothing Sheet** - Generate lists of clothing sizes for all families
- **Family Status** - Overview of family income and total aid received
- **Members Details** - Detailed member information across all families
- **Aid History** - Filter by month/year or date range to view recurring aids
- **Export to Excel** - Export all reports to spreadsheet format

### Localization
- **Bilingual Support** - Full English and Arabic localization
- **RTL Support** - Proper right-to-left layout for Arabic
- **Language Toggle** - Switch languages on the fly

### Network Access
- **LAN Access** - Access from any device on your network
- **Mobile Friendly** - Responsive design for phones and tablets

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **Prisma ORM** - Database management
- **SQLite** - Lightweight database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **XLSX** - Excel export functionality

## 📋 Prerequisites

- **Node.js** 16+ and npm
- **Windows OS** (for run.bat script)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd CharityHelper
```

### 2. Install Dependencies

**Install root dependencies:**
```bash
npm install
```

**Install server dependencies:**
```bash
cd server
npm install
cd ..
```

**Install client dependencies:**
```bash
cd client
npm install
cd ..
```

### 3. Database Setup

```bash
cd server
npx prisma migrate dev
npx prisma generate
cd ..
```

### 4. Run the Application

**Option A: Using run.bat (Windows)**
```bash
run.bat
```
This opens both server and client in separate windows with network access enabled.

**Option B: Manual Start**

Terminal 1 (Server):
```bash
cd server
npm start
```

Terminal 2 (Client):
```bash
cd client
npm run dev
```

### 5. Access the Application

- **Local Access**: http://localhost:5173
- **Network Access**: http://[your-ip]:5173 (shown in terminal)

## 📁 Project Structure

```
CharityHelper/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── pages/         # Main application pages
│   │   ├── utils/         # Utility functions
│   │   ├── translations.js # Localization strings
│   │   └── main.jsx       # Application entry point
│   └── package.json
│
├── server/                # Backend Express application
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── dev.db         # SQLite database
│   ├── middleware/        # Express middlewares
│   ├── index.js           # Server entry point
│   └── package.json
│
├── run.bat               # Windows launcher script
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env` in the `server` folder:

```env
PORT=3000
JWT_SECRET=your-secret-key-here
```

### Database

The app uses SQLite by default. To use PostgreSQL or MySQL:

1. Update `server/prisma/schema.prisma`
2. Update the `datasource` block
3. Run `npx prisma migrate dev`

## 📱 Network Access

The application is configured for network access out of the box:

- **Server**: Listens on `0.0.0.0:3000`
- **Client**: Vite runs with `--host` flag
- **run.bat**: Displays network URLs automatically

Access from mobile/tablet:
1. Run the application
2. Note the Network IP shown (e.g., `192.168.1.100`)
3. Open that URL on any device on the same WiFi

## 🔐 Default Login

Create an account using the registration page, or seed the database with:

```bash
cd server
npx prisma db seed
```

## 📊 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Families
- `GET /api/families` - Get all families
- `GET /api/families/:id` - Get single family
- `POST /api/families` - Create family
- `PUT /api/families/:id` - Update family
- `DELETE /api/families/:id` - Delete family

### Aid Management
- `GET /api/aid` - Get aid history (supports `month`, `year`, `startDate`, `endDate` params)
- `POST /api/aid` - Create aid
- `PUT /api/aid/:id` - Update aid
- `DELETE /api/aid/:id` - Delete aid

### Reports
- `GET /api/reports/clothing` - Get clothing sheet
- `GET /api/reports/family-aids` - Get family aids report

## 🌍 Localization

### Adding New Translations

Edit `client/src/translations.js`:

```javascript
export const translations = {
  en: {
    myNewKey: "English Text",
    // ...
  },
  ar: {
    myNewKey: "النص العربي",
    // ...
  }
};
```

Use in components:
```javascript
const { t } = useLanguage();
<h1>{t('myNewKey')}</h1>
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process-id> /F
```

**Database issues:**
```bash
cd server
npx prisma migrate reset
npx prisma generate
```

**Client won't start:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Features Roadmap

- [ ] PDF export for reports
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Backup and restore functionality
- [ ] Multi-tenant support

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Built for charity organizations to streamline aid distribution
- Designed with simplicity and accessibility in mind
- Special thanks to all contributors

---

**Made with ❤️ for those who help others**
