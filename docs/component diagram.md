✅ السيناريو — Main Flow (مرتب ومنسّق)

المستخدم يفتح صفحة ويب ويركّز عليها.

المستخدم يضغط زر “Scan” في Extension Panel (أو يتم التفعيل تلقائيًا بناءً على الإعدادات).

Extension Panel يرسل رسالة إلى Page Scanner يطلب فيها بدء جمع البيانات من الصفحة.

Page Scanner يجمع بيانات الصفحة:

DOM

Title

URL

فقرات ونصوص

روابط

Metadata

Evidence samples
ويعمل preprocessing (إزالة UI/Stopwords…).

Page Scanner يرسل النتيجة إلى Background Script باستخدام رسالة داخل الإضافة.

Background Script يستقبل الـ Payload ويضيف:

client_id

timestamp
ويتأكد من الخصوصية ويخفي/يحذف أي PII.

Background Script يبني طلب HTTP POST إلى /api/scan ويُرسل الـ payload عبر HTTPS.

Backend API يستقبل الطلب ويرد فورًا بـ:

202 Accepted
أو

200 OK + job_id

Backend يقوم بعمليات Normalization وEnrichment مثل:

كشف اللغة

استخراج العناوين

tokenization

تنظيف المحتوى

Backend يمرّر المحتوى إلى Rule Engine لتحليل القواعد.

Rule Engine ينفّذ القواعد ويُنتج نتيجة تشمل:

status

severity

matched_rules

evidence

Backend يحفظ النتيجة في Database مع:

job_id

url

timestamp

client_id

analysis result

Backend ينهي العملية ويقوم إمّا بـ:

إرسال Webhook/Notification للـ Extension

أو الانتظار ليقوم الـ Dashboard بالـ polling

Dashboard Web App يستعلم عن النتيجة عبر:
GET /api/results?job_id=...
ويعرض البيانات في Results Table مع التفاصيل.

المستخدم أو المشرف يشاهد النتيجة ويتخذ إجراء:

Acknowledge

Ignore

Create ticket / remediation
