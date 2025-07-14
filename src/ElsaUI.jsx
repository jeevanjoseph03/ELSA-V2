import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Groq from "groq-sdk";
import axios from "axios";

// --- ICONS ---
const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


// --- CORE LOGIC (Mostly Unchanged) ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY, dangerouslyAllowBrowser: true });
const AZURE_SPEECH_KEY = process.env.REACT_APP_AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.REACT_APP_AZURE_SPEECH_REGION;

export default function ElsaUI() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatHistory, setShowChatHistory] = useState(false);

  const chatHistoryRef = useRef(null);
  const audioRef = useRef(null);
  const azureTokenRef = useRef({ token: null, expiry: 0 });
  const recognitionRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const transcriptRef = useRef("");

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition is not supported in this browser.");
    }
  }, []);

  const getAzureAuthToken = useCallback(async () => {
    if (azureTokenRef.current.token && azureTokenRef.current.expiry > Date.now() + 60000) return azureTokenRef.current.token;
    try {
      const response = await axios({ method: 'POST', url: `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, headers: { 'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY } });
      azureTokenRef.current = { token: response.data, expiry: Date.now() + 9 * 60 * 1000 };
      return response.data;
    } catch (error) {
      console.error("Error fetching Azure auth token:", error);
      return null;
    }
  }, []);

  const speakWithAzure = useCallback(async (text) => {
    try {
      setIsSpeaking(true);
      const accessToken = await getAzureAuthToken();
      if (!accessToken) throw new Error("Failed to get Azure token.");
      const processedText = text.replace(/([.?!])\s*/g, '$1 <break time="500ms"/> ').replace(/([,;])\s*/g, '$1 <break time="250ms"/> ');
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'><voice name='en-US-JennyNeural'><mstts:express-as style='empathetic'>${processedText}</mstts:express-as></voice></speak>`;
      const response = await axios({ method: 'POST', url: `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3', 'User-Agent': 'ELSA' }, data: ssml, responseType: 'blob' });
      const audioUrl = URL.createObjectURL(response.data);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch((e) => console.error("Audio play failed", e));
      }
    } catch (error) {
      console.error("Error with Azure TTS:", error);
      setIsSpeaking(false);
    }
  }, [getAzureAuthToken]);

  const getGroqResponse = useCallback(async (userInput) => {
    if (!userInput) return;
    setIsSpeaking(true);
    setIsListening(false);
    const userMessage = { role: "user", content: userInput };
    const historyForApi = [...chatHistory, userMessage];
    setChatHistory(historyForApi);
    try {
      const { choices } = await groq.chat.completions.create({
        messages: [{ role: "system", content: "You are ELSA, a compassionate AI therapist. Use a warm, empathetic tone. Validate feelings and offer gentle advice. Keep responses concise and use natural pauses to create a calm rhythm. Respond in plain text only.Also if it is a fresh conversation start by introducing yourseflf at the first time only" }, ...historyForApi],
        model: "llama-3.3-70b-versatile",
      });
      const aiText = choices[0]?.message?.content || "I'm not sure how to respond.";
      setChatHistory(prev => [...prev, { role: "assistant", content: aiText }]);
      speakWithAzure(aiText);
    } catch (error) {
      console.error("Error fetching Groq response:", error);
      const fallbackText = "I'm having a little trouble connecting. Please try again in a moment.";
      setChatHistory(prev => [...prev, { role: "assistant", content: fallbackText }]);
      speakWithAzure(fallbackText);
    }
  }, [chatHistory, speakWithAzure]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onresult = (event) => {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      const currentTranscript = Array.from(event.results).map(result => result[0]).map(result => result.transcript).join('');
      setTranscript(currentTranscript);
      speechTimeoutRef.current = setTimeout(() => { recognition.stop(); }, 1500);
    };
    recognition.onerror = (event) => { console.error("Speech recognition error:", event.error); setIsListening(false); };
    recognition.onend = () => {
      if (isListening) {
        setIsListening(false);
        const finalTranscript = transcriptRef.current.trim();
        if (finalTranscript) getGroqResponse(finalTranscript);
      }
    };
  }, [getGroqResponse, isListening]);

  useEffect(() => {
    if (chatHistoryRef.current && showChatHistory) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory, showChatHistory]);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isListening) return;
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsListening(true);
    setTranscript("");
    try { recognition.start(); } catch (error) { console.error("Error starting speech recognition:", error); setIsListening(false); }
  };

  // --- REIMAGINED RENDER LOGIC ---
  return (
    <div className="fixed inset-0 w-full h-full font-sans">
      <audio ref={audioRef} onEnded={() => setIsSpeaking(false)} className="hidden" />

      {/* Main Interaction Area */}
      <div className="flex flex-col items-center justify-center h-full w-full relative">
        
        {/* The Breathing Orb */}
        <motion.div
          className="w-48 h-48 rounded-full cursor-pointer flex items-center justify-center"
          onClick={startListening}
          animate={{
            scale: isListening ? 1.1 : 1,
            boxShadow: isSpeaking 
              ? `0 0 80px 20px #996cc3ff, inset 0 0 40px #6c459fff`
              : isListening 
              ? `0 0 70px 15px #dcc092ff, inset 0 0 30px #f0c888ff`
              : `0 0 60px 10px #9a8c98, inset 0 0 20px #9a8c98`,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 15,
            mass: 2,
          }}
        >
          {/* Gentle pulse animation for idle state */}
          {!isListening && !isSpeaking && (
            <motion.div
              className="w-full h-full rounded-full"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ boxShadow: `inset 0 0 20px #c9ada7` }}
            />
          )}
        </motion.div>

        {/* Status and Transcript Text */}
        <div className="absolute bottom-1/4 text-center px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={isListening ? "listening" : isSpeaking ? "speaking" : "idle"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl text-sanctuary-light mb-4"
            >
              {isListening ? "I'm listening..." : isSpeaking ? "ELSA is responding..." : "Tap the light to speak"}
            </motion.p>
          </AnimatePresence>
          {transcript && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="text-lg text-sanctuary-hope max-w-md"
            >
              {transcript}
            </motion.p>
          )}
        </div>
      </div>

      {/* History Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full text-sanctuary-light/70 hover:text-sanctuary-light hover:bg-white/10 transition-colors duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowChatHistory(!showChatHistory)}
        aria-label="Toggle Chat History"
      >
        <HistoryIcon />
      </motion.button>

      {/* History Panel (Glassmorphism) */}
      <AnimatePresence>
        {showChatHistory && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-sanctuary-calm/70 backdrop-blur-lg rounded-t-2xl shadow-2xl z-20 max-h-[60%] border-t border-white/10"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-sanctuary-hope">Conversation History</h3>
              <button onClick={() => setShowChatHistory(false)} className="text-sanctuary-light/70 hover:text-sanctuary-light transition-colors">
                <CloseIcon />
              </button>
            </div>
            <div ref={chatHistoryRef} className="p-4 overflow-y-auto h-full">
              {chatHistory.length === 0 ? (
                <p className="text-sanctuary-warm text-center">No conversation yet.</p>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`px-4 py-2 rounded-xl max-w-lg ${message.role === "user" ? "bg-sanctuary-hope/80 text-white" : "bg-sanctuary-light/90 text-sanctuary-calm"}`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
