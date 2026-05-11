# VALA WORKS Voice Widget Setup

The website is a static Vercel site with serverless API routes in `api/`.
Do not commit real keys. Add them only in Vercel Project Settings > Environment Variables.

## Vercel Environment Variables

Add these variables for Production, Preview, and Development:

```text
GEMINI_API_KEY=your_gemini_api_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

If your EmailJS template requires private API access, also add:

```text
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
```

## EmailJS Template Variables

Create an EmailJS template that uses:

```text
{{from_name}}
{{to_email}}
{{subject}}
{{transcript}}
{{timestamp}}
```

Suggested template subject:

```text
{{subject}}
```

Suggested template HTML:

```html
<h2>New Voice Inquiry from Website</h2>
<p><strong>From:</strong> {{from_name}}</p>
<p><strong>Time:</strong> {{timestamp}}</p>
<pre style="white-space: pre-wrap; font-family: monospace;">{{transcript}}</pre>
```

## Browser Notes

Voice recognition uses the browser Web Speech API. It works best on Chrome or Edge over HTTPS. Vercel deploys over HTTPS, so the live site is the right place to test microphone permissions.
