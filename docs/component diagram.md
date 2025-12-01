# Main Flow — Browser Security Extension Scan Process

1. **المستخدم يفتح صفحة ويب ويركّز عليها.**

2. **المستخدم يضغط زر “Scan” في Extension Panel**
   (أو يتم التفعيل تلقائيًا حسب إعدادات الإضافة).

3. **Extension Panel يرسل رسالة إلى Page Scanner**
   يطلب فيها: *“ابدأ جمع بيانات الصفحة الآن”*.

4. **Page Scanner يجمع بيانات الصفحة** ويتضمن:

   * DOM
   * Page Title
   * URL
   * Text paragraphs
   * Links
   * Metadata
   * Evidence samples
     ويُجري عمليات *Preprocessing* مثل إزالة عناصر UI والـ Stopwords.

5. **Page Scanner يرسل النتائج إلى Background Script** عبر رسالة داخل الإضافة.

6. **Background Script يستقبل الـ Payload** ويضيف:

   * `client_id`
   * `timestamp`
     ثم يتحقق من سياسة الخصوصية ويخفي أي PII قبل الإرسال.

7. **Background Script يبني طلب HTTP POST إلى `/api/scan`**
   ويرسل الـ Payload عبر HTTPS.

8. **Backend API يستقبل الطلب** ويرد مباشرة:

   * `202 Accepted`
     **أو**
   * `200 OK` + `job_id`

9. **Backend يجري Normalization & Enrichment** مثل:

   * كشف اللغة
   * استخراج عناوين
   * Tokenization
   * إزالة الضوضاء

10. **Backend يمرّر المحتوى إلى Rule Engine** لتحليل القواعد.

11. **Rule Engine ينفّذ قواعده** ويُنتج:

    * `status (ok/warn/critical)`
    * `severity`
    * `matched_rules`
    * `evidence_snippets`

12. **Backend يحفظ النتائج في قاعدة البيانات** مع:

    * `job_id`
    * `url`
    * `timestamp`
    * `client_id`
    * `analysis_result`

13. **Backend ينهي العملية** عبر:

    * إرسال Webhook/Notification للـ Background Script أو Dashboard
      **أو**
    * استخدام Dashboard لـ Polling.

14. **Dashboard Web App يستعلم عن النتائج**
    باستخدام:

    ```http
    GET /api/results?job_id=...
    ```

    ثم يعرض النتائج في جدول مع الأدلة والقواعد.

15. **المستخدم أو المشرف يشاهد النتائج** ويتخذ إجراء:

    * Acknowledge
    * Ignore
    * Create ticket / remediation
