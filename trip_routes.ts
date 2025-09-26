// src/routes/trips.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const startTripSchema = z.object({
  userId: z.string(),
  vehicleId: z.string().optional(),
  mapProvider: z.string().optional(),
  startTime: z.string().datetime()
});

const updateTripSchema = z.object({
  distance: z.number().optional(),
  duration: z.number().optional(),
  averageSpeed: z.number().optional(),
  maxSpeed: z.number().optional(),
  speedViolations: z.number().optional(),
  hardBraking: z.number().optional(),
  rapidAcceleration: z.number().optional(),
  safetyScore: z.number().optional(),
  endTime: z.string().datetime().optional(),
  isActive: z.boolean().optional()
});

const locationDataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number(),
  speedLimit: z.number(),
  timestamp: z.string().datetime().optional()
});

// POST /api/trips/start - Start a new trip
router.post('/start', async (req, res) => {
  try {
    const validatedData = startTripSchema.parse(req.body);
    
    // Generate unique trip ID
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const trip = await prisma.trip.create({
      data: {
        ...validatedData,
        tripId,
        startTime: new Date(validatedData.startTime),
        isActive: true
      },
      include: {
        user: true,
        vehicle: true
      }
    });
    
    res.status(201).json(trip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error starting trip:', error);
    res.status(500).json({ error: 'Failed to start trip' });
  }
});

// PUT /api/trips/:tripId - Update trip data
router.put('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const validatedData = updateTripSchema.parse(req.body);
    
    const updateData: any = { ...validatedData };
    if (validatedData.endTime) {
      updateData.endTime = new Date(validatedData.endTime);
    }
    
    const trip = await prisma.trip.update({
      where: { tripId },
      data: updateData,
      include: {
        user: true,
        vehicle: true,
        alerts: {
          orderBy: { timestamp: 'desc' },
          take: 5
        }
      }
    });
    
    res.json(trip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// POST /api/trips/:tripId/location - Add location data to trip
router.post('/:tripId/location', async (req, res) => {
  try {
    const { tripId } = req.params;
    const validatedData = locationDataSchema.parse(req.body);
    
    // Find the trip
    const trip = await prisma.trip.findUnique({
      where: { tripId }
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const locationData = await prisma.locationData.create({
      data: {
        tripId: trip.id,
        ...validatedData,
        timestamp: validatedData.timestamp ? new Date(validatedData.timestamp) : new Date()
      }
    });
    
    // Check for speed violations and create alerts
    if (validatedData.speed > validatedData.speedLimit + 5) {
      await prisma.alert.create({
        data: {
          userId: trip.userId,
          tripId: trip.id,
          type: 'speed',
          message: `Speed Alert: ${validatedData.speed} mph in ${validatedData.speedLimit} mph zone`
        }
      });
    }
    
    res.status(201).json(locationData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Error adding location data:', error);
    res.status(500).json({ error: 'Failed to add location data' });
  }
});

// GET /api/trips/user/:userId - Get user's trips
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '10', active } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const where: any = { userId };
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    
    const trips = await prisma.trip.findMany({
      where,
      include: {
        vehicle: true,
        alerts: {
          where: { type: 'speed' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum
    });
    
    const totalTrips = await prisma.trip.count({ where });
    
    res.json({
      trips,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalTrips,
        pages: Math.ceil(totalTrips / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// GET /api/trips/:tripId - Get specific trip
router.get('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const trip = await prisma.trip.findUnique({
      where: { tripId },
      include: {
        user: true,
        vehicle: true,
        alerts: {
          orderBy: { timestamp: 'desc' }
        },
        locationData: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// POST /api/trips/:tripId/end - End a trip
router.post('/:tripId/end', async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const trip = await prisma.trip.update({
      where: { tripId },
      data: {
        endTime: new Date(),
        isActive: false
      },
      include: {
        user: true,
        vehicle: true,
        alerts: true
      }
    });
    
    res.json(trip);
  } catch (error) {
    console.error('Error ending trip:', error);
    res.status(500).json({ error: 'Failed to end trip' });
  }
});

// POST /api/trips/:tripId/export - Export trip data to insurance
router.post('/:tripId/export', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { insuranceProvider } = req.body;
    
    const trip = await prisma.trip.findUnique({
      where: { tripId },
      include: {
        user: {
          include: {
            vehicles: true,
            insurance: true
          }
        },
        vehicle: true,
        alerts: true,
        locationData: true
      }
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Create export data package
    const exportData = {
      tripId: trip.tripId,
      startTime: trip.startTime,
      endTime: trip.endTime,
      userProfile: {
        firstName: trip.user.firstName,
        lastName: trip.user.lastName,
        email: trip.user.email,
        phone: trip.user.phone,
        licenseNumber: trip.user.licenseNumber,
        licenseState: trip.user.licenseState
      },
      vehicleInfo: trip.vehicle,
      insuranceInfo: trip.user.insurance[0], // Assuming first insurance record
      tripData: {
        distance: trip.distance,
        duration: trip.duration,
        averageSpeed: trip.averageSpeed,
        maxSpeed: trip.maxSpeed,
        speedViolations: trip.speedViolations,
        hardBraking: trip.hardBraking,
        rapidAcceleration: trip.rapidAcceleration,
        safetyScore: trip.safetyScore
      },
      alerts: trip.alerts,
      mapProvider: trip.mapProvider,
      locationData: trip.locationData
    };
    
    // Store export record
    const exportRecord = await prisma.insuranceExport.create({
      data: {
        userId: trip.userId,
        tripId: trip.tripId,
        exportData,
        insuranceProvider: insuranceProvider || 'Unknown',
        status: 'sent'
      }
    });
    
    // Here you would integrate with actual insurance APIs
    // For now, we'll just simulate the export
    
    res.json({
      message: 'Trip data exported successfully',
      exportId: exportRecord.id,
      exportData
    });
  } catch (error) {
    console.error('Error exporting trip data:', error);
    res.status(500).json({ error: 'Failed to export trip data' });
  }
});

export default router;