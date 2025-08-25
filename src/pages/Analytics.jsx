import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Globe,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { apiService } from '../services/api';
import Layout from '../components/Layout/Layout';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await apiService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  const { overview, engagementData, topTours } = analytics;

  const stats = [
    {
      name: 'Total Tours',
      value: overview.totalTours,
      icon: BarChart3,
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Total Views',
      value: overview.totalViews,
      icon: Eye,
      change: '+18%',
      changeType: 'increase'
    },
    {
      name: 'Total Clicks',
      value: overview.totalClicks,
      icon: MousePointer,
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Public Tours',
      value: overview.publicTours,
      icon: Globe,
      change: '+5%',
      changeType: 'increase'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track the performance of your product tours
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <stat.icon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.changeType === 'increase' ? (
                  <ArrowUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ml-1 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Engagement Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Engagement Over Time</h3>
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            
            {/* Simple Bar Chart */}
            <div className="space-y-4">
              {engagementData.map((data, index) => (
                <div key={data.date} className="flex items-center space-x-4">
                  <div className="w-16 text-sm text-gray-600">
                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(data.views / 100) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{data.views}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(data.clicks / 50) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">{data.clicks}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Views</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Clicks</span>
              </div>
            </div>
          </motion.div>

          {/* Top Tours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Tours</h3>
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            
            <div className="space-y-4">
              {topTours.map((tour, index) => (
                <div key={tour.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 w-8 h-8 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-indigo-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 truncate max-w-48">
                        {tour.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {tour.isPublic ? (
                          <Globe className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        <span>{tour.isPublic ? 'Public' : 'Private'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span>{tour.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MousePointer className="w-3 h-3 text-gray-400" />
                        <span>{tour.clicks}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Additional Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Engagement Insights</h3>
              <p className="text-indigo-200">
                Your tours are performing well! Keep creating engaging content to maintain growth.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {overview.totalClicks > 0 ? Math.round((overview.totalClicks / overview.totalViews) * 100) : 0}%
              </div>
              <div className="text-indigo-200">Click-through rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Analytics;