# MediClinic Backend Server

Backend API server for MediClinic Medical Management System built with Node.js, Express, and Prisma ORM.

## Features

- 🔐 Authentication & Authorization (JWT)
- 👥 User Management (Admin & Doctors)
- 👨‍⚕️ Patient Management
- 📋 Visit Records with Prescriptions & Tests
- 💊 Medication Management
- 📊 Dashboard Statistics
- 🗄️ SQLite Database (easily upgradeable to PostgreSQL/MySQL)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: SQLite (can be changed to PostgreSQL/MySQL)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```env
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV=development
```

4. Generate Prisma Client:
```bash
npm run db:generate
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Seed the database (optional, creates initial data):
```bash
npm run db:seed
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001` (or the PORT specified in `.env`)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new doctor (admin only)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Users/Doctors
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users/doctors/:id` - Get doctor by ID
- `PUT /api/users/doctors/:id` - Update doctor info (admin only)
- `PUT /api/users/doctors/:id/shift-rates` - Update doctor shift rates (admin only)
- `PUT /api/users/doctors/:id/shift-counts` - Update doctor shift counts (admin only)
- `POST /api/users/doctors/:id/reset-shifts` - Reset doctor shift counts (admin only)
- `DELETE /api/users/doctors/:id` - Delete doctor (admin only)

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/:id/visits` - Get patient visits

### Visits
- `GET /api/visits` - Get all visits
- `GET /api/visits/:id` - Get visit by ID
- `POST /api/visits` - Create visit
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit

### Medications
- `GET /api/medications` - Get all medications
- `GET /api/medications/:id` - Get medication by ID
- `POST /api/medications` - Create medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Default Credentials

After seeding the database:

- **Admin**: 
  - Email: `admin@clinic.com`
  - Password: `admin123`

- **Doctor**: 
  - Email: `sarah@clinic.com`
  - Password: `doctor123`

## Database Management

### View Database in Prisma Studio
```bash
npm run db:studio
```

### Create a New Migration
```bash
npm run db:migrate
```

### Reset Database (⚠️ This will delete all data)
1. Delete the `dev.db` file
2. Run migrations again: `npm run db:migrate`
3. Seed data: `npm run db:seed`

## Switching to PostgreSQL or MySQL

1. Update `DATABASE_URL` in `.env`:
   - PostgreSQL: `postgresql://user:password@localhost:5432/mediclinic`
   - MySQL: `mysql://user:password@localhost:3306/mediclinic`

2. Update `provider` in `prisma/schema.prisma`:
   - For PostgreSQL: `provider = "postgresql"`
   - For MySQL: `provider = "mysql"`

3. Run migrations:
```bash
npm run db:migrate
```

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── routes/                # API route handlers
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── patient.routes.js
│   │   ├── visit.routes.js
│   │   ├── medication.routes.js
│   │   └── dashboard.routes.js
│   ├── middleware/            # Express middleware
│   │   └── auth.middleware.js
│   ├── utils/                 # Utility functions
│   │   └── prisma.js
│   ├── seed.js                # Database seed script
│   └── server.js              # Main server file
├── .env                       # Environment variables (create this)
├── package.json
└── README.md
```

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message"
}
```

## License

ISC

