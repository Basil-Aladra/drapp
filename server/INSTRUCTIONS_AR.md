# تعليمات إعداد قاعدة البيانات - MediClinic

## الخطوات المطلوبة لتشغيل قاعدة البيانات

### 1. تثبيت المتطلبات

تأكد من أن لديك Node.js مثبت على جهازك (الإصدار 18 أو أحدث).

### 2. الانتقال إلى مجلد الـ Server

```bash
cd server
```

### 3. تثبيت المكتبات المطلوبة

```bash
npm install
```

### 4. إنشاء ملف البيئة (.env)

أنشئ ملف `.env` في مجلد `server` واكتب فيه:

```env
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV=development
```

**ملاحظة مهمة**: غير قيمة `JWT_SECRET` إلى مفتاح سري قوي في بيئة الإنتاج!

### 5. إنشاء قاعدة البيانات

قم بتنفيذ الأوامر التالية بالترتيب:

```bash
# إنشاء Prisma Client
npm run db:generate

# إنشاء جداول قاعدة البيانات
npm run db:migrate

# إضافة بيانات تجريبية (اختياري)
npm run db:seed
```

### 6. تشغيل الخادم

للتطوير:
```bash
npm run dev
```

للإنتاج:
```bash
npm start
```

الخادم سيعمل على: `http://localhost:3001`

## بيانات الدخول الافتراضية

بعد إضافة البيانات التجريبية (`npm run db:seed`):

- **المدير (Admin)**:
  - البريد: `admin@clinic.com`
  - كلمة المرور: `admin123`

- **الطبيب (Doctor)**:
  - البريد: `sarah@clinic.com`
  - كلمة المرور: `doctor123`

## استخدام قاعدة البيانات

بعد تشغيل الخادم، يمكنك الوصول إلى الـ API من التطبيق الأمامي (Frontend) على:

```
http://localhost:3001/api
```

### أمثلة على الاستخدام:

1. **تسجيل الدخول**:
```
POST http://localhost:3001/api/auth/login
Body: {
  "email": "admin@clinic.com",
  "password": "admin123"
}
```

2. **الحصول على جميع المرضى** (يتطلب تسجيل الدخول):
```
GET http://localhost:3001/api/patients
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## إدارة قاعدة البيانات

### عرض قاعدة البيانات

استخدم Prisma Studio لعرض وتعديل البيانات:

```bash
npm run db:studio
```

سيتم فتح متصفح تلقائياً على `http://localhost:5555`

### إنشاء نسخة احتياطية

انسخ ملف `dev.db` من مجلد `server` لحفظ نسخة من قاعدة البيانات.

### إعادة تعيين قاعدة البيانات

إذا أردت حذف جميع البيانات وإعادة البدء:

1. احذف ملف `dev.db`
2. نفذ الأوامر التالية:
```bash
npm run db:migrate
npm run db:seed
```

## المشاكل الشائعة وحلولها

### الخطأ: "Cannot find module '@prisma/client'"
**الحل**: نفذ `npm install` ثم `npm run db:generate`

### الخطأ: "Migration failed"
**الحل**: احذف مجلد `prisma/migrations` وملف `dev.db` ثم نفذ `npm run db:migrate` مرة أخرى

### الخطأ: "Port already in use"
**الحل**: غير رقم المنفذ (PORT) في ملف `.env` إلى رقم آخر

## الترقية إلى PostgreSQL أو MySQL

إذا كنت تريد استخدام قاعدة بيانات أقوى:

1. ثبت PostgreSQL أو MySQL على جهازك
2. غيّر `DATABASE_URL` في `.env`:
   - PostgreSQL: `postgresql://user:password@localhost:5432/mediclinic`
   - MySQL: `mysql://user:password@localhost:3306/mediclinic`
3. غيّر `provider` في `prisma/schema.prisma`:
   - PostgreSQL: `provider = "postgresql"`
   - MySQL: `provider = "mysql"`
4. نفذ `npm run db:migrate`

## المساعدة

لمزيد من المعلومات، راجع ملف `README.md` في نفس المجلد.

