# ICU Clinical Pharmacist Assistant

A hospital EMR-style clinical decision support platform designed for ICU clinical pharmacists. Built with React, TypeScript, Tailwind CSS, Vite, Express, and powered by Google Gemini 2.5 Flash for dynamic pharmacotherapy evaluation, drug interaction checking, organ clearance dosing adjustments, and drug monograph generation.

## 🌟 Key Features

- **Clinical Pharmacotherapy Evaluation**: Real-time screening of multi-drug ICU regimens for drug-drug interactions, duplicate therapies, and Cockcroft-Gault renal dosing clearance.
- **Dynamic Gemini 2.5 Flash Drug Lookup**: Instant generation of complete professional clinical drug monographs for any brand or generic pharmaceutical agent.
- **Clinical Calculators**: Cockcroft-Gault CrCl & IBW, Anion Gap, MAP (Mean Arterial Pressure), and Vasopressor Equivalence calculators.
- **Patient ICU Roster & MAR**: Live patient tracking with MRN, age, weight, serum creatinine, allergy alerts, and active medication administration records.
- **Consultation Reports**: Printable, structured clinical pharmacotherapy evaluation notes formatted for hospital EMR integration.
- **Firebase Firestore Synchronization**: Real-time cloud synchronization for patient rosters and historical review records.

---

## 🛠️ Project Structure

```
├── server.ts                  # Express server entry point with Vite middleware & Gemini API proxy
├── server/
│   ├── aiService.ts           # Google GenAI SDK integration & fallback handlers
│   └── aiPrompts.ts           # Clinical prompt instructions for Gemini 2.5 Flash
├── src/
│   ├── main.tsx               # Application client entry point
│   ├── App.tsx                # Main App shell, navigation & state management
│   ├── index.css              # Tailwind CSS configuration
│   ├── types.ts               # Global TypeScript interfaces (Patient, DrugMonograph, ReviewRecord)
│   ├── components/            # Reusable UI components (Navbar, Sidebar, AuthModal, SeverityBadge)
│   ├── context/               # AuthContext for Firebase Authentication
│   ├── services/              # Firestore DB & Gemini API client services
│   └── views/                 # Core view modules
│       ├── DashboardView.tsx          # ICU Ward Overview & analytics
│       ├── PatientsView.tsx           # Patient roster & active MAR management
│       ├── PrescriptionReviewView.tsx # Pharmacotherapy AI evaluation view
│       ├── ClinicalToolsView.tsx      # Clinical calculators & renal tools
│       ├── DrugLookupView.tsx         # Dynamic Gemini 2.5 Flash drug monograph engine
│       ├── ReportsView.tsx            # Printable consultation notes
│       └── SettingsView.tsx           # Hospital unit & theme settings
├── public/                    # Static assets
├── firebase-blueprint.json    # Firestore schema specification
├── firestore.rules            # Firestore security rules
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite build configuration
```

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js**: v18.x or v20.x or higher
- **npm** or **bun**

### Installation

1. Clone or extract the source code repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
   ```

4. Start the Development Server:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

---

## 📦 Building for Production

To build the full-stack application (frontend + server bundle):

```bash
npm run build
```

To run the production server locally or in a container:

```bash
npm run start
```

---

## ☁️ Deployment

### Deploying on Vercel / Cloud Run / Railway

1. Push this repository to GitHub.
2. Link the repository to your hosting platform.
3. Set the build command to `npm run build` and start command to `npm run start`.
4. Add `GEMINI_API_KEY` to your environment variables in your deployment dashboard.

---

## ⚖️ License & Medical Disclaimer

This software is designed as a clinical decision support system for educational and clinical workflow demonstration purposes. Healthcare professionals must exercise independent clinical judgment when administering medications.
