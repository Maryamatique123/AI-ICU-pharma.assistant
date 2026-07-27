# 🏥 ICU Clinical Pharmacist Assistant

> An AI-powered Clinical Decision Support System for ICU Clinical Pharmacists built with React, TypeScript, Firebase, and Google Gemini AI.

---

# 📖 Overview

ICU Clinical Pharmacist Assistant is a production-ready AI-powered web application designed to support ICU clinical pharmacists in reviewing prescriptions, identifying drug-related problems, performing renal dose adjustments, searching drug information, and generating professional clinical recommendations.

The application combines modern web technologies with Google Gemini AI to assist pharmacists in making evidence-based medication decisions and improving patient safety in intensive care units.

---

# 🎯 Problem Statement

Medication management in Intensive Care Units (ICUs) is highly complex. Clinical pharmacists must review multiple medications, identify drug interactions, adjust doses based on renal function, calculate clinical parameters, and document recommendations manually.

This process is time-consuming and increases the risk of medication errors.

ICU Clinical Pharmacist Assistant was developed to simplify this workflow by providing AI-assisted prescription analysis, drug information retrieval, clinical calculators, and professional consultation reports in one platform.

---

# 👥 Target Users

- ICU Clinical Pharmacists
- Hospital Pharmacists
- Pharmacy Students
- Clinical Pharmacy Residents
- Healthcare Professionals

---

# 🌐 Live Demo

https://ai-icu-pharma-assistant.vercel.app/

---

# 💻 GitHub Repository

https://github.com/Maryamatique123/AI-ICU-pharma.assistant

---

# ✨ Features

## 🔐 Authentication

- User Registration
- Secure Login
- Logout
- Firebase Authentication
- Protected Dashboard

---

## 📊 Dashboard

- ICU Clinical Dashboard
- Patient Statistics
- Review Metrics
- Drug Lookup Summary
- Clinical Activity Overview

---

## 👨‍⚕️ ICU Patient Management

- Add Patient
- Edit Patient
- Delete Patient
- Search Patients
- Medication History
- Allergy Documentation

---

## 💊 AI Prescription Review

Analyze complete ICU prescriptions using Google Gemini AI.

The AI reviews:

- Drug Interactions
- Therapeutic Duplication
- Renal Dose Adjustments
- High-Risk Medications
- Clinical Recommendations
- Pharmacist Notes

---

## 🔍 AI Drug Lookup

Search any medicine and generate a professional clinical monograph including:

- Generic Name
- Brand Name
- Drug Class
- Mechanism of Action
- Indications
- Adult Dose
- Renal Dose
- Contraindications
- Warnings
- Adverse Effects
- Drug Interactions
- Pregnancy Information
- Monitoring Parameters
- Storage Conditions

---

## 🧮 Clinical Calculators

- Cockcroft-Gault Creatinine Clearance Calculator
- Ideal Body Weight (IBW)
- Mean Arterial Pressure (MAP)
- Anion Gap Calculator
- Vasopressor Equivalence Calculator

---

## 📄 Clinical Reports

Generate printable EMR-style consultation reports including:

- Patient Summary
- Medication Review
- AI Recommendations
- Clinical Notes
- Pharmacist Recommendations

---

## ⚙️ Settings

- Hospital Preferences
- User Settings
- Dark Mode
- Application Configuration

---

# 🤖 AI Feature

The application integrates **Google Gemini AI** to provide intelligent clinical decision support.

The AI performs:

- Prescription Review
- Drug Information Retrieval
- Drug Interaction Analysis
- Renal Dose Adjustment Recommendations
- Clinical Pharmacist Consultation Summaries

---

# 🧠 AI System Prompt (Summary)

The AI is instructed to behave as an experienced ICU Clinical Pharmacist.

For every prescription review, the AI should:

- Analyze all prescribed medications.
- Identify clinically significant drug-drug interactions.
- Recommend renal dose adjustments based on kidney function.
- Detect duplicate therapy.
- Highlight high-alert medications.
- Suggest monitoring parameters.
- Generate evidence-based pharmacist recommendations.
- Present the results in a structured and professional clinical report.

---

# 🛠️ Technologies Used

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

## Backend

- Express.js
- Node.js

## Database

- Firebase Firestore

## Authentication

- Firebase Authentication

## Artificial Intelligence

- Google Gemini AI (Gemini Flash)

## Charts

- Recharts

## Icons

- Lucide React

## Deployment

- Vercel

## Version Control

- GitHub

---

# 📁 Project Structure

```
src/
 ├── components/
 ├── context/
 ├── services/
 ├── views/
 ├── types.ts
 ├── App.tsx
 └── main.tsx

server/
 ├── ai/
 ├── routes/
 └── server.ts

public/

firebase/

README.md

package.json
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone YOUR_GITHUB_LINK
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Build production

```bash
npm run build
```

Start production server

```bash
npm run start
```

---

# 🔒 Environment Variables

Create a `.env` file and configure:

```env
GEMINI_API_KEY=your_api_key

VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=
```

---

# 📷 Screenshots

Include at least three screenshots.

### Dashboard

(Add Screenshot)

### Patient Management

(Add Screenshot)

### AI Prescription Review

(Add Screenshot)

### Drug Lookup

(Add Screenshot)

### Clinical Calculators

(Add Screenshot)

---

# 🚀 Future Improvements

- OpenFDA Drug Label Integration
- Laboratory Result Interpretation
- Therapeutic Drug Monitoring
- Multi-language Support
- Hospital EMR Integration
- Medication Reconciliation
- Clinical Guidelines Library

---

# 👩‍💻 Developed By

**Maryam Atique**

Final Year Pharm-D Student

University of Balochistan

---

# 📄 License

This project was developed for educational purposes as part of an AI App Development Final Project.
