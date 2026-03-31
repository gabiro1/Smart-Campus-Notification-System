/**
 * copilot.controller.js
 * 
 * Handles the RAG (Retrieval-Augmented Generation) logic for the Academic Copilot.
 * This takes a user query, fetches relevant academic context, and constructs a
 * prompt for the LLM to answer.
 */

import { GoogleGenAI } from '@google/genai';

// Assuming we have models to fetch context from:
// import Timetable from '../timetable/models/Timetable.js';
// import Notification from '../notification/models/Notification.js';

export const askCopilot = async (req, res) => {
    try {
        const { query, userId } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, message: "Query is required." });
        }

        // ------------------------------------------------------------------
        // STEP 1: RETRIEVE RAG CONTEXT (Pseudo-code structure)
        // ------------------------------------------------------------------

        /*
        // 1A. Fetch today's Timetable for the student
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
        
        const timetableContext = await Timetable.find({ 
            studentId: userId, 
            day: today 
        }).lean();

        let timetableString = "Today's Schedule: \n";
        if (timetableContext.length > 0) {
            timetableContext.forEach(cls => {
                timetableString += `- ${cls.courseCode} ${cls.courseName} at ${cls.time} in ${cls.room}\n`;
            });
        } else {
            timetableString += "No classes scheduled for today.\n";
        }

        // 1B. Fetch recent High Priority or Unread Pulses (Announcements/Notifications)
        const recentPulses = await Notification.find({
            targetUserId: userId,
            $or: [{ priority: 'high' }, { isRead: false }]
        }).sort({ createdAt: -1 }).limit(3).lean();

        let pulseString = "Recent Important Notifications: \n";
        if (recentPulses.length > 0) {
            recentPulses.forEach(pulse => {
                pulseString += `- [${pulse.type.toUpperCase()}] ${pulse.title}: ${pulse.content}\n`;
            });
        } else {
            pulseString += "No new urgent notifications.\n";
        }
        */

        // MOCK CONTEXT FOR DEMONSTRATION
        const timetableString = `Today's Schedule:
- IT401 Advanced AI at 10:00 AM in Room 302
- IT405 Quantum Computing lab at 2:00 PM in Lab 1`;

        const pulseString = `Recent Important Notifications:
- [CRITICAL] Midterm Project Guidelines Released
- [REMINDER] Guest Lecture Tomorrow: Dr. Alan Turing at 14:30 PM`;

        // ------------------------------------------------------------------
        // STEP 2: CONSTRUCT THE PROMPT
        // ------------------------------------------------------------------

        const systemPrompt = `You are "UniNotify AI", the official academic copilot for a student dashboard.
Your goal is to help the student navigate their academic life based ONLY on the context provided.

CONTEXT PROVIDED:
---
${timetableString}

${pulseString}
---

INSTRUCTIONS:
1. Act as a friendly, professional AI assistant named UniNotify AI.
2. Base your answers strictly on the provided context (timetable and notifications).
3. If the student asks a question that cannot be answered using the provided context, gracefully decline and remind them you are an academic assistant. DO NOT invent information.
4. Keep answers concise, helpful, and scannable.`;

        // ------------------------------------------------------------------
        // STEP 3: CALL THE LLM (OpenAI/Gemini Example)
        // ------------------------------------------------------------------

        let reply = "I am UniNotify AI. How can I assist you with your academics today?";

        if (process.env.GEMINI_API_KEY) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const aiResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `${systemPrompt}\n\nUser Query: ${query}`
                });
                reply = aiResponse.text;
            } catch (llmError) {
                console.error("LLM Error:", llmError);
                reply = "I apologize, but my AI language model is currently unavailable. Please check the backend console for more details.";
            }
        } else {
            // MOCK RESPONSE FOR DEMONSTRATION IF NO API KEY IS FOUND
            const lowercaseQuery = query.toLowerCase();
            if (lowercaseQuery.includes("schedule") || lowercaseQuery.includes("class")) {
                reply = `You have two classes today. First, Advanced AI at 10:00 AM in Room 302. Later, you have a Quantum Computing lab at 2:00 PM.`;
            } else if (lowercaseQuery.includes("notification") || lowercaseQuery.includes("pulse") || lowercaseQuery.includes("important")) {
                reply = `You have two important notifications: Midterm Project Guidelines have been released, and there is a Guest Lecture tomorrow at 2:30 PM with Dr. Alan Turing.`;
            } else if (lowercaseQuery.includes("quantum")) {
                 reply = `Your Quantum Computing lab is scheduled for 2:00 PM today in Lab 1.`;
            } else {
                reply = `I can help you with your schedule or recent notifications. Based on my context, I don't have information about that right now.`;
            }

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500)); 
        }

        // ------------------------------------------------------------------
        // STEP 4: RESPOND TO FRONTEND
        // ------------------------------------------------------------------
        return res.status(200).json({
            success: true,
            reply: reply
        });

    } catch (error) {
        console.error("Copilot Error:", error);
        return res.status(500).json({ success: false, message: "Failed to process RAG query." });
    }
};
