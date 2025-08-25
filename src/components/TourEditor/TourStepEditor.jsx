import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Type, 
  MousePointer, 
  Move, 
  Trash2,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { apiService } from '../../services/api';

const TourStepEditor = ({ step, stepIndex, onStepUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [annotationMode, setAnnotationMode] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleTitleChange = (e) => {
    onStepUpdate(stepIndex, {
      ...step,
      title: e.target.value
    });
  };

  const handleDescriptionChange = (e) => {
    onStepUpdate(stepIndex, {
      ...step,
      description: e.target.value
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await apiService.uploadScreenshot(file);
      onStepUpdate(stepIndex, {
        ...step,
        screenshot: response.url
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCanvasClick = (e) => {
    if (!annotationMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newAnnotation = {
      id: Date.now().toString(),
      x: x,
      y: y,
      width: 20,
      height: 10,
      text: 'Click here',
      type: annotationMode
    };

    onStepUpdate(stepIndex, {
      ...step,
      annotations: [...step.annotations, newAnnotation]
    });

    setAnnotationMode(null);
  };

  const handleAnnotationUpdate = (annotationId, updates) => {
    const updatedAnnotations = step.annotations.map(annotation =>
      annotation.id === annotationId ? { ...annotation, ...updates } : annotation
    );

    onStepUpdate(stepIndex, {
      ...step,
      annotations: updatedAnnotations
    });
  };

  const handleDeleteAnnotation = (annotationId) => {
    const updatedAnnotations = step.annotations.filter(
      annotation => annotation.id !== annotationId
    );

    onStepUpdate(stepIndex, {
      ...step,
      annotations: updatedAnnotations
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Step Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step Title
            </label>
            <input
              type="text"
              value={step.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter step title..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={step.description}
              onChange={handleDescriptionChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe what happens in this step..."
            />
          </div>
        </div>
      </div>

      {/* Screenshot Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Screenshot</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {step.screenshot ? (
          <div className="relative">
            <div 
              ref={canvasRef}
              className="relative bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
              onClick={handleCanvasClick}
              style={{ aspectRatio: '16/9' }}
            >
              <img
                src={`http://localhost:5000${step.screenshot}`}
                alt="Step screenshot"
                className="w-full h-full object-contain"
              />
              
              {/* Annotations */}
              {step.annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className={`absolute cursor-pointer group ${
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnnotation(annotation.id);
                  }}
                >
                  {annotation.type === 'text' && (
                    <div className="text-white text-xs p-1 font-medium">
                      {annotation.text}
                    </div>
                  )}
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAnnotation(annotation.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Annotation Tools */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <button
                onClick={() => setAnnotationMode('highlight')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  annotationMode === 'highlight' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>Highlight</span>
              </button>
              
              <button
                onClick={() => setAnnotationMode('arrow')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  annotationMode === 'arrow' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MousePointer className="w-4 h-4" />
                <span>Arrow</span>
              </button>
              
              <button
                onClick={() => setAnnotationMode('text')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  annotationMode === 'text' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Text</span>
              </button>
            </div>

            {annotationMode && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                Click on the screenshot to add a {annotationMode} annotation
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No screenshot uploaded yet</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Upload Screenshot
            </button>
          </div>
        )}
      </div>

      {/* Annotation Details */}
      {selectedAnnotation && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Edit Annotation
          </h4>
          {(() => {
            const annotation = step.annotations.find(a => a.id === selectedAnnotation);
            if (!annotation) return null;
            
            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text
                  </label>
                  <input
                    type="text"
                    value={annotation.text}
                    onChange={(e) => handleAnnotationUpdate(selectedAnnotation, { text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={annotation.width}
                      onChange={(e) => handleAnnotationUpdate(selectedAnnotation, { width: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={annotation.height}
                      onChange={(e) => handleAnnotationUpdate(selectedAnnotation, { height: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedAnnotation(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Done
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </motion.div>
  );
};

export default TourStepEditor;