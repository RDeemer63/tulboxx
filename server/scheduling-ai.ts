import OpenAI from "openai";
import type { Job, Employee, Customer } from "@shared/schema";
import { googleMapsService } from "./google-maps";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RouteOptimizationRequest {
  technician: Employee;
  jobs: (Job & { customer: Customer })[];
  startLocation?: { lat: number; lng: number; address: string }; // Technician's home/office
  workDayStart: string; // Time format: "09:00"
  workDayEnd: string; // Time format: "17:00"
  date: string; // Date format: "2024-06-01"
}

export interface OptimizedSchedule {
  technicianId: number;
  date: string;
  totalDriveTime: number; // minutes
  totalWorkTime: number; // minutes
  optimizedJobs: Array<{
    jobId: number;
    scheduledStartTime: string;
    scheduledEndTime: string;
    driveTimeToJob: number; // minutes from previous location
    estimatedDuration: number; // minutes
    sequence: number; // Order in the day (1, 2, 3...)
    coordinates: { lat: number; lng: number };
    address: string;
  }>;
  warnings: string[];
  suggestions: string[];
}

export async function optimizeScheduleWithAI(request: RouteOptimizationRequest): Promise<OptimizedSchedule> {
  try {
    // Get business profile for starting location
    const { storage } = await import('./storage');
    const businessProfile = await storage.getBusinessProfile();
    
    // Get real drive times from Google Maps API
    const addresses = request.jobs.map(job => 
      job.address || `${job.customer.address}, ${job.customer.city}, ${job.customer.state}`
    );
    
    // Add business address as starting point if available
    const startingAddress = request.startLocation?.address || 
      (businessProfile ? `${businessProfile.address}, ${businessProfile.city}, ${businessProfile.state}` : 
       "123 Business St, Peoria, IL 61604"); // Fallback for Central Illinois
    
    console.log('Getting travel times for addresses:', addresses);
    console.log('Starting from business address:', startingAddress);
    
    // Include starting address in distance matrix calculation
    const allAddresses = [startingAddress, ...addresses];
    
    // Get travel time matrix from Google Maps
    const travelTimes = await googleMapsService.getDistanceMatrix(allAddresses, allAddresses);
    
    console.log('Travel times from Google Maps:', travelTimes);
    
    // Build travel time lookup
    const travelTimeMatrix: { [key: string]: number } = {};
    travelTimes.forEach(tt => {
      const key = `${tt.origin}|${tt.destination}`;
      travelTimeMatrix[key] = Math.round(tt.duration / 60); // Convert to minutes
    });

    // Prepare job data for AI analysis
    const jobsData = request.jobs.map(job => ({
      id: job.id,
      title: job.title,
      serviceType: job.serviceType,
      estimatedDuration: job.estimatedDuration || 120, // Default 2 hours
      priority: job.status === 'urgent' ? 'high' : 'normal',
      address: job.address || `${job.customer.address}, ${job.customer.city}, ${job.customer.state}`,
      coordinates: {
        lat: job.latitude ? parseFloat(job.latitude.toString()) : null,
        lng: job.longitude ? parseFloat(job.longitude.toString()) : null
      },
      customerName: `${job.customer.firstName} ${job.customer.lastName}`,
      notes: job.notes
    }));

    const prompt = `You are an expert field service scheduler. Optimize the daily route for technician ${request.technician.firstName} ${request.technician.lastName} on ${request.date}.

Work constraints:
- Work day: ${request.workDayStart} to ${request.workDayEnd}
- Technician role: ${request.technician.role}
${request.startLocation ? `- Start location: ${request.startLocation.address}` : '- Start from first job location'}

Jobs to schedule:
${JSON.stringify(jobsData, null, 2)}

Real travel times from Google Maps (in minutes):
${Object.entries(travelTimeMatrix).map(([key, time]) => {
  const [origin, destination] = key.split('|');
  return `${origin} → ${destination}: ${time} minutes`;
}).join('\n')}

CRITICAL: You MUST use the EXACT travel times provided above from Google Maps. DO NOT estimate or guess travel times.

For driveTimeToJob values, use the exact minutes from the travel time matrix above.
For totalDriveTime, sum up all the actual travel times between consecutive jobs.

Please optimize for:
1. Minimal total drive time using ONLY the real Google Maps data above
2. Logical geographic clustering  
3. Service type efficiency (similar services together when possible)
4. Customer priority and urgency

Return a JSON object with this exact structure:
{
  "technicianId": ${request.technician.id},
  "date": "${request.date}",
  "totalDriveTime": <sum_of_actual_drive_times_from_google_maps>,
  "totalWorkTime": <sum_of_all_job_durations>,
  "optimizedJobs": [
    {
      "jobId": <job_id>,
      "scheduledStartTime": "<HH:MM format>",
      "scheduledEndTime": "<HH:MM format>",
      "driveTimeToJob": <EXACT_minutes_from_google_maps_matrix_above>,
      "estimatedDuration": <job_duration_minutes>,
      "sequence": <1_based_order>,
      "coordinates": {"lat": <latitude>, "lng": <longitude>},
      "address": "<full_address>"
    }
  ],
  "warnings": ["<any scheduling conflicts or concerns>"],
  "suggestions": ["<optimization recommendations>"]
}

REMEMBER: driveTimeToJob must be the EXACT value from the Google Maps travel times above, not an estimate.`;

    // Generate multiple route strategies and evaluate them
    const bestRoute = optimizeRouteStrategies(jobsData, startingAddress, travelTimeMatrix, request.workDayStart);
    
    const optimizedJobs = bestRoute.jobs;
    let totalDriveTime = bestRoute.totalDriveTime;
    const totalWorkTime = bestRoute.totalWorkTime;

    const result = {
      technicianId: request.technician.id,
      date: request.date,
      totalDriveTime: totalDriveTime,
      totalWorkTime: totalWorkTime,
      optimizedJobs: optimizedJobs,
      warnings: totalDriveTime > 120 ? ["High total drive time - consider rescheduling some jobs"] : [],
      suggestions: [
        "Route optimized using real Google Maps travel times",
        optimizedJobs.length > 0 ? `Includes return trip to business address (${Math.round(travelTimeMatrix[`${optimizedJobs[optimizedJobs.length - 1]?.address}|${startingAddress}`] || 20)} minutes)` : "No jobs to optimize"
      ]
    };
    
    console.log('Final optimized result with real drive times:', JSON.stringify(result, null, 2));
    
    return result as OptimizedSchedule;

  } catch (error) {
    console.error("AI scheduling optimization failed:", error);
    
    // Fallback to simple time-based scheduling
    return createFallbackSchedule(request);
  }
}

function createFallbackSchedule(request: RouteOptimizationRequest): OptimizedSchedule {
  const jobs = request.jobs;
  const startTime = parseTime(request.workDayStart);
  let currentTime = startTime;
  
  const optimizedJobs = jobs.map((job, index) => {
    const duration = job.estimatedDuration || 120;
    const startTimeStr = formatTime(currentTime);
    currentTime += duration + 30; // Add 30 min buffer between jobs
    
    return {
      jobId: job.id,
      scheduledStartTime: startTimeStr,
      scheduledEndTime: formatTime(currentTime - 30),
      driveTimeToJob: index === 0 ? 0 : 30,
      estimatedDuration: duration,
      sequence: index + 1,
      coordinates: {
        lat: job.latitude ? parseFloat(job.latitude.toString()) : 0,
        lng: job.longitude ? parseFloat(job.longitude.toString()) : 0
      },
      address: job.address || `${job.customer.address}, ${job.customer.city}`
    };
  });

  return {
    technicianId: request.technician.id,
    date: request.date,
    totalDriveTime: jobs.length * 30,
    totalWorkTime: jobs.reduce((sum, job) => sum + (job.estimatedDuration || 120), 0),
    optimizedJobs,
    warnings: ["Using fallback scheduling - AI optimization unavailable"],
    suggestions: ["Consider adding GPS coordinates to jobs for better route optimization"]
  };
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Intelligent route optimization that evaluates multiple strategies
function optimizeRouteStrategies(
  jobs: any[],
  startingAddress: string,
  travelTimeMatrix: Record<string, number>,
  workDayStart: string
): { jobs: any[]; totalDriveTime: number; totalWorkTime: number } {
  if (jobs.length === 0) {
    return { jobs: [], totalDriveTime: 0, totalWorkTime: 0 };
  }

  // Generate multiple route strategies
  const strategies = [
    generateNearestNeighborRoute(jobs, startingAddress, travelTimeMatrix),
    generateFarthestFirstRoute(jobs, startingAddress, travelTimeMatrix),
    generateGeographicClusterRoute(jobs, startingAddress, travelTimeMatrix),
    generateOptimalReturnRoute(jobs, startingAddress, travelTimeMatrix)
  ];

  // Evaluate each strategy with scoring system
  let bestRoute = null;
  let bestScore = Infinity;

  for (const route of strategies) {
    const score = evaluateRouteQuality(route, startingAddress, travelTimeMatrix);
    console.log(`Route strategy scored: ${score.total} (drive: ${score.driveTime}, return: ${score.returnTime}, logic: ${score.geographicLogic})`);
    
    if (score.total < bestScore) {
      bestScore = score.total;
      bestRoute = route;
    }
  }

  // Convert best route to scheduled jobs with timing
  const workDayStartMinutes = parseTime(workDayStart);
  const scheduledJobs = applyTimingToRoute(bestRoute || strategies[0], workDayStartMinutes, travelTimeMatrix, startingAddress);

  return {
    jobs: scheduledJobs.jobs,
    totalDriveTime: scheduledJobs.totalDriveTime,
    totalWorkTime: scheduledJobs.totalWorkTime
  };
}

// Strategy 1: Nearest neighbor (current approach, but improved)
function generateNearestNeighborRoute(jobs: any[], startingAddress: string, travelTimeMatrix: Record<string, number>): any[] {
  const remaining = [...jobs];
  const route = [];
  let currentLocation = startingAddress;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let shortestTime = Infinity;

    remaining.forEach((job, index) => {
      const travelKey = `${currentLocation}|${job.address}`;
      const driveTime = travelTimeMatrix[travelKey] || 30;
      
      if (driveTime < shortestTime) {
        shortestTime = driveTime;
        bestIndex = index;
      }
    });

    route.push(remaining[bestIndex]);
    currentLocation = remaining[bestIndex].address;
    remaining.splice(bestIndex, 1);
  }

  return route;
}

// Strategy 2: Farthest first (work back toward base)
function generateFarthestFirstRoute(jobs: any[], startingAddress: string, travelTimeMatrix: Record<string, number>): any[] {
  const remaining = [...jobs];
  const route = [];

  // Start with the job farthest from base
  let farthestIndex = 0;
  let longestTime = 0;

  remaining.forEach((job, index) => {
    const travelKey = `${startingAddress}|${job.address}`;
    const driveTime = travelTimeMatrix[travelKey] || 30;
    
    if (driveTime > longestTime) {
      longestTime = driveTime;
      farthestIndex = index;
    }
  });

  route.push(remaining[farthestIndex]);
  let currentLocation = remaining[farthestIndex].address;
  remaining.splice(farthestIndex, 1);

  // Then use nearest neighbor to work back
  while (remaining.length > 0) {
    let bestIndex = 0;
    let shortestTime = Infinity;

    remaining.forEach((job, index) => {
      const travelKey = `${currentLocation}|${job.address}`;
      const driveTime = travelTimeMatrix[travelKey] || 30;
      
      if (driveTime < shortestTime) {
        shortestTime = driveTime;
        bestIndex = index;
      }
    });

    route.push(remaining[bestIndex]);
    currentLocation = remaining[bestIndex].address;
    remaining.splice(bestIndex, 1);
  }

  return route;
}

// Strategy 3: Geographic clustering
function generateGeographicClusterRoute(jobs: any[], startingAddress: string, travelTimeMatrix: Record<string, number>): any[] {
  // Group jobs by relative geographic position
  const clusters = identifyGeographicClusters(jobs, startingAddress, travelTimeMatrix);
  
  // Order clusters by distance from starting point
  const orderedClusters = clusters.sort((a, b) => {
    const aDistance = Math.min(...a.map(job => {
      const key = `${startingAddress}|${job.address}`;
      return travelTimeMatrix[key] || 30;
    }));
    const bDistance = Math.min(...b.map(job => {
      const key = `${startingAddress}|${job.address}`;
      return travelTimeMatrix[key] || 30;
    }));
    return aDistance - bDistance;
  });

  // Optimize within each cluster
  const route = [];
  for (const cluster of orderedClusters) {
    const clusterRoute = generateNearestNeighborRoute(cluster, route.length > 0 ? route[route.length - 1].address : startingAddress, travelTimeMatrix);
    route.push(...clusterRoute);
  }

  return route;
}

// Strategy 4: Optimize for minimal return trip
function generateOptimalReturnRoute(jobs: any[], startingAddress: string, travelTimeMatrix: Record<string, number>): any[] {
  // Find job closest to base for ending
  let closestToBaseIndex = 0;
  let shortestReturnTime = Infinity;

  jobs.forEach((job, index) => {
    const returnKey = `${job.address}|${startingAddress}`;
    const returnTime = travelTimeMatrix[returnKey] || 20;
    
    if (returnTime < shortestReturnTime) {
      shortestReturnTime = returnTime;
      closestToBaseIndex = index;
    }
  });

  const endJob = jobs[closestToBaseIndex];
  const remaining = jobs.filter((_, index) => index !== closestToBaseIndex);

  // Optimize the remaining jobs, then end with closest to base
  const route = generateNearestNeighborRoute(remaining, startingAddress, travelTimeMatrix);
  route.push(endJob);

  return route;
}

// Helper function to identify geographic clusters
function identifyGeographicClusters(jobs: any[], startingAddress: string, travelTimeMatrix: Record<string, number>): any[][] {
  if (jobs.length <= 2) return [jobs];

  const clusters = [];
  const remaining = [...jobs];

  while (remaining.length > 0) {
    const cluster = [remaining[0]];
    const seedJob = remaining[0];
    remaining.splice(0, 1);

    // Find jobs close to this seed job
    for (let i = remaining.length - 1; i >= 0; i--) {
      const job = remaining[i];
      const travelKey = `${seedJob.address}|${job.address}`;
      const travelTime = travelTimeMatrix[travelKey] || 30;
      
      // If within 15 minutes of each other, consider them clustered
      if (travelTime <= 15) {
        cluster.push(job);
        remaining.splice(i, 1);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

// Evaluate route quality with comprehensive scoring
function evaluateRouteQuality(route: any[], startingAddress: string, travelTimeMatrix: Record<string, number>) {
  let totalDriveTime = 0;
  let geographicLogicPenalty = 0;

  // Calculate drive time from start to first job
  if (route.length > 0) {
    const firstJobKey = `${startingAddress}|${route[0].address}`;
    totalDriveTime += travelTimeMatrix[firstJobKey] || 30;
  }

  // Calculate drive times between jobs
  for (let i = 0; i < route.length - 1; i++) {
    const travelKey = `${route[i].address}|${route[i + 1].address}`;
    const driveTime = travelTimeMatrix[travelKey] || 30;
    totalDriveTime += driveTime;

    // Penalty for excessive backtracking (long drives between consecutive jobs)
    if (driveTime > 25) {
      geographicLogicPenalty += driveTime * 0.5;
    }
  }

  // Calculate return trip time
  let returnTime = 0;
  if (route.length > 0) {
    const returnKey = `${route[route.length - 1].address}|${startingAddress}`;
    returnTime = travelTimeMatrix[returnKey] || 20;
  }

  return {
    total: totalDriveTime + returnTime + geographicLogicPenalty,
    driveTime: totalDriveTime,
    returnTime: returnTime,
    geographicLogic: geographicLogicPenalty
  };
}

// Apply timing to the optimized route
function applyTimingToRoute(route: any[], workDayStartMinutes: number, travelTimeMatrix: Record<string, number>, startingAddress: string) {
  const jobs = [];
  let currentTime = workDayStartMinutes;
  let currentLocation = startingAddress;
  let totalDriveTime = 0;
  let totalWorkTime = 0;

  for (let i = 0; i < route.length; i++) {
    const job = route[i];
    const travelKey = `${currentLocation}|${job.address}`;
    const driveTime = travelTimeMatrix[travelKey] || 30;

    // Add drive time
    currentTime += driveTime;
    totalDriveTime += driveTime;

    const startTime = formatTime(currentTime);
    
    // Add job duration
    currentTime += job.estimatedDuration;
    totalWorkTime += job.estimatedDuration;

    const endTime = formatTime(currentTime);

    jobs.push({
      jobId: job.id,
      scheduledStartTime: startTime,
      scheduledEndTime: endTime,
      driveTimeToJob: driveTime,
      estimatedDuration: job.estimatedDuration,
      sequence: i + 1,
      coordinates: job.coordinates,
      address: job.address
    });

    currentLocation = job.address;
  }

  // Add return trip time to total
  if (route.length > 0) {
    const returnKey = `${currentLocation}|${startingAddress}`;
    const returnTime = travelTimeMatrix[returnKey] || 20;
    totalDriveTime += returnTime;
  }

  return { jobs, totalDriveTime, totalWorkTime };
}

export async function estimateJobDuration(jobDescription: string, serviceType: string): Promise<number> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `As a field service expert, estimate the duration in minutes for this job:
        
Service Type: ${serviceType}
Description: ${jobDescription}

Consider setup, work time, and cleanup. Return only a JSON object:
{"estimatedMinutes": <number>, "confidence": "high|medium|low", "factors": ["<key factors affecting duration>"]}`
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.estimatedMinutes || 120; // Default 2 hours
    
  } catch (error) {
    console.error("Duration estimation failed:", error);
    return 120; // Default fallback
  }
}