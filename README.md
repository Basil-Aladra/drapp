# MediClinic - Medical Clinic Management System 🏥

نظام إدارة عيادة طبية متكامل مع واجهة أمامية (React + TypeScript) وخادم خلفي (Node.js + Express + Prisma).

## ✨ المميزات

- 🔐 نظام مصادقة كامل (JWT)
- 👨‍⚕️ إدارة الأطباء والموظفين
- 👥 إدارة المرضى والملفات الطبية
- 📋 إدارة الزيارات والفحوصات
- 💊 إدارة الأدوية والمخزون
- 📊 لوحة تحكم شاملة مع إحصائيات
- 💰 تتبع الديون والمدفوعات
- 📈 حساب رواتب الأطباء تلقائياً

## 🛠️ التقنيات المستخدمة

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Query

### Backend
- Node.js
- Express.js
- Prisma ORM
- SQLite (قابل للترقية إلى PostgreSQL/MySQL)
- JWT Authentication
- bcryptjs

## 📦 بنية المشروع

```
DR2/
├── src/                    # Frontend (React)
│   ├── components/         # مكونات React
│   ├── pages/             # صفحات التطبيق
│   ├── contexts/          # Context API
│   └── types/             # TypeScript Types
├── server/                # Backend (Node.js)
│   ├── src/
│   │   ├── routes/        # API Routes
│   │   ├── middleware/    # Express Middleware
│   │   └── utils/         # Utilities
│   └── prisma/            # Database Schema
└── public/                # ملفات ثابتة
```

## 🚀 البدء السريع

### 1. استنساخ المشروع

```bash
git clone https://github.com/Basil-Aladra/drapp.git
cd drapp
```

### 2. إعداد Backend

```bash
cd server
npm install

# إنشاء ملف .env
echo "PORT=3001" > .env
echo 'DATABASE_URL="file:./dev.db"' >> .env
echo 'JWT_SECRET="your-secret-key"' >> .env
echo "NODE_ENV=development" >> .env

# إعداد قاعدة البيانات
npm run db:generate
npm run db:migrate
npm run db:seed

# تشغيل الخادم
npm run dev
```

الخادم سيعمل على: `http://localhost:3001`

### 3. إعداد Frontend

```bash
# العودة للمجلد الرئيسي
cd ..

# تثبيت المكتبات
npm install

# تشغيل التطبيق
npm run dev
```

التطبيق سيعمل على: `http://localhost:8080`

## 🔑 بيانات الدخول الافتراضية

بعد تشغيل `npm run db:seed` في مجلد server:

- **المدير (Admin)**
  - Email: `admin@clinic.com`
  - Password: `admin123`

- **الطبيب (Doctor)**
  - Email: `sarah@clinic.com`
  - Password: `doctor123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - تسجيل طبيب جديد
- `GET /api/auth/me` - معلومات المستخدم الحالي

### Patients
- `GET /api/patients` - جميع المرضى
- `POST /api/patients` - إضافة مريض
- `GET /api/patients/:id` - مريض محدد
- `PUT /api/patients/:id` - تحديث مريض
- `DELETE /api/patients/:id` - حذف مريض

### Visits
- `GET /api/visits` - جميع الزيارات
- `POST /api/visits` - إضافة زيارة
- `PUT /api/visits/:id` - تحديث زيارة
- `DELETE /api/visits/:id` - حذف زيارة

### Medications
- `GET /api/medications` - جميع الأدوية
- `POST /api/medications` - إضافة دواء
- `PUT /api/medications/:id` - تحديث دواء
- `DELETE /api/medications/:id` - حذف دواء

### Doctors
- `GET /api/users/doctors` - جميع الأطباء
- `PUT /api/users/doctors/:id` - تحديث معلومات طبيب
- `PUT /api/users/doctors/:id/shift-rates` - تحديث أسعار التحولات

### Dashboard
- `GET /api/dashboard/stats` - إحصائيات Dashboard

## 📚 التوثيق

- [دليل الإعداد الكامل - Backend](server/SETUP_GUIDE_AR.md)
- [بدء سريع - Backend](server/QUICK_START_AR.md)
- [تعليمات - Backend](server/INSTRUCTIONS_AR.md)
- [Backend README (English)](server/README.md)

## 🔧 التطوير

### تشغيل في وضع التطوير

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### بناء للإنتاج

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

## 📝 ملاحظات مهمة

- قاعدة البيانات SQLite مخزنة محلياً في `server/prisma/dev.db`
- ملف `.env` مطلوب في مجلد `server` لتشغيل الخادم
- لا ترفع ملف `.env` على GitHub (مضاف في `.gitignore`)
- قاعدة البيانات SQLite يمكن ترقيتها لـ PostgreSQL/MySQL بسهولة

## 🗄️ قاعدة البيانات

المشروع يستخدم Prisma ORM مع SQLite. للترقية إلى PostgreSQL أو MySQL:

1. غيّر `provider` في `server/prisma/schema.prisma`
2. حدّث `DATABASE_URL` في `.env`
3. نفّذ `npm run db:migrate`

## 🤝 المساهمة

المساهمات مرحب بها! يرجى فتح Pull Request أو Issue.

## 📄 الترخيص

ISC

## 👤 المؤلف

[Basil Aladra](https://github.com/Basil-Aladra)

## 🔗 الروابط

- **المستودع:** https://github.com/Basil-Aladra/drapp
- **Backend API:** http://localhost:3001/api
- **Frontend:** http://localhost:8080

---

**تم بناء هذا المشروع باستخدام ❤️**