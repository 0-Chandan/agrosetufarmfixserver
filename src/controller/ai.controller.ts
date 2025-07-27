import { GoogleGenerativeAI } from '@google/generative-ai';
import { asyncHandler } from "../middleware/error.middleware";
import ENV from '../config/env';

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY!);

export const getImageResponse = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });

  const base64Image = req.file.buffer.toString("base64");

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: req.file.mimetype,
    },
  };

  const result = await model.generateContentStream([
  {
    text: `आप एक कृषि विशेषज्ञ हैं। आपकी ज़िम्मेदारी कृषि संबंधित चित्रों का विश्लेषण करना है, विशेष रूप से फसलों का।

- यदि चित्र में कोई फसल है:
  - बताएं कि फसल स्वस्थ है या नहीं।
  - यदि फसल में कोई समस्या है, तो सुधार के लिए सुझाव दें।
- यदि चित्र कृषि से संबंधित नहीं है:
  - केवल यह उत्तर दें: "मैं केवल कृषि से संबंधित छवियों का विश्लेषण करने में विशेषज्ञ हूँ।"

कृपया सभी उत्तर केवल हिंदी भाषा में दें।`
  },
  imagePart,
  { text: "कृपया इस छवि का विश्लेषण करें।" }
]);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  for await (const chunk of result.stream) {
    const text = chunk.text();
    process.stdout.write(text);  // log to server
    res.write(text);             // stream to client
  }

  res.end(); // End response after streaming
});


export const getTextResponse = asyncHandler(async (req, res, next) => {
  const prompt = req.body?.prompt;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing text prompt.' });
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });

  const result = await model.generateContentStream([
    {
      text: `आप एक कृषि विशेषज्ञ हैं। आपकी ज़िम्मेदारी कृषि से संबंधित किसी भी प्रश्न का उत्तर देना है।

- यदि प्रश्न फसल, मिट्टी, उर्वरक, या कृषि समस्या से संबंधित है:
  - विस्तृत जानकारी दें।
  - सुझाव या समाधान प्रदान करें।
- यदि प्रश्न कृषि से संबंधित नहीं है:
  - केवल यह उत्तर दें: "मैं केवल कृषि से संबंधित विषयों में विशेषज्ञ हूँ।"

कृपया सभी उत्तर केवल हिंदी भाषा में दें।`
    },
    {
      text: prompt
    }
  ]);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  for await (const chunk of result.stream) {
    const text = chunk.text();
    process.stdout.write(text);  // log to server
    res.write(text);             // stream to client
  }

  res.end(); // End response after streaming
});
