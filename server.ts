import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { analyzePrescriptionWithGemini, getDrugMonographWithGemini } from './server/aiService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'ICU Clinical Pharmacist Assistant', timestamp: new Date().toISOString() });
  });

  // Prescription Review AI Analysis Endpoint
  app.post('/api/review-prescription', async (req, res) => {
    try {
      const patientPayload = req.body;
      if (!patientPayload || !patientPayload.name || !patientPayload.medications) {
        return res.status(400).json({ error: 'Invalid patient prescription payload provided.' });
      }

      const analysis = await analyzePrescriptionWithGemini(patientPayload);
      return res.json({ success: true, analysis });
    } catch (error: any) {
      console.error('Error analyzing prescription:', error);
      return res.status(500).json({
        error: 'Failed to complete prescription analysis',
        message: error.message || String(error)
      });
    }
  });

  // Dynamic Drug Monograph Lookup Endpoint using Gemini 2.5 Flash
  app.post('/api/drug-lookup', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Drug query string is required.' });
      }

      const monograph = await getDrugMonographWithGemini(query.trim());
      return res.json({ success: true, monograph });
    } catch (error: any) {
      console.error('Error looking up drug monograph:', error);
      return res.status(500).json({
        error: 'Failed to retrieve drug monograph',
        message: error.message || String(error)
      });
    }
  });

  // Vite Middleware for Dev / Static Files for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ICU Clinical Pharmacist Assistant] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
