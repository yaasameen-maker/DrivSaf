import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Shield, Clock, TrendingUp, AlertTriangle, CheckCircle, Car, Camera, User, Settings } from 'lucide-react';

const SafeDriveApp = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [speedLimit, setSpeedLimit] = useState(35);
  
  // User Profile Data
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseState: 'NY'
  });

  // Vehicle Information
  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: '',
    color: ''
  });

  // Insurance Information
  const [insuranceInfo, setInsuranceInfo] = useState({
    provider: '',
    policyNumber: '',
    groupNumber: '',
    effectiveDate: '',
    expirationDate: '',
    coverageType: 'Full Coverage',
    deductible: '500'
  });

  // Common car makes and models for dropdowns
  const carMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai', 'Subaru'];
  const insuranceProviders = ['Progressive', 'State Farm', 'Geico', 'Allstate', 'USAA', 'Liberty Mutual', 'Farmers', 'Nationwide'];
  
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
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [mapProvider, setMapProvider] = useState('waze');
  const intervalRef = useRef(null);

  // Simulate GPS tracking
  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        const newSpeed = Math.max(0, currentSpeed + (Math.random() - 0.5) * 10);
        setCurrentSpeed(Math.round(newSpeed));
        
        setTripData(prev => ({
          ...prev,
          distance: prev.distance + (newSpeed / 3600),
          duration: prev.duration + 1,
          maxSpeed: Math.max(prev.maxSpeed, newSpeed),
          averageSpeed: Math.round((prev.averageSpeed + newSpeed) / 2),
          speedViolations: newSpeed > speedLimit ? prev.speedViolations + 1 : prev.speedViolations,
          safetyScore: Math.max(60, 100 - (prev.speedViolations * 2) - (prev.hardBraking * 3))
        }));

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
    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'info',
      message: `Connected to ${provider === 'waze' ? 'Waze' : 'Google Maps'}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const exportData = () => {
    const exportDataObj = {
      tripId: `trip_${Date.now()}`,
      startTime: new Date().toISOString(),
      userProfile: userProfile,
      vehicleInfo: vehicleInfo,
      insuranceInfo: insuranceInfo,
      tripData: tripData,
      alerts: alerts,
      mapProvider: mapProvider,
      location: location
    };
    
    console.log('Exporting to Insurance API:', exportDataObj);
    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: 'Complete profile and trip data exported',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const saveProfile = () => {
    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: 'Profile information saved successfully',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const renderDashboard = () => (
    <>
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

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3">Insurance Integration</h3>
        <div className="bg-green-50 p-3 rounded-lg mb-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Connected to {insuranceInfo.provider || 'Insurance Provider'}
            </span>
          </div>
          <p className="text-xs text-green-700">Real-time data sharing enabled</p>
        </div>
        <button
          onClick={exportData}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Export Complete Profile & Trip Data
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Profile, vehicle, and trip data shared with insurance partner
        </p>
      </div>
    </>
  );

  const renderProfile = () => (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold">Driver Profile</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={userProfile.firstName}
              onChange={(e) => setUserProfile(prev => ({...prev, firstName: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={userProfile.lastName}
              onChange={(e) => setUserProfile(prev => ({...prev, lastName: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={userProfile.email}
            onChange={(e) => setUserProfile(prev => ({...prev, email: e.target.value}))}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            placeholder="john.doe@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={userProfile.phone}
            onChange={(e) => setUserProfile(prev => ({...prev, phone: e.target.value}))}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              type="text"
              value={userProfile.licenseNumber}
              onChange={(e) => setUserProfile(prev => ({...prev, licenseNumber: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="D123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={userProfile.licenseState}
              onChange={(e) => setUserProfile(prev => ({...prev, licenseState: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="NY">New York</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
            </select>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold pt-4 border-t">Insurance Information</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
          <select
            value={insuranceInfo.provider}
            onChange={(e) => setInsuranceInfo(prev => ({...prev, provider: e.target.value}))}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Select Provider</option>
            {insuranceProviders.map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
            <input
              type="text"
              value={insuranceInfo.policyNumber}
              onChange={(e) => setInsuranceInfo(prev => ({...prev, policyNumber: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="POL123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Number</label>
            <input
              type="text"
              value={insuranceInfo.groupNumber}
              onChange={(e) => setInsuranceInfo(prev => ({...prev, groupNumber: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="GRP001"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
            <input
              type="date"
              value={insuranceInfo.effectiveDate}
              onChange={(e) => setInsuranceInfo(prev => ({...prev, effectiveDate: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <input
              type="date"
              value={insuranceInfo.expirationDate}
              onChange={(e) => setInsuranceInfo(prev => ({...prev, expirationDate: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
            <select
              value={insuranceInfo.coverageType}
              onChange={(e) => setInsuranceInfo(prev => ({...prev, coverageType: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="Full Coverage">Full Coverage</option>
              <option value="Liability Only">Liability Only</option>
              <option value="Comprehensive">Comprehensive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deductible</label>
            <select
              value={insuranceInfo.deductible}
              onChange={(e) => setInsuranceInfo(prev => ({...prev, deductible: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="250">$250</option>
              <option value="500">$500</option>
              <option value="1000">$1,000</option>
              <option value="1500">$1,500</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={saveProfile}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold"
      >
        Save Profile Information
      </button>
    </div>
  );

  const renderVehicle = () => (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold">Vehicle Information</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
            <select
              value={vehicleInfo.make}
              onChange={(e) => setVehicleInfo(prev => ({...prev, make: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select Make</option>
              {carMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              value={vehicleInfo.model}
              onChange={(e) => setVehicleInfo(prev => ({...prev, model: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Camry"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={vehicleInfo.year}
              onChange={(e) => setVehicleInfo(prev => ({...prev, year: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="2022"
              min="1990"
              max="2025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="text"
              value={vehicleInfo.color}
              onChange={(e) => setVehicleInfo(prev => ({...prev, color: e.target.value}))}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Silver"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
          <input
            type="text"
            value={vehicleInfo.vin}
            onChange={(e) => setVehicleInfo(prev => ({...prev, vin: e.target.value.toUpperCase()}))}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono"
            placeholder="1HGCM82633A123456"
            maxLength="17"
          />
          <p className="text-xs text-gray-500 mt-1">17-character Vehicle Identification Number</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
          <input
            type="text"
            value={vehicleInfo.licensePlate}
            onChange={(e) => setVehicleInfo(prev => ({...prev, licensePlate: e.target.value.toUpperCase()}))}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono"
            placeholder="ABC1234"
          />
        </div>
      </div>

      {(vehicleInfo.make || vehicleInfo.model || vehicleInfo.year) && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Vehicle Summary</h4>
          <p className="text-blue-700">
            {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
            {vehicleInfo.color && ` - ${vehicleInfo.color}`}
          </p>
          {vehicleInfo.licensePlate && (
            <p className="text-sm text-blue-600 mt-1">Plate: {vehicleInfo.licensePlate}</p>
          )}
        </div>
      )}

      <button
        onClick={saveProfile}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold"
      >
        Save Vehicle Information
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">SafeDrive</h1>
              <p className="text-blue-100">Insurance Analytics</p>
            </div>
            <Shield className="h-10 w-10" />
          </div>
          
          <div className="flex mt-4 space-x-1 bg-blue-700 rounded-lg p-1">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'dashboard' ? 'bg-white text-blue-700' : 'text-blue-100 hover:text-white'
              }`}
            >
              <Car className="h-4 w-4 mx-auto mb-1" />
              Drive
            </button>
            <button
              onClick={() => setCurrentScreen('profile')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'profile' ? 'bg-white text-blue-700' : 'text-blue-100 hover:text-white'
              }`}
            >
              <User className="h-4 w-4 mx-auto mb-1" />
              Profile
            </button>
            <button
              onClick={() => setCurrentScreen('vehicle')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                currentScreen === 'vehicle' ? 'bg-white text-blue-700' : 'text-blue-100 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4 mx-auto mb-1" />
              Vehicle
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {currentScreen === 'dashboard' && renderDashboard()}
          {currentScreen === 'profile' && renderProfile()}
          {currentScreen === 'vehicle' && renderVehicle()}
        </div>
      </div>

      <div className="max-w-md mx-auto mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Backend Integration Notes:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• User profiles stored in secure database</li>
          <li>• Vehicle info with VIN validation</li>
          <li>• Insurance policy verification API</li>
          <li>• Encrypted data transmission to insurers</li>
          <li>• GDPR/CCPA compliant data handling</li>
          <li>• Real-time trip data + profile context</li>
        </ul>
      </div>
    </div>
  );
};

export default SafeDriveApp;