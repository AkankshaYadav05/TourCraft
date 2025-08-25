import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Square, 
  Play, 
  Pause, 
  Download, 
  X, 
  Monitor,
  Smartphone,
  Tablet,
  AlertCircle
} from 'lucide-react';

const ScreenRecorder = ({ onClose, onScreenshotCapture }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  const startRecording = async () => {
    try {
      setError('');
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true
      });

      setStream(displayStream);
      
      const mediaRecorder = new MediaRecorder(displayStream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        displayStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Failed to start screen recording. Please ensure you grant permission.');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const takeScreenshot = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });

      const video = document.createElement('video');
      video.srcObject = displayStream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          const file = new File([blob], 'screenshot.png', { type: 'image/png' });
          onScreenshotCapture(file);
          
          // Stop the stream
          displayStream.getTracks().forEach(track => track.stop());
          onClose();
        }, 'image/png');
      };
    } catch (err) {
      setError('Failed to capture screenshot. Please ensure you grant permission.');
      console.error('Error taking screenshot:', err);
    }
  };

  const downloadRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screen-recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Screen Recorder</h2>
                <p className="text-sm text-gray-600">Capture your workflow or take screenshots</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Recording Status */}
            {isRecording && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-700 font-medium">
                        {isPaused ? 'Recording Paused' : 'Recording...'}
                      </span>
                    </div>
                    <span className="text-red-600 font-mono text-lg">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={takeScreenshot}
                className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <Camera className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Take Screenshot</h3>
                <p className="text-sm text-blue-100">Capture a single frame</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-6 rounded-xl transition-all ${
                  isRecording 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                }`}
              >
                {isRecording ? (
                  <Square className="w-8 h-8 mx-auto mb-3" />
                ) : (
                  <Play className="w-8 h-8 mx-auto mb-3" />
                )}
                <h3 className="font-semibold mb-1">
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </h3>
                <p className="text-sm opacity-90">
                  {isRecording ? 'End screen capture' : 'Record your screen'}
                </p>
              </motion.button>
            </div>

            {/* Recording Controls */}
            {isRecording && (
              <div className="flex items-center justify-center space-x-4 mb-8">
                <button
                  onClick={pauseRecording}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              </div>
            )}

            {/* Download Section */}
            {recordedChunks.length > 0 && !isRecording && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">Recording Complete</h4>
                      <p className="text-sm text-green-700">Your screen recording is ready</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadRecording}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Device Preview Options */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Options</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <Monitor className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Desktop</span>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <Tablet className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Tablet</span>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <Smartphone className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Mobile</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Recording Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Choose the specific window or entire screen when prompted</li>
                <li>• Speak clearly if recording audio narration</li>
                <li>• Move slowly to ensure smooth playback</li>
                <li>• Use screenshots for static content, recordings for workflows</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScreenRecorder;