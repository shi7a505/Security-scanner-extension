# Component Diagram شرح تفصيلي

## 1. المقدمة

الـ **Component Diagram** بيوضح البنية المعمارية للنظام ويقسمه لـ 4
مكونات رئيسية بتتواصل مع بعضها عن طريق **Interfaces**.

------------------------------------------------------------------------

## 2. المكونات الرئيسية الأربعة

### أ) Browser Extension (الإضافة على المتصفح) 🌐

#### المكونات:

  | Component         | Stereotype       | الوظيفة                                                                 |
|------------------|----------------|------------------------------------------------------------------------|
| Extension UI      | <<presentation>> | واجهة المستخدم - الـ Popup اللي بيضغط عليها المستخدم عشان يبدأ الفحص |
| Background Service| <<service>>      | الخدمة اللي بتشتغل في الخلفية وتراقب الـ Tabs وتدير العمليات        |
| Content Script    | <<script>>       | السكريبت اللي بيتحقن في صفحة الويب عشان يحلل الـ DOM والـ Forms     |
| Auth Manager      | <<security>>     | بيدير الـ Authentication وبيخزن الـ JWT Token                        |

#### التدفق الداخلي:

    Extension UI → Background Service → Content Script

-   المستخدم يضغط "Scan" من الـ UI\
-   الـ Background Service يستقبل الأمر\
-   يحقن الـ Content Script في الصفحة النشطة

------------------------------------------------------------------------

### ب) Security Analyzer (محلل الثغرات) 🔍

#### المكونات:

  -----------------------------------------------------------------------
  Component              Stereotype                  الوظيفة
  ---------------------- --------------------------- --------------------
  XSS Detector           \<`<analyzer>`{=html}\>     يكشف ثغرات
                                                     Cross-Site Scripting
                                                     في الـ DOM

  SQL Injection Detector \<`<analyzer>`{=html}\>     يفحص Forms والـ URL
                                                     Parameters لكشف حقن
                                                     SQL

  CSRF Detector          \<`<analyzer>`{=html}\>     يتحقق من وجود CSRF
                                                     Tokens في الـ Forms

  Issue Aggregator       \<`<controller>`{=html}\>   يجمع كل الثغرات
                                                     المكتشفة وينظمها
  -----------------------------------------------------------------------

#### التدفق:

    Content Script → Detectors (XSS, SQLi, CSRF) → Issue Aggregator

-   الـ Content Script بيبعت محتوى الصفحة للـ Detectors\
-   كل Detector بيفحص نوع معين\
-   النتائج تتجمع في Issue Aggregator

------------------------------------------------------------------------

### ج) Backend Server (الخادم الخلفي) ⚙️

#### المكونات:

  Component                Stereotype                الوظيفة
  ------------------------ ------------------------- ----------------------------------
  API Gateway              \<`<gateway>`{=html}\>    نقطة الدخول الوحيدة
  Authentication Service   \<`<security>`{=html}\>   يتحقق من الـ JWT Token
  Scan Processor           \<`<service>`{=html}\>    يعالج نتائج الفحص
  Database                 \<`<storage>`{=html}\>    يخزن بيانات المستخدمين والفحوصات

#### التدفق:

    API Gateway → Authentication Service → Scan Processor → Database

------------------------------------------------------------------------

### د) Web Dashboard (لوحة التحكم) 📊

#### المكونات:

  Component          Stereotype                    الوظيفة
  ------------------ ----------------------------- ------------------------
  Login/Register     \<`<presentation>`{=html}\>   تسجيل الدخول والاشتراك
  Dashboard UI       \<`<presentation>`{=html}\>   عرض قائمة الفحوصات
  Reports & Charts   \<`<presentation>`{=html}\>   عرض النتائج بصرياً

------------------------------------------------------------------------

## 3. الـ Interfaces (واجهات الاتصال)

### Interface معناها إيه؟

واجهة اتصال بين مكونين بتحدد طريقة التواصل بينهم.

  Interface   الربط                                   الوظيفة
  ----------- --------------------------------------- ---------------------
  IAuth       Auth Manager ↔ Authentication Service   تبادل الـ JWT Token
  IScanAPI    Issue Aggregator ↔ API Gateway          إرسال نتائج الفحص
  IUserAPI    Dashboard UI ↔ API Gateway              طلب بيانات المستخدم

------------------------------------------------------------------------

## 4. تدفق البيانات (الأسهم)

### 🔹 Flow 1: Extension Scan Flow

    1. Extension UI → Background Service
    2. Background Service → Content Script
    3. Content Script → Detectors
    4. Detectors → Issue Aggregator
    5. Issue Aggregator → IScanAPI → API Gateway
    6. API Gateway → Scan Processor → Database

------------------------------------------------------------------------

### 🔹 Flow 2: Authentication Flow

    1. Auth Manager → IAuth
    2. IAuth → Authentication Service
    3. Authentication Service → API Gateway

------------------------------------------------------------------------

### 🔹 Flow 3: Dashboard View Flow

    1. Login/Register → IAuth
    2. Dashboard UI → IUserAPI
    3. IUserAPI → API Gateway
    4. API Gateway → Database
    5. Database → Reports & Charts

------------------------------------------------------------------------

## 5. شرح الاختصارات (Stereotypes)

  Stereotype                    المعنى         مثال
  ----------------------------- -------------- -------------------
  \<`<component>`{=html}\>      مكون رئيسي     Browser Extension
  \<`<presentation>`{=html}\>   واجهة مستخدم   Dashboard UI
  \<`<service>`{=html}\>        منطق الأعمال   Scan Processor
  \<                            سكريبت         Content Script
  \<`<security>`{=html}\>       أمان           Auth Manager
  \<`<analyzer>`{=html}\>       محلل           XSS Detector
  \<`<controller>`{=html}\>     منسق           Issue Aggregator
  \<`<gateway>`{=html}\>        بوابة API      API Gateway
  \<`<storage>`{=html}\>        تخزين          Database

------------------------------------------------------------------------

## 6. الخلاصة

الـ Component Diagram يوضح: - تقسيم النظام إلى 4 مكونات رئيسية\
- التواصل بينهم عبر Interfaces\
- تدفق بيانات من Extension → Analyzer → Backend → Dashboard\
- الفصل بين UI و Logic و Database\
- كل الطلبات تمر عبر Authentication
