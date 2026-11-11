import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import Assignment from '../models/Assignment.js';
import Notification from '../models/Notification.js';

export const seedDatabaseIfNeeded = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('🌱 Seeding database with initial multi-portal users and demo civic tickets...');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Sarah Jenkins',
        email: 'admin@civicpulse.gov',
        role: 'admin',
        department: 'General Administration',
        assigned_ward: 'Central Ward',
        status: 'available',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      },
      {
        name: 'Rajesh Kumar',
        email: 'supervisor.rajesh@civicpulse.gov',
        role: 'supervisor',
        department: 'Roads & Infrastructure',
        assigned_ward: 'Central Ward',
        status: 'available',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      {
        name: 'Carlos Mendez',
        email: 'worker.carlos@civicpulse.gov',
        role: 'worker',
        department: 'Roads & Infrastructure',
        assigned_ward: 'Central Ward',
        status: 'available',
        active_tasks_count: 1,
        completed_tasks_count: 14,
        rating: 4.9,
        current_location: { lat: 40.7312, lng: -73.9855 },
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
      {
        name: 'Priya Sharma',
        email: 'worker.priya@civicpulse.gov',
        role: 'worker',
        department: 'Sanitation & Waste',
        assigned_ward: 'North Ward',
        status: 'busy',
        active_tasks_count: 2,
        completed_tasks_count: 22,
        rating: 4.8,
        current_location: { lat: 40.742, lng: -73.981 },
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      {
        name: 'Marcus Vance',
        email: 'worker.marcus@civicpulse.gov',
        role: 'worker',
        department: 'Electrical & Lighting',
        assigned_ward: 'South Ward',
        status: 'available',
        active_tasks_count: 0,
        completed_tasks_count: 9,
        rating: 4.7,
        current_location: { lat: 40.718, lng: -73.992 },
        avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      },
      {
        name: 'Alex Chen',
        email: 'citizen.alex@example.com',
        role: 'citizen',
        assigned_ward: 'Central Ward',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      },
      {
        name: 'Maya Patel',
        email: 'citizen.maya@example.com',
        role: 'citizen',
        assigned_ward: 'North Ward',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      },
    ]);

    const admin = users[0];
    const supervisor = users[1];
    const workerCarlos = users[2];
    const workerPriya = users[3];
    const citizenAlex = users[5];
    const citizenMaya = users[6];

    // 2. Create Tickets across full lifecycle
    const tickets = await Ticket.create([
      {
        title: 'Deep hazardous pothole on 5th Ave',
        description: 'Large crater causing vehicular rim damage near intersection.',
        defect_type: 'pothole',
        priority_score: 92,
        severity: 'CRITICAL',
        location: {
          type: 'Point',
          coordinates: [-73.9867, 40.7306],
          address: '5th Ave & E 21st St',
          ward: 'Central Ward',
          city: 'Metropolis',
        },
        status: 'REPORTED',
        citizen_id: citizenAlex._id,
        before_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
            caption: 'Initial reporting photograph',
          },
        ],
        confidence: 0.94,
        before_damage_pct: 78,
        history: [
          {
            action: 'CREATED',
            from_status: null,
            to_status: 'REPORTED',
            performed_by: citizenAlex._id,
            performed_by_name: citizenAlex.name,
            performed_by_role: 'citizen',
            notes: 'Citizen submitted report with AI defect confirmation.',
            timestamp: new Date(Date.now() - 3 * 3600 * 1000),
          },
        ],
      },
      {
        title: 'Overflowing commercial waste container',
        description: 'Garbage spilling onto sidewalk blocking pedestrian ramp.',
        defect_type: 'garbage',
        priority_score: 74,
        severity: 'HIGH',
        location: {
          type: 'Point',
          coordinates: [-73.9831, 40.7387],
          address: 'Lexington Ave & 28th St',
          ward: 'North Ward',
          city: 'Metropolis',
        },
        status: 'ASSIGNED',
        citizen_id: citizenMaya._id,
        assigned_worker_id: workerPriya._id,
        assigned_supervisor_id: supervisor._id,
        before_image_url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=600',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=600',
            caption: 'Sidewalk debris',
          },
        ],
        confidence: 0.88,
        before_damage_pct: 62,
        history: [
          {
            action: 'CREATED',
            from_status: null,
            to_status: 'REPORTED',
            performed_by: citizenMaya._id,
            performed_by_name: citizenMaya.name,
            performed_by_role: 'citizen',
            notes: 'Reported via mobile web.',
            timestamp: new Date(Date.now() - 6 * 3600 * 1000),
          },
          {
            action: 'ASSIGNED',
            from_status: 'REPORTED',
            to_status: 'ASSIGNED',
            performed_by: admin._id,
            performed_by_name: admin.name,
            performed_by_role: 'admin',
            notes: 'Dispatched to Sanitation crew lead Priya Sharma.',
            timestamp: new Date(Date.now() - 2 * 3600 * 1000),
          },
        ],
      },
      {
        title: 'Asphalt depression and water pooling',
        description: 'Road subgrade erosion in progress.',
        defect_type: 'pothole',
        priority_score: 68,
        severity: 'MEDIUM',
        location: {
          type: 'Point',
          coordinates: [-73.9912, 40.7289],
          address: 'Broadway & 12th St',
          ward: 'Central Ward',
          city: 'Metropolis',
        },
        status: 'IN_PROGRESS',
        citizen_id: citizenAlex._id,
        assigned_worker_id: workerCarlos._id,
        before_image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
        confidence: 0.82,
        before_damage_pct: 45,
        history: [
          {
            action: 'CREATED',
            from_status: null,
            to_status: 'REPORTED',
            performed_by: citizenAlex._id,
            performed_by_name: citizenAlex.name,
            performed_by_role: 'citizen',
            notes: 'Initial issue reported.',
            timestamp: new Date(Date.now() - 8 * 3600 * 1000),
          },
          {
            action: 'ASSIGNED',
            from_status: 'REPORTED',
            to_status: 'ASSIGNED',
            performed_by: admin._id,
            performed_by_name: admin.name,
            performed_by_role: 'admin',
            notes: 'Dispatched to Carlos Mendez.',
            timestamp: new Date(Date.now() - 4 * 3600 * 1000),
          },
          {
            action: 'WORK_STARTED',
            from_status: 'ASSIGNED',
            to_status: 'IN_PROGRESS',
            performed_by: workerCarlos._id,
            performed_by_name: workerCarlos.name,
            performed_by_role: 'worker',
            notes: 'Field crew arrived on site with asphalt repair vehicle.',
            timestamp: new Date(Date.now() - 1 * 3600 * 1000),
          },
        ],
      },
      {
        title: 'Damaged streetlight pole and flickering luminaire',
        description: 'Light fixture partially detached after storm wind.',
        defect_type: 'streetlight',
        priority_score: 75,
        severity: 'HIGH',
        location: {
          type: 'Point',
          coordinates: [-73.9785, 40.732],
          address: 'Park Ave S & 24th St',
          ward: 'Central Ward',
          city: 'Metropolis',
        },
        status: 'PENDING_VERIFICATION',
        citizen_id: citizenAlex._id,
        assigned_worker_id: workerCarlos._id,
        before_image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
        after_image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
        resolution_proof: {
          images: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600'],
          completion_notes: 'Replaced electrical junction, secured pole mast, tested illumination.',
          submitted_at: new Date(Date.now() - 30 * 60 * 1000),
          submitted_by: workerCarlos._id,
        },
        confidence: 0.91,
        before_damage_pct: 70,
        after_damage_pct: 5,
        history: [
          {
            action: 'CREATED',
            from_status: null,
            to_status: 'REPORTED',
            performed_by: citizenAlex._id,
            performed_by_name: citizenAlex.name,
            performed_by_role: 'citizen',
            notes: 'Reported flickering hazard.',
            timestamp: new Date(Date.now() - 12 * 3600 * 1000),
          },
          {
            action: 'ASSIGNED',
            from_status: 'REPORTED',
            to_status: 'ASSIGNED',
            performed_by: admin._id,
            performed_by_name: admin.name,
            performed_by_role: 'admin',
            notes: 'Assigned to Carlos Mendez.',
            timestamp: new Date(Date.now() - 5 * 3600 * 1000),
          },
          {
            action: 'WORK_STARTED',
            from_status: 'ASSIGNED',
            to_status: 'IN_PROGRESS',
            performed_by: workerCarlos._id,
            performed_by_name: workerCarlos.name,
            performed_by_role: 'worker',
            notes: 'Bucket truck dispatched.',
            timestamp: new Date(Date.now() - 2 * 3600 * 1000),
          },
          {
            action: 'COMPLETION_SUBMITTED',
            from_status: 'IN_PROGRESS',
            to_status: 'PENDING_VERIFICATION',
            performed_by: workerCarlos._id,
            performed_by_name: workerCarlos.name,
            performed_by_role: 'worker',
            notes: 'Fix completed, awaiting administrative verification.',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
          },
        ],
      },
      {
        title: 'Sewage backup at main stormwater grate',
        description: 'Strong odor and wastewater overflow cleared by municipal drainage team.',
        defect_type: 'sewage',
        priority_score: 85,
        severity: 'CRITICAL',
        location: {
          type: 'Point',
          coordinates: [-73.9895, 40.735],
          address: 'Madison Ave & 23rd St',
          ward: 'Central Ward',
          city: 'Metropolis',
        },
        status: 'RESOLVED',
        citizen_id: citizenMaya._id,
        assigned_worker_id: workerPriya._id,
        before_image_url: 'https://images.unsplash.com/photo-1527672872775-5211dd70600d?w=600',
        after_image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600',
        confidence: 0.92,
        before_damage_pct: 85,
        after_damage_pct: 0,
        history: [
          {
            action: 'CREATED',
            from_status: null,
            to_status: 'REPORTED',
            performed_by: citizenMaya._id,
            performed_by_name: citizenMaya.name,
            performed_by_role: 'citizen',
            notes: 'Reported severe runoff.',
            timestamp: new Date(Date.now() - 24 * 3600 * 1000),
          },
          {
            action: 'ASSIGNED',
            from_status: 'REPORTED',
            to_status: 'ASSIGNED',
            performed_by: admin._id,
            performed_by_name: admin.name,
            performed_by_role: 'admin',
            notes: 'High-priority task assigned.',
            timestamp: new Date(Date.now() - 20 * 3600 * 1000),
          },
          {
            action: 'COMPLETION_SUBMITTED',
            from_status: 'IN_PROGRESS',
            to_status: 'PENDING_VERIFICATION',
            performed_by: workerPriya._id,
            performed_by_name: workerPriya.name,
            performed_by_role: 'worker',
            notes: 'High-pressure vacuum flusher applied.',
            timestamp: new Date(Date.now() - 10 * 3600 * 1000),
          },
          {
            action: 'VERIFIED_RESOLVED',
            from_status: 'PENDING_VERIFICATION',
            to_status: 'RESOLVED',
            performed_by: admin._id,
            performed_by_name: admin.name,
            performed_by_role: 'admin',
            notes: 'Municipal inspection approved resolution.',
            timestamp: new Date(Date.now() - 4 * 3600 * 1000),
          },
        ],
      },
    ]);

    // 3. Create Assignments
    await Assignment.create([
      {
        ticket_id: tickets[1]._id,
        worker_id: workerPriya._id,
        assigned_by: admin._id,
        instructions: 'Clear trash overflow and sanitize container base.',
        status: 'pending',
      },
      {
        ticket_id: tickets[2]._id,
        worker_id: workerCarlos._id,
        assigned_by: admin._id,
        instructions: 'Compact subbase and apply cold patch asphalt.',
        status: 'in_progress',
        accepted_at: new Date(Date.now() - 3 * 3600 * 1000),
      },
      {
        ticket_id: tickets[3]._id,
        worker_id: workerCarlos._id,
        assigned_by: admin._id,
        instructions: 'Inspect luminaire mount and secure safety cable.',
        status: 'completed',
        accepted_at: new Date(Date.now() - 4 * 3600 * 1000),
        completed_at: new Date(Date.now() - 30 * 60 * 1000),
      },
    ]);

    // 4. Create Initial Notifications
    await Notification.create([
      {
        recipient_id: citizenAlex._id,
        title: 'Issue Verification in Progress',
        message: 'Your report for streetlight repair has been submitted for final municipal verification.',
        type: 'status_updated',
        ticket_id: tickets[3]._id,
      },
      {
        recipient_id: workerCarlos._id,
        title: 'New Assignment',
        message: 'You have been assigned to repair asphalt depression on Broadway & 12th St.',
        type: 'ticket_assigned',
        ticket_id: tickets[2]._id,
      },
      {
        recipient_id: admin._id,
        title: 'Resolution Pending Approval',
        message: 'Worker Carlos Mendez submitted proof of completion for Streetlight #3.',
        type: 'resolution_submitted',
        ticket_id: tickets[3]._id,
      },
    ]);

    console.log('✅ Database successfully seeded with multi-portal demo data.');
  } catch (error) {
    console.error('Error during database seed:', error.message);
  }
};
