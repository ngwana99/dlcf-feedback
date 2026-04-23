# DLCF National Campus Conference 2026 – Feedback System

## Project structure

```
dlcf-feedback/
├── public/
│   └── index.html        ← The feedback form (deploy to Netlify)
├── server/
│   └── index.js          ← Express API (deploy to Render)
├── package.json
├── netlify.toml
└── render.yaml
```

---

## Step 1 – Deploy the API to Render

1. Push this project to a GitHub repo.
2. Go to https://render.com → New → Web Service → connect your repo.
3. Set **Root Directory** → leave blank (or `/`).
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add environment variables in Render dashboard:
   - `ADMIN_TOKEN` → generate a strong secret (e.g. a UUID)
   - `ALLOWED_ORIGIN` → your Netlify URL (set after step 2)
7. Add a **Disk** under the service:
   - Name: `feedback-data`
   - Mount path: `/opt/render/project/src/server`
   - Size: 1 GB
8. Deploy. Copy your Render URL e.g. `https://dlcf-feedback-api.onrender.com`

---

## Step 2 – Update the API URL in the form

In `public/index.html`, find this line and replace the placeholder:

```js
: 'https://YOUR-RENDER-APP.onrender.com/api/feedback';
```

Change it to your actual Render URL:

```js
: 'https://dlcf-feedback-api.onrender.com/api/feedback';
```

---

## Step 3 – Deploy the form to Netlify

1. Go to https://netlify.com → Add new site → Import from Git.
2. Set **Publish directory**: `public`
3. Deploy. Your form is live.

---

## Viewing feedback (admin)

**All raw entries:**
```
GET https://dlcf-feedback-api.onrender.com/api/feedback
Header: x-admin-token: YOUR_ADMIN_TOKEN
```

**Summary stats:**
```
GET https://dlcf-feedback-api.onrender.com/api/summary
Header: x-admin-token: YOUR_ADMIN_TOKEN
```

You can test with curl:
```bash
curl https://dlcf-feedback-api.onrender.com/api/summary \
  -H "x-admin-token: YOUR_ADMIN_TOKEN"
```

Or use a tool like Postman / Insomnia.

---

## Upgrade options (post-conference)

- Replace `feedback-data.json` storage with a free **MongoDB Atlas** cluster for more robust data.
- Add an admin dashboard page to visualize responses per day.
- Send email/WhatsApp notifications to the counselling team when salvation decisions are submitted.
