# 🎓 شرح Component Diagram بالتفصيل

## 📋 1. المقدمة

الـ **Component Diagram** بيوضح البنية المعمارية للنظام ويقسمه لـ **4 مكونات رئيسية** بتتواصل مع بعضها عن طريق **Interfaces**.  

---

## 🏗️ 2. المكونات الرئيسية الأربعة

### أ) Browser Extension (الإضافة على المتصفح) 🌐

**المكونات:**

| Component | Stereotype | الوظيفة |
|-----------|------------|---------|
| **Extension UI** | `<<presentation>>` | واجهة المستخدم - الـ Popup اللي بيضغط عليها المستخدم عشان يبدأ الفحص |
| **Background Service** | `<<service>>` | الخدمة اللي بتشتغل في الخلفية وتراقب الـ Tabs وتدير العمليات |
| **Content Script** | `<<script>>` | السكريبت اللي بيتحقن في صفحة الويب عشان يحلل الـ DOM والـ Forms |
| **Auth Manager** | `<<security>>` | بيدير الـ Authentication وبيخزن الـ JWT Token |

**التدفق الداخلي:**
```
Extension UI → Background Service → Content Script
```

- المستخدم يضغط "Scan" من الـ UI
- الـ Background Service يستقبل الأمر
- يحقن الـ Content Script في الصفحة النشطة

---

### ب) Security Analyzer (محلل الثغرات) 🔍

**المكونات:**

| Component | Stereotype | الوظيفة |
|-----------|------------|---------|
| **XSS Detector** | `<<analyzer>>` | يكشف ثغرات Cross-Site Scripting في الـ DOM |
| **SQL Injection Detector** | `<<analyzer>>` | يفحص Forms والـ URL Parameters لكشف حقن SQL |
| **CSRF Detector** | `<<analyzer>>` | يتحقق من وجود CSRF Tokens في الـ Forms |
| **Issue Aggregator** | `<<controller>>` | يجمع كل الثغرات المكتشفة وينظمها |

**التدفق:**
```
Content Script → Detectors (XSS, SQLi, CSRF) → Issue Aggregator
```

- الـ Content Script بيبعت محتوى الصفحة للـ Detectors
- كل Detector بيفحص نوع معين من الثغرات
- النتائج بتتجمع في الـ Issue Aggregator

---

### ج) Backend Server (الخادم الخلفي) ⚙️

**المكونات:**

| Component | Stereotype | الوظيفة |
|-----------|------------|---------|
| **API Gateway** | `<<gateway>>` | نقطة الدخول الوحيدة - كل الطلبات بتمر من هنا |
| **Authentication Service** | `<<security>>` | يتحقق من الـ JWT Token ويصادق على المستخدم |
| **Scan Processor** | `<<service>>` | يعالج نتائج الفحص ويحللها |
| **Database** | `<<storage>>` | يخزن بيانات المستخدمين ونتائج الفحوصات |

**التدفق:**
```
API Gateway → Authentication Service → Scan Processor → Database
```

- الطلب يدخل من الـ API Gateway
- يتحقق من الـ Token في الـ Authentication Service
- لو صحيح، يرسل للـ Scan Processor
- النتائج تتخزن في الـ Database

---

### د) Web Dashboard (لوحة التحكم) 📊

**المكونات:**

| Component | Stereotype | الوظيفة |
|-----------|------------|---------|
| **Login/Register** | `<<presentation>>` | صفحة تسجيل الدخول والاشتراك |
| **Dashboard UI** | `<<presentation>>` | الواجهة الرئيسية - عرض قائمة الفحوصات |
| **Reports & Charts** | `<<presentation>>` | عرض النتائج بشكل بصري (رسومات بيانية) |

---

## 🔗 3. الـ Interfaces (واجهات الاتصال)

**Interface معناها إيه؟**

واجهة الاتصال هي **عقد** بين مكونين - بتحدد إزاي يتواصلوا مع بعض.  

**الـ Interfaces الموجودة:**

| Interface | الربط | الوظيفة |
|-----------|-------|---------|
| **IAuth** | Auth Manager ↔ Authentication Service | تبادل الـ JWT Tokens للمصادقة |
| **IScanAPI** | Issue Aggregator ↔ API Gateway | إرسال نتائج الفحص للـ Backend |
| **IUserAPI** | Dashboard UI ↔ API Gateway | طلب بيانات المستخدم والفحوصات |

---

## 🔄 4. تدفق البيانات (الأسهم)

### 🔹 Flow 1: Extension Scan Flow (الفحص من الإضافة)

```
1.  Extension UI → Background Service
   (المستخدم يضغط "Start Scan")

2. Background Service → Content Script
   (حقن السكريبت في الصفحة)

3. Content Script → XSS/SQLi/CSRF Detectors
   (تحليل الصفحة)

4.  Detectors → Issue Aggregator
   (جمع الثغرات المكتشفة)

5.  Issue Aggregator → IScanAPI → API Gateway
   (إرسال النتائج للـ Backend)

6. API Gateway → Scan Processor → Database
   (تخزين النتائج)
```

**الأسهم:**
- **→** (سهم عادي): اتجاه تدفق البيانات أو استدعاء دالة

---

### 🔹 Flow 2: Authentication Flow (المصادقة)

```
1. Auth Manager → IAuth
   (طلب Token)

2. IAuth → Authentication Service
   (التحقق من الـ Token)

3. Authentication Service → API Gateway
   (إرجاع نتيجة المصادقة)
```

**الخط المنحني من Auth Manager → IAuth:**
- يوضح أن الـ Extension بتستخدم Interface للتواصل مع الـ Backend

---

### 🔹 Flow 3: Dashboard View Flow (عرض النتائج)

```
1. Login/Register → IAuth
   (تسجيل الدخول)

2. Dashboard UI → IUserAPI
   (طلب بيانات الفحوصات)

3. IUserAPI → API Gateway
   (الطلب يصل للـ Backend)

4. API Gateway → Database
   (جلب البيانات)

5. Database → Reports & Charts
   (عرض النتائج بصرياً)
```

---

## 📌 5. شرح الاختصارات (Stereotypes)

| Stereotype | المعنى | مثال |
|------------|--------|------|
| `<<component>>` | مكون رئيسي في النظام | Browser Extension, Backend Server |
| `<<presentation>>` | طبقة العرض (UI) | Extension UI, Dashboard UI |
| `<<service>>` | طبقة الخدمات (Business Logic) | Background Service, Scan Processor |
| `<<script>>` | سكريبت قابل للتنفيذ | Content Script |
| `<<security>>` | مكون أمني | Auth Manager, Authentication Service |
| `<<analyzer>>` | محلل متخصص | XSS Detector, SQLi Detector |
| `<<controller>>` | منسق بين المكونات | Issue Aggregator |
| `<<gateway>>` | بوابة API | API Gateway |
| `<<storage>>` | تخزين البيانات | Database |

---

## 🎯 6. الخلاصة

الـ Component Diagram بيوضح:

- **تقسيم النظام** إلى 4 مكونات رئيسية مستقلة
- **التواصل بينهم** عن طريق Interfaces محددة
- **تدفق البيانات** من Extension → Security Analyzer → Backend → Dashboard
- **الفصل بين الطبقات**: UI منفصلة عن Business Logic منفصلة عن Database
- **الأمان**: كل طلب لازم يمر بـ Authentication

---

## 🗣️ نصائح للعرض

**ابدأ كده:**
"الـ Component Diagram بيقسم النظام لـ 4 أجزاء رئيسية..."

**اشرح الأجزاء:**
"أول حاجة الـ Browser Extension اللي فيها 4 مكونات..."

**وضح الـ Interfaces:**
"المكونات دي بتتواصل مع بعضها عن طريق Interfaces - زي IAuth و IScanAPI..."

**اشرح الـ Flow:**
"لما المستخدم يعمل Scan، بيحصل الآتي..."

**اختم:**
"التصميم ده بيضمن إن كل component يشتغل بشكل مستقل وسهل الصيانة والتطوير."

---

**جاهز للعرض!  🚀🎉**
