# OGzz MC Store - Minecraft server store

An offline-first, dynamic full-stack Minecraft premium store and coins web application named **OGzz MC Store**. Configured with Firebase Authentication, Firestore database, and responsive dark-red gaming layouts.

---

## 🚀 Tech Stack

- **Framework**: Recat.js (Vite + TypeScript)
- **Database / Backed**: Firebase Firestore Database
- **Authentication**: Firebase Authentication (Email/Password + username lookup index)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (`motion/react`)
- **Utility / UI**: Lucide Icons & React Hot Toast

---

## 🗂️ Application Directory Map

```text
/
├── .env.example               # Environment template for developers
├── .env                       # Local environment secrets configs
├── firestore.rules            # Hardened Attribute-Based Firestore Security rules
├── firebase-blueprint.json    # Static Database collections schema description
├── metadata.json              # Applet deployment properties
├── package.json               # NPM scripts and project dependencies
├── README.md                  # Project guides and documentation
├── src/
│   ├── App.tsx                # Central routing paths index and styling Wrapper
│   ├── main.tsx               # Client bootstrap entrypoint
│   ├── index.css              # Custom Tailwind configuration & theme settings
│   ├── types.ts               # Shared internal typescript interfaces
│   ├── firebase/
│   │   └── firebase.ts        # Firebase Core SDK configure & customized error handles
│   ├── context/
│   │   └── AuthContext.tsx    # Session manager & Minecraft user credentials lookup
│   ├── data/
│   │   └── defaultProducts.ts # Pre-designed Minecraft Ranks & Coin Packs fallback data
│   └── components/
│       ├── Navbar.tsx         # Modern responsive headers menu
│       ├── Footer.tsx         # Legal disclaimer credits & Discord anchors
│       ├── HomeView.tsx       # Landing splash page showcasing copy IP and status
│       ├── Ranks.tsx          # Store ranks catalogue
│       ├── Coins.tsx          # Store currency packages catalogue
│       ├── OrderTracker.tsx   # Client order search lookup
│       ├── OrderModal.tsx     # 3-Step purchase transaction checkout guide
│       ├── Login.tsx          # Player login input drawer
│       └── Register.tsx       # Player character profile sign-up manager
```

---

## ⚡ Deployment & Running Commands

### 1. Prerequisite Installations
Run npm to install client and compilation packages:
```bash
npm install
```

### 2. Launch Local Dev Server
Binds to local port `3000`:
```bash
npm run dev
```

### 3. Build & Compile SPA Static Assets
```bash
npm run build
```

---

## 🔥 Firebase Deployments

To register custom subdomains and push rules indices onto live cloud databases:

```bash
# 1. Login to Firebase CLI
firebase login

# 2. Bind your hosting project ID
firebase use --add

# 3. Deploy Firestore rules and targets
firebase deploy --only firestore:rules

# 4. Deploy complete bundle structures
firebase deploy
```

---

## 🔒 Attribute Based Zero-Trust Security Invariants

Our generated `firestore.rules` defends against the "Dirty Dozen" vulnerabilities including:
- **Improper self-approval**: Customer cannot self-promote item status from `Pending`.
- **Identity spoofing**: Writing profiles under external UIDs is locked down.
- **Poison ID injections**: Format size constraints prevent resource-draining attacks.
