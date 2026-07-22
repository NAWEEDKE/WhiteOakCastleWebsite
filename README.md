# 🏰 White Oak Castle Website & Admin Portal

This repository contains the premium frontend application for **White Oak Castle Convention Center** in Moodal, Athavanad, Kerala. 

---

## 📁 File Structure

The project is organized into modular directories for ease of navigation, editing, and deployment:

```
WhiteOakCastleWebsite/
├── index.html            # Main home page with hero section & overview
├── about.html            # Venue concept page detailing architecture & design
├── gallery.html          # Dynamic photo gallery with videos
├── booking.html          # User photoshoot slot reservation page
├── portal.html           # Customer dashboard (view bookings/holds & request payment links)
├── admin.html            # Admin panel to manage dates, approve bookings & holds
├── logout.html           # Handles secure session termination
│
├── css/                  # Styling Sheets
│   ├── style.css         # Main website layout, styling, and design system
│   └── admin.css         # Admin portal & dashboard interface layout
│
├── js/                   # Javascript Logic
│   ├── script.js         # Core logic for customer slots, validation, and dashboard
│   └── admin.js          # Admin dashboard data management and calendar controls
│
└── assets/               # Media & Graphic Elements
    ├── logo/             # Brand logos (Black, Green, White variants)
    ├── images/           # Web optimized background graphics & textures
    └── gallery/          # High-resolution venue photos & drone media
```

---

## 🚀 How to Host This Website

This is a clean, static frontend web application (using LocalStorage for simulation). It is compatible with **any static host** without needing configuration or build steps.

### Option 1: GitHub Pages (Free)
1. Push this folder to a GitHub repository.
2. Go to **Settings > Pages**.
3. Choose the branch (e.g. `main`) and root folder (`/`), then click **Save**.
4. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Option 2: Vercel / Netlify (Free & Recommended)
1. Drag and drop this folder directly into the web dashboard of **Vercel** (vercel.com) or **Netlify** (netlify.com).
2. It will deploy instantly in one click and provide a custom SSL URL.

### Option 3: Traditional Shared Hosting (Hostinger, Bluehost, cPanel, etc.)
1. Log in to your hosting control panel (cPanel / File Manager).
2. Upload all files and folders (`css/`, `js/`, `assets/`, and the `.html` files) directly into the `public_html` directory.
