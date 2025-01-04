import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { useState, useRef } from "react";
// import { transliterate } from "transliteration";
import { Mic, PlayCircle, StopCircle, Languages, Check } from 'lucide-react'
import './App.css';

const App = () => {

  const AZURE_SUBSCRIPTION_KEY = import.meta.env.VITE_AZURE_SUBSCRIPTION_KEY;
  const AZURE_REGION = import.meta.env.VITE_AZURE_REGION;

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [language, setLanguage] = useState("en-US");
  // const [autoDetect, setAutoDetect] = useState(false);

  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);

  const languageOptions = [
    { code: "en-US", label: "English (US)" },
    { code: "es-ES", label: "Spanish (Spain)" },
    { code: "fr-FR", label: "French (France)" },
    { code: "de-DE", label: "German (Germany)" },
    { code: "hi-IN", label: "Hindi (India)" },
    { code: "zh-CN", label: "Chinese (Mandarin)" },
    { code: "ja-JP", label: "Japanese" },
  ];

  const startRecognition = () => {
    if (!AZURE_SUBSCRIPTION_KEY || !AZURE_REGION) {
      alert("Azure credentials are missing.");
      return;
    }

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      AZURE_SUBSCRIPTION_KEY,
      AZURE_REGION
    );
    speechConfig.speechRecognitionLanguage = language;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    recognizerRef.current = recognizer;

    setTranscript("");
    setPartialTranscript("");
    setIsListening(true);

    recognizer.recognizing = (sender, event) => {
        sender;
    
      setPartialTranscript(event.result.text);
    };

    recognizer.recognized = (sender, event) => {
        sender;
      if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        let finalText = event.result.text;
        // if (language === "hi-IN") {
        //   console.log("Transliterating Hindi text...");
        //   finalText = transliterate(finalText);
        // }

        setTranscript((prev) => `${prev} ${finalText}`.trim());
        setPartialTranscript("");
      }
    };

    recognizer.startContinuousRecognitionAsync();
  };




  const stopRecognition = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(() => {
        recognizerRef.current?.close();
        recognizerRef.current = null;
        setIsListening(false);
      });
    }
  };

  return (
    <div className="container">
      <header className="header">
        <Mic className="header-icon" />
        <h1 className="header-title">VocaScribe Speech to Text</h1>
      </header>

      <main className="main">
        <div className="card">
          <div className="controls">
            <div className="toggle-container">
              <label className="toggle-label">
                <Languages className="w-5 h-5" />
                {language}
              </label>
              {/* <button
                className="toggle"
                onClick={() => setAutoDetect(!autoDetect)}
                data-checked={autoDetect}
              >
                <span className="toggle-handle" />
              </button> */}
            </div>

            <div className="language-select">
              <label className="select-label">
                Choose Language
              </label>
              <div className="select-wrapper">
                <select
                  className="select"
                  disabled={ isListening}
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <Check className="select-icon" />
              </div>
            </div>

            <div className="button-container">
              <button
                onClick={isListening ? stopRecognition : startRecognition}
                className={`button ${isListening ? 'button-stop' : 'button-start'}`}
              >
                {isListening ? (
                  <>
                    <StopCircle className="w-5 h-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" />
                    Start Recording
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="transcript">
            <div className="transcript-header">
              <h2 className="transcript-title">Live Transcript</h2>
              {isListening && (
                <div className="recording-indicator">
                  <span className="recording-dot-pulse" />
                  <span className="recording-dot" />
                </div>
              )}
            </div>
            
            {/* Partial transcript display */}
            <div className="partial-transcript">
              {partialTranscript}
            </div>

            <div className="transcript-container">
              <textarea
                className="transcript-textarea"
                placeholder="Your speech will appear here..."
                readOnly
                value={transcript}
              />
              {!isListening && !transcript && (
                <div className="transcript-overlay">
                  Click &quot;Start Recording&quot; to begin transcription
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
