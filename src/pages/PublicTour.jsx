import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  X,
  User,
  Calendar,
  Eye,
  MousePointer,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { apiService } from '../services/api';

const PublicTour = () => {
  const { shareUrl } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);

  useEffect(() => {
    if (shareUrl) {
      fetchTour();
      apiService.incrementClick(shareUrl).catch(console.error);
    }
  }, [shareUrl]);

  useEffect(() => {
    let interval;
    if (isPlaying && tour && currentStep < tour.steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < tour.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, tour]);

  const fetchTour = async () => {
    try {
      const data = await apiService.getPublicTour(shareUrl);
      setTour(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tour...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Tour Not Found</h1>
          <p className="text-gray-400">{error || 'This tour may have been removed or made private.'}</p>
        </div>
      </div>
    );
  }

  const currentStepData = tour.steps[currentStep];

  return (
    <div className={`min-h-screen bg-gray-900 text-white flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      {!isFullscreen && (
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-800 border-b border-gray-700 p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{tour.title}</h1>
              <p className="text-gray-400">{tour.description}</p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{typeof tour.creator === 'object' ? tour.creator.username : 'Anonymous'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(tour.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{tour.views} views</span>
              </div>
            </div>
          </div>
        </motion.header>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center justify-center p-8"
            >
              {currentStepData.screenshot ? (
                <div className="relative max-w-6xl w-full">
                  <img
                    src={`http://localhost:5000${currentStepData.screenshot}`}
                    alt={currentStepData.title}
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                  
                  {showAnnotations && currentStepData.annotations.map((annotation) => (
                    <motion.div
                      key={annotation.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className={`absolute cursor-pointer ${
                        annotation.type === 'highlight' 
                          ? 'bg-yellow-400 bg-opacity-50 border-2 border-yellow-500' 
                          : annotation.type === 'arrow'
                          ? 'bg-red-500 bg-opacity-75'
                          : 'bg-blue-500 bg-opacity-75'
                      }`}
                      style={{
                        left: `${annotation.x}%`,
                        top: `${annotation.y}%`,
                        width: `${annotation.width}%`,
                        height: `${annotation.height}%`,
                      }}
                    >
                      {annotation.type === 'text' && (
                        <div className="text-white text-sm p-2 font-medium">
                          {annotation.text}
                        </div>
                      )}
                      {annotation.type === 'arrow' && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <MousePointer className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-gray-800 w-32 h-32 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <Play className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Screenshot</h3>
                  <p className="text-gray-400">This step doesn't have a screenshot yet.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-75"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={prevStep} disabled={currentStep === 0} className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={togglePlay} className="p-2 hover:bg-gray-700 rounded-lg">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={nextStep} disabled={currentStep === tour.steps.length - 1} className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {tour.steps.length}
          </div>

          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600"
          >
            {showAnnotations ? 'Hide Annotations' : 'Show Annotations'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicTour;
