export interface VoiceCommand {
  action: string;
  parameters?: Record<string, any>;
  confidence: number;
}

export interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  lastCommand: string | null;
  error: string | null;
}

export class VoiceAssistant {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private shouldKeepListening: boolean = false;
  private state: VoiceAssistantState = {
    isListening: false,
    isProcessing: false,
    lastCommand: null,
    error: null
  };
  private listeners: ((state: VoiceAssistantState) => void)[] = [];
  private wakeWord: string = "Hey AtmosAI";
  private isWakeWordDetected: boolean = false;

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
    this.loadWakeWordFromSettings();
  }

  private initializeSpeechRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.updateState({ error: 'Speech recognition not supported in this browser' });
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.updateState({ isListening: true, error: null });
    };

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
        .toLowerCase()
        .trim();

      if (this.isWakeWordDetected || transcript.includes(this.wakeWord.toLowerCase())) {
        this.isWakeWordDetected = true;
        this.processCommand(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      // Common errors: 'not-allowed', 'no-speech', 'network', 'aborted'
      const message = `Speech recognition error: ${event.error}`;
      this.updateState({ error: message });
      // If permission is granted but transient error, try to restart
      if (this.shouldKeepListening && event.error !== 'not-allowed') {
        try { this.recognition?.stop(); } catch {}
        setTimeout(() => {
          try { this.recognition?.start(); } catch {}
        }, 500);
      } else {
        this.updateState({ isListening: false });
      }
    };

    this.recognition.onend = () => {
      this.isWakeWordDetected = false;
      if (this.shouldKeepListening) {
        // Auto-restart for continuous listening (required on some browsers)
        try { this.recognition?.start(); } catch {}
      } else {
        this.updateState({ isListening: false });
      }
    };
  }

  private initializeSpeechSynthesis() {
    if (typeof window === 'undefined') return;
    this.synthesis = window.speechSynthesis;
    // Preload voices if needed
    if (this.synthesis && typeof this.synthesis.onvoiceschanged !== 'undefined') {
      this.synthesis.onvoiceschanged = () => {
        // no-op, just triggers voices population
      };
    }
  }

  private updateState(updates: Partial<VoiceAssistantState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  private processCommand(transcript: string): void {
    this.updateState({ isProcessing: true, lastCommand: transcript });

    // Remove wake word from transcript
    const cleanTranscript = transcript.replace(this.wakeWord.toLowerCase(), '').trim();
    
    const command = this.parseCommand(cleanTranscript);
    
    if (command) {
      this.executeCommand(command);
    } else {
      this.speak("I didn't understand that command. Try saying 'what's the weather' or 'navigate to dashboard'");
    }

    this.updateState({ isProcessing: false });
  }

  private parseCommand(transcript: string): VoiceCommand | null {
    const lowerTranscript = transcript.toLowerCase();

    // Weather queries
    if (lowerTranscript.includes('weather') || lowerTranscript.includes('temperature') || lowerTranscript.includes('forecast')) {
      return {
        action: 'get_weather',
        parameters: { query: transcript },
        confidence: 0.9
      };
    }

    // Navigation commands
    if (lowerTranscript.includes('dashboard') || lowerTranscript.includes('home')) {
      return {
        action: 'navigate',
        parameters: { page: 'dashboard' },
        confidence: 0.9
      };
    }

    if (lowerTranscript.includes('planner') || lowerTranscript.includes('calendar')) {
      return {
        action: 'navigate',
        parameters: { page: 'planner' },
        confidence: 0.9
      };
    }

    if (lowerTranscript.includes('alerts') || lowerTranscript.includes('warnings')) {
      return {
        action: 'navigate',
        parameters: { page: 'alerts' },
        confidence: 0.9
      };
    }

    if (lowerTranscript.includes('settings') || lowerTranscript.includes('preferences')) {
      return {
        action: 'navigate',
        parameters: { page: 'settings' },
        confidence: 0.9
      };
    }

    // Help command
    if (lowerTranscript.includes('help') || lowerTranscript.includes('commands')) {
      return {
        action: 'help',
        parameters: {},
        confidence: 0.9
      };
    }

    // Location commands
    if (lowerTranscript.includes('location') || lowerTranscript.includes('where am i')) {
      return {
        action: 'get_location',
        parameters: {},
        confidence: 0.8
      };
    }

    return null;
  }

  private async executeCommand(command: VoiceCommand): Promise<void> {
    switch (command.action) {
      case 'get_weather':
        await this.handleWeatherQuery(command.parameters?.query);
        break;
      case 'navigate':
        this.handleNavigation(command.parameters?.page);
        break;
      case 'help':
        this.showHelp();
        break;
      case 'get_location':
        await this.handleLocationQuery();
        break;
      default:
        this.speak("I don't know how to handle that command.");
    }
  }

  private async handleWeatherQuery(query?: string): Promise<void> {
    try {
      // Get current weather data (uses user's last known location if available via backend cache)
      const apiBase = (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_API_BASE_URL) || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/weather/current?lat=37.7749&lng=-122.4194`);
      const data = await response.json();
      
      if (data.success) {
        const weather = data.data;
        const temp = Math.round(weather.temperature);
        const condition = weather.condition?.description || 'unknown';
        const location = weather.locationName || 'San Francisco';
        
        this.speak(`The current weather in ${location} is ${temp} degrees with ${condition}.`);
      } else {
        this.speak("Sorry, I couldn't get the current weather information.");
      }
    } catch (error) {
      this.speak("Sorry, I'm having trouble getting weather information right now.");
    }
  }

  private handleNavigation(page?: string): void {
    if (!page) return;

    // Dispatch custom event for navigation
    const event = new CustomEvent('voice-navigation', { 
      detail: { page } 
    });
    window.dispatchEvent(event);

    this.speak(`Navigating to ${page}.`);
  }

  private showHelp(): void {
    const helpText = "Here are the commands I understand: " +
      "Say 'what's the weather' to get current weather, " +
      "Say 'navigate to dashboard' to go to the dashboard, " +
      "Say 'navigate to planner' to go to the planner, " +
      "Say 'navigate to alerts' to go to alerts, " +
      "Say 'navigate to settings' to go to settings, " +
      "Say 'where am I' to get your location, " +
      "and say 'help' to hear this again.";
    
    this.speak(helpText);
  }

  private async handleLocationQuery(): Promise<void> {
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 60000
          });
        });

        const { latitude, longitude } = position.coords;
        
        // Get location name
        const response = await fetch(`http://localhost:5000/api/weather/reverse-geocode?lat=${latitude}&lng=${longitude}`);
        const data = await response.json();
        
        if (data.success) {
          this.speak(`You are currently in ${data.data.locationName}.`);
        } else {
          this.speak(`You are at coordinates ${latitude.toFixed(4)}, ${longitude.toFixed(4)}.`);
        }
      } else {
        this.speak("Location services are not available.");
      }
    } catch (error) {
      this.speak("I couldn't determine your current location.");
    }
  }

  private speak(text: string): void {
    if (!this.synthesis) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Try to use a pleasant voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.synthesis.speak(utterance);
  }

  public startListening(): void {
    if (!this.recognition) {
      this.updateState({ error: 'Speech recognition not available' });
      return;
    }

    try {
      this.shouldKeepListening = true;
      this.recognition.start();
    } catch (error) {
      this.updateState({ error: 'Failed to start voice recognition' });
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      this.shouldKeepListening = false;
      this.recognition.stop();
    }
  }

  public setWakeWord(wakeWord: string): void {
    this.wakeWord = wakeWord;
  }

  public getState(): VoiceAssistantState {
    return { ...this.state };
  }

  public subscribe(listener: (state: VoiceAssistantState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public destroy(): void {
    this.stopListening();
    this.synthesis?.cancel();
    this.listeners = [];
  }

  private loadWakeWordFromSettings() {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem('atmosai_settings');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.wakeWord && typeof parsed.wakeWord === 'string') {
        this.setWakeWord(parsed.wakeWord);
      }
    } catch {}
  }
}

// Global voice assistant instance
let voiceAssistant: VoiceAssistant | null = null;

export function getVoiceAssistant(): VoiceAssistant {
  if (!voiceAssistant) {
    voiceAssistant = new VoiceAssistant();
  }
  return voiceAssistant;
}

export function destroyVoiceAssistant(): void {
  if (voiceAssistant) {
    voiceAssistant.destroy();
    voiceAssistant = null;
  }
}
