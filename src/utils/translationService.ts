// Translation Service using Gemini AI
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface TranslationResult {
    originalText: string;
    translatedText: string;
    fromLanguage: string;
    toLanguage: string;
    timestamp: number;
}

export class TranslationService {
    private model: any;
    private targetLanguage: string;

    constructor(targetLanguage: string = 'en') {
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        this.targetLanguage = targetLanguage;
    }

    async translateText(text: string): Promise<string> {
        if (!text.trim()) return '';

        try {
            const prompt = `Translate the following text to ${this.getLanguageName(this.targetLanguage)}. Only return the translation, nothing else:\n\n"${text}"`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const translatedText = response.text().trim();

            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original if translation fails
        }
    }

    async translateBatch(texts: string[]): Promise<string[]> {
        const promises = texts.map(text => this.translateText(text));
        return Promise.all(promises);
    }

    setTargetLanguage(language: string) {
        this.targetLanguage = language;
    }

    private getLanguageName(code: string): string {
        const languages: { [key: string]: string } = {
            'en': 'English',
            'hi': 'Hindi',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'it': 'Italian',
            'ta': 'Tamil',
            'te': 'Telugu',
            'bn': 'Bengali',
            'mr': 'Marathi',
            'ur': 'Urdu',
            'auto': 'Auto-detect'
        };
        return languages[code] || code;
    }
}

// Speech Recognition Service
export class SpeechRecognitionService {
    private recognition: any;
    private isListening: boolean = false;
    private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
    private language: string;

    constructor(language: string = 'en-US') {
        this.language = this.getRecognitionLanguage(language);
        this.initializeRecognition();
    }

    private initializeRecognition() {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.language;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event: any) => {
            const results = event.results;
            const lastResult = results[results.length - 1];
            const transcript = lastResult[0].transcript;
            const isFinal = lastResult.isFinal;

            if (this.onResultCallback) {
                this.onResultCallback(transcript, isFinal);
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                // Restart if no speech
                if (this.isListening) {
                    this.recognition.start();
                }
            }
        };

        this.recognition.onend = () => {
            // Restart if still supposed to be listening
            if (this.isListening) {
                this.recognition.start();
            }
        };
    }

    start(onResult: (text: string, isFinal: boolean) => void) {
        if (!this.recognition) {
            console.error('Speech Recognition not initialized');
            return;
        }

        this.onResultCallback = onResult;
        this.isListening = true;
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
        }
    }

    stop() {
        this.isListening = false;
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    setLanguage(language: string) {
        this.language = this.getRecognitionLanguage(language);
        if (this.recognition) {
            this.recognition.lang = this.language;
        }
    }

    isSupported(): boolean {
        return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    }

    private getRecognitionLanguage(code: string): string {
        const languages: { [key: string]: string } = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'ar': 'ar-SA',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'it': 'it-IT',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'bn': 'bn-IN',
            'mr': 'mr-IN',
            'ur': 'ur-PK'
        };
        return languages[code] || 'en-US';
    }
}

// Text-to-Speech Service
export class TextToSpeechService {
    private synth: SpeechSynthesis;
    private language: string;

    constructor(language: string = 'en-US') {
        this.synth = window.speechSynthesis;
        this.language = language;
    }

    speak(text: string, rate: number = 1.0) {
        if (!text) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.language;
        utterance.rate = rate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        this.synth.speak(utterance);
    }

    stop() {
        this.synth.cancel();
    }

    setLanguage(language: string) {
        this.language = language;
    }

    isSupported(): boolean {
        return !!window.speechSynthesis;
    }
}

export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', flag: '🇵🇰' }
];
