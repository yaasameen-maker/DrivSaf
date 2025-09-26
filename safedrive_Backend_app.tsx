import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Shield, Clock, TrendingUp, AlertTriangle, CheckCircle, Car, Camera } from 'lucide-react';

const SafeDriveApp = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [speedLimit, setSpeedLimit] = useState(35);
  const [tripData, setTripData] = useState({
    distance: 0,
    duration: 0,
    averageSpeed: 0,
    maxSpeed: 0,
    speedViolations: 0,
    hardBraking: 0,
    rapidAcceleration: 0,
    safetyScore: 95
  });
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // NYC
  const [mapProvider, setMapProvider] = useState('waze');
  const intervalRef = useRef(null);

  // Simulate GPS tracking
  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        // Simulate speed changes
        const newSpeed = Math.max(0, currentSpeed + (Math.random() - 0.5) * 10);
        setCurrentSpeed(Math.round(newSpeed));
        
        // Update trip data
        setTripData(prev => ({
          ...prev,
          distance: prev.distance + (newSpeed / 3600), // Convert to miles
          duration: prev.duration + 1,
          maxSpeed: Math.max(prev.maxSpeed, newSpeed),
          averageSpeed: Math.round((prev.averageSpeed + newSpeed) / 2),
          speedViolations: newSpeed > speedLimit ? prev.speedViolations + 1 : prev.speedViolations,
          safetyScore: Math.max(60, 100 - (prev.speedViolations * 2) - (prev.hardBraking * 3))
        }));

        // Check for alerts
        if (newSpeed > speedLimit + 5) {
          setAlerts(prev => [...prev.slice(-4), {
            id: Date.now(),
            type: 'speed',
            message: `Speed Alert: ${newSpeed} mph in ${speedLimit} mph zone`,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, currentSpeed, speedLimit]);

  const startTrip = () => {
    setIsTracking(true);
    setCurrentSpeed(25);
    setAlerts([]);
    setTripData({
      distance: 0,
      duration: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      speedViolations: 0,
      hardBraking: 0,
      rapidAcceleration: 0,
      safetyScore: 100
    });
  };

  const endTrip = () => {
    setIsTracking(false);
    setCurrentSpeed(0);
  };

  const connectToMaps = (provider) => {
    setMapProvider(provider);
    // In a real app, this would establish API connections
    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'info',
      message: `Connected to ${provider === 'waze' ? 'Waze' : 'Google Maps'}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const exportData = () => {
    const exportData = {
      tripId: `trip_${Date.now()}`,
      startTime: new Date().toISOString(),
      ...tripData,
      alerts: alerts,
      mapProvider: mapProvider,
      location: location
    };
    
    // In a real app, this would send to insurance API
    console.log('Exporting to Insurance API:', exportData);
    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: 'Trip data exported to insurance partner',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">SafeDrive</h1>
              <p className="text-blue-100">Insurance Analytics</p>
            </div>
            <Shield className="h-10 w-10" />
          </div>
        </div>

        {/* Map Provider Selection */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-3">Navigation Integration</h3>
          <div className="flex gap-2">
            <button
              onClick={() => connectToMaps('waze')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                mapProvider === 'waze' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Navigation className="h-4 w-4" />
              Waze
            </button>
            <button
              onClick={() => connectToMaps('gmaps')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                mapProvider === 'gmaps' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Google Maps
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Current Speed</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{currentSpeed} mph</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">Speed Limit</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{speedLimit} mph</div>
            </div>
          </div>
        </div>

        {/* Trip Controls */}
        <div className="p-4 border-b">
          <div className="flex gap-3">
            <button
              onClick={startTrip}
              disabled={isTracking}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              {isTracking ? 'Tracking...' : 'Start Trip'}
            </button>
            <button
              onClick={endTrip}
              disabled={!isTracking}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold"
            >
              End Trip
            </button>
          </div>
        </div>

        {/* Trip Statistics */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-3">Trip Analytics</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium">{tripData.distance.toFixed(1)} mi</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{Math.floor(tripData.duration / 60)}:{(tripData.duration % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Speed:</span>
              <span className="font-medium">{tripData.averageSpeed} mph</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Speed:</span>
              <span className="font-medium">{tripData.maxSpeed} mph</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Speed Violations:</span>
              <span className="font-medium text-red-600">{tripData.speedViolations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Safety Score:</span>
              <span className={`font-medium ${tripData.safetyScore >= 90 ? 'text-green-600' : tripData.safetyScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                {tripData.safetyScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Live Alerts */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-3">Live Alerts</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No alerts</p>
            ) : (
              alerts.slice(-3).map(alert => (
                <div key={alert.id} className={`p-2 rounded text-sm ${
                  alert.type === 'speed' ? 'bg-red-100 text-red-800' :
                  alert.type === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <div className="flex justify-between">
                    <span>{alert.message}</span>
                    <span className="text-xs opacity-75">{alert.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Insurance Integration */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-3">Insurance Integration</h3>
          <div className="bg-green-50 p-3 rounded-lg mb-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Connected to Progressive</span>
            </div>
            <p className="text-xs text-green-700">Real-time data sharing enabled</p>
          </div>
          <button
            onClick={exportData}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Export Trip Data
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Data shared with insurance partner for usage-based pricing
          </p>
        </div>
      </div>

      {/* Development Notes */}
      <div className="max-w-md mx-auto mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Development Notes:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Real GPS integration needed for production</li>
          <li>• Waze/Google Maps API integration required</li>
          <li>• Insurance partner API endpoints to implement</li>
          <li>• Enhanced AI for road condition detection</li>
          <li>• Privacy controls and data consent management</li>
        </ul>
      </div>
    </div>
  );
};

export default SafeDriveApp;