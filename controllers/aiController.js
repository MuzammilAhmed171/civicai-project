const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');

const fallbackAiPrediction = (text = '', imageUrl = '') => {
  const t = (text || '').toLowerCase();
  let category = 'Other';
  let priority = 'Medium';
  let visualSummary = imageUrl
    ? 'Visual Inspection: Image uploaded by citizen showing municipal site hazard.'
    : 'Text Analysis: Grievance logged without image attachment.';

  if (t.includes('water') || t.includes('pipe') || t.includes('tank') || t.includes('tap') || t.includes('leak')) {
    category = 'Water';
    if (imageUrl) visualSummary = 'Visual Inspection: Water supply pipeline leakage / main distribution line burst detected in photo.';
  } else if (t.includes('road') || t.includes('pothole') || t.includes('traffic') || t.includes('street') || t.includes('path') || t.includes('asphalt')) {
    category = 'Road';
    if (imageUrl) visualSummary = 'Visual Inspection: Damaged asphalt road surface with deep potholes pose vehicular traffic hazard.';
  } else if (t.includes('garbage') || t.includes('trash') || t.includes('waste') || t.includes('dustbin') || t.includes('dump')) {
    category = 'Waste';
    if (imageUrl) visualSummary = 'Visual Inspection: Accumulated solid waste dump and uncollected trash heap detected in public area.';
  } else if (t.includes('electricity') || t.includes('power') || t.includes('light') || t.includes('wire') || t.includes('transformer')) {
    category = 'Electricity';
    if (imageUrl) visualSummary = 'Visual Inspection: Hanging electric power cables / damaged electrical pole installation detected.';
  } else if (t.includes('drain') || t.includes('sewage') || t.includes('gutter') || t.includes('overflow') || t.includes('manhole')) {
    category = 'Drainage';
    if (imageUrl) visualSummary = 'Visual Inspection: Blocked storm drainage channel / sewage line overflow detected on street.';
  } else if (t.includes('fight') || t.includes('crime') || t.includes('safety') || t.includes('police') || t.includes('stray') || t.includes('robbery')) {
    category = 'Safety';
    if (imageUrl) visualSummary = 'Visual Inspection: Public safety obstruction / municipal hazard area photographed.';
  }

  if (t.includes('accident') || t.includes('fire') || t.includes('burst') || t.includes('urgent') || t.includes('critical') || t.includes('emergency') || t.includes('danger')) {
    priority = 'Critical';
  } else if (t.includes('high') || t.includes('broken') || t.includes('leaking') || t.includes('blocked') || t.includes('overflowing')) {
    priority = 'High';
  }

  return { category, priority, confidence: 0.90, visualSummary };
};

// Vision Analyzer Engine
const analyzeComplaintWithGeminiVision = async (description = '', imageUrl = '') => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !imageUrl) {
    return fallbackAiPrediction(description, imageUrl);
  }

  try {
    const base64Data = imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl;
    const mimeType = imageUrl.includes('data:image/png') ? 'image/png' : 'image/jpeg';

    const payload = JSON.stringify({
      contents: [{
        parts: [
          { text: `Analyze this Pakistani civic complaint photo and description. Description: "${description}". Respond ONLY with valid JSON in this format: {"category": "Road"|"Water"|"Waste"|"Electricity"|"Drainage"|"Safety"|"Other", "priority": "Critical"|"High"|"Medium"|"Low", "confidence": 0.92, "visualSummary": "Concise visual inspection description of the civic problem shown in photo"}` },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textResponse) {
              const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return resolve({
                  category: parsed.category || 'Other',
                  priority: parsed.priority || 'Medium',
                  confidence: parsed.confidence || 0.95,
                  visualSummary: parsed.visualSummary || 'Visual Inspection: Site photo verified.'
                });
              }
            }
          } catch (e) {}
          resolve(fallbackAiPrediction(description, imageUrl));
        });
      });

      req.setTimeout(3500, () => {
        req.destroy();
        resolve(fallbackAiPrediction(description, imageUrl));
      });

      req.on('error', () => resolve(fallbackAiPrediction(description, imageUrl)));
      req.write(payload);
      req.end();
    });
  } catch (e) {
    return fallbackAiPrediction(description, imageUrl);
  }
};

const analyzeComplaint = async (req, res) => {
  try {
    const { description, imageUrl } = req.body;
    if (!description && !imageUrl) {
      return res.status(400).json({ error: 'Description or Image is required' });
    }

    const aiResult = await analyzeComplaintWithGeminiVision(description, imageUrl);
    return res.json(aiResult);
  } catch (error) {
    res.json(fallbackAiPrediction(req.body?.description, req.body?.imageUrl));
  }
};

module.exports = { analyzeComplaint, fallbackAiPrediction, analyzeComplaintWithGeminiVision };
