import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Upload, 
  Camera, 
  Edit3, 
  Trash2, 
  Eye,
  Move,
  Type,
  MousePointer,
  Play,
  Share2,
  Globe,
  Lock
} from 'lucide-react';
import { apiService } from '../services/api';
import Layout from '../components/Layout/Layout';
import TourStepEditor from '../components/TourEditor/TourStepEditor';
import ScreenRecorder from '../components/TourEditor/ScreenRecorder';

const EditTour = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [showRecorder, setShowRecorder] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTour();
    }
  }, [id]);

  const fetchTour = async () => {
    try {
      const data = await apiService.getTour(id);
      setTour(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTour = async () => {
    setSaving(true);
    try {
      const updatedTour = await apiService.updateTour(id, tour);
      setTour(updatedTour);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = () => {
    const newStep = {
      id: Date.now().toString(),
      title: 'New Step',
      description: 'Add your description here...',
      screenshot: '',
      annotations: [],
      order: tour.steps.length
    };
    
    setTour({
      ...tour,
      steps: [...tour.steps, newStep]
    });
    setActiveStep(tour.steps.length);
  };

  const handleDeleteStep = (stepIndex) => {
    if (!window.confirm('Are you sure you want to delete this step?')) return;
    
    const updatedSteps = tour.steps.filter((_, index) => index !== stepIndex);
    setTour({
      ...tour,
      steps: updatedSteps
    });
    
    if (activeStep >= updatedSteps.length) {
      setActiveStep(Math.max(0, updatedSteps.length - 1));
    }
  };

  const handleStepUpdate = (stepIndex, updatedStep) => {
    const updatedSteps = tour.steps.map((step, index) => 
      index === stepIndex ? updatedStep : step
    );
    setTour({
      ...tour,
      steps: updatedSteps
    });
  };

  const handleToggleVisibility = async () => {
    try {
      const updatedTour = await apiService.toggleTourVisibility(id);
      setTour(updatedTour);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePreviewTour = () => {
    if (tour.isPublic && tour.shareUrl) {
      window.open(`/tour/${tour.shareUrl}`, '_blank');
    } else {
      alert('Please make the tour public first to preview it.');
    }
  };

  const handleScreenshotCapture = async (file) => {
    try {
      const response = await apiService.uploadScreenshot(file);
      if (tour.steps[activeStep]) {
        handleStepUpdate(activeStep, {
          ...tour.steps[activeStep],
          screenshot: response.url
        });
      }
    } catch (err) {
      setError('Failed to upload screenshot');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !tour) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error || 'Tour not found'}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tour.title}</h1>
              <p className="text-gray-600">{tour.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRecorder(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Record</span>
            </button>
            <button
              onClick={handleToggleVisibility}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                tour.isPublic 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {tour.isPublic ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              <span>{tour.isPublic ? 'Make Private' : 'Make Public'}</span>
            </button>
            <button
              onClick={handlePreviewTour}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleSaveTour}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tour Steps</h3>
                <button
                  onClick={handleAddStep}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {tour.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeStep === index 
                        ? 'bg-indigo-100 border-2 border-indigo-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {step.title}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStep(index);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            {tour.steps.length > 0 ? (
              <TourStepEditor
                step={tour.steps[activeStep]}
                stepIndex={activeStep}
                onStepUpdate={handleStepUpdate}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No steps yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your first step to start building your tour
                </p>
                <button
                  onClick={handleAddStep}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Add First Step
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Screen Recorder Modal */}
        {showRecorder && (
          <ScreenRecorder
            onClose={() => setShowRecorder(false)}
            onScreenshotCapture={handleScreenshotCapture}
          />
        )}
      </div>
    </Layout>
  );
};

export default EditTour;