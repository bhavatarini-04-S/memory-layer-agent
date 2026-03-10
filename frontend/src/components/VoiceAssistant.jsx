import { useState, useEffect } from 'react';

const VoiceAssistant = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    // Check microphone permission
    checkMicrophonePermission();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US'; // Can be changed to support multiple languages

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setTranscript('Listening...');
      setPermissionDenied(false);
    };

    recognitionInstance.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        handleCommand(finalTranscript);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setPermissionDenied(true);
        setPermissionStatus('denied');
        setTranscript('Microphone access denied. Please allow microphone permissions.');
      } else if (event.error === 'no-speech') {
        setTranscript('No speech detected. Please try again.');
      } else if (event.error === 'network') {
        setTranscript('Network error. Please check your connection.');
      } else {
        setTranscript(`Error: ${event.error}`);
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setPermissionStatus(result.state);
        
        result.onchange = () => {
          setPermissionStatus(result.state);
          if (result.state === 'denied') {
            setPermissionDenied(true);
          } else if (result.state === 'granted') {
            setPermissionDenied(false);
          }
        };
      }
    } catch (error) {
      console.log('Permission API not supported:', error);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionDenied(false);
      setPermissionStatus('granted');
      setTranscript('Microphone access granted! Click "Start Listening" to begin.');
    } catch (error) {
      console.error('Microphone permission error:', error);
      setPermissionDenied(true);
      setPermissionStatus('denied');
      setTranscript('Unable to access microphone. Please check browser settings.');
    }
  };

  const handleCommand = (command) => {
    console.log('Voice command:', command);
    
    // Process voice commands
    const lowerCommand = command.toLowerCase();
    
    // File location patterns
    if (lowerCommand.includes('file') || lowerCommand.includes('document')) {
      if (onCommand) {
        onCommand({ type: 'file_location', text: command });
      }
    }
    
    // Search patterns
    if (lowerCommand.includes('find') || lowerCommand.includes('search') || lowerCommand.includes('show')) {
      if (onCommand) {
        onCommand({ type: 'search', text: command });
      }
    }
    
    // Upload patterns
    if (lowerCommand.includes('upload')) {
      if (onCommand) {
        onCommand({ type: 'upload', text: command });
      }
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          🎤 Voice assistant is not supported in your browser. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎤 Voice Assistant
          </h3>
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-xs font-medium">
            Permission Denied
          </span>
        </div>

        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 text-sm mb-3">
            ⚠️ Microphone access is required to use voice assistant.
          </p>
          <p className="text-red-700 dark:text-red-300 text-xs mb-4">
            To enable voice assistant:
          </p>
          <ol className="text-red-700 dark:text-red-300 text-xs list-decimal list-inside space-y-1">
            <li>Click the lock/camera icon in the address bar</li>
            <li>Allow microphone access for this site</li>
            <li>Refresh the page or click "Request Permission" below</li>
          </ol>
        </div>

        <button
          onClick={requestMicrophonePermission}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Request Microphone Permission
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🎤 Voice Assistant
        </h3>
        <div className="flex items-center gap-2">
          {isListening && (
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[60px]">
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {transcript || 'Click the microphone to start speaking...'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        {!isListening ? (
          <button
            onClick={startListening}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Listening
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Stop
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p className="font-semibold mb-1">Try saying:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>"Upload document..."</li>
          <li>"Find information about..."</li>
          <li>"Search my files..."</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceAssistant;
