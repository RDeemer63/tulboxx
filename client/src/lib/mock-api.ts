import {
  type Contact,
  type InsertContact,
  type ContactActivity,
  type InsertContactActivity,
} from '@shared/schema';

// Runtime feature-flag: decide whether to intercept fetch()
import { isMockApiEnabled } from '@/lib/api-config';

const MOCK_API_ENABLED = isMockApiEnabled(); // Centralised toggle

let mockLeads: Contact[] = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
    phone: '555-0101',
    secondaryPhone: null,
    address: '123 Wonder Ln',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    propertyType: 'residential',
    accessInstructions: 'Gate code #1234',
    preferredContactMethod: 'email',
    notes: 'Interested in landscaping services. Called on Monday.',
    status: 'lead', // schema-valid lead status
    leadSource: 'website',
    leadScore: 4,
    lastContactDate: new Date('2024-05-10T10:00:00Z').toISOString(),
    nextFollowUpDate: new Date('2024-05-17T10:00:00Z').toISOString(),
    convertedAt: null,
    tags: JSON.stringify(['landscaping', 'urgent']),
    createdAt: new Date('2024-05-09T14:30:00Z').toISOString(),
  },
  {
    id: 2,
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    phone: '555-0102',
    secondaryPhone: '555-0199',
    address: '456 Oak St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94107',
    propertyType: 'commercial',
    accessInstructions: null,
    preferredContactMethod: 'phone',
    notes: 'Referral from Existing Customer Inc. Needs plumbing quote.',
    status: 'lead',
    leadSource: 'referral',
    leadScore: 5,
    lastContactDate: new Date('2024-05-11T15:00:00Z').toISOString(),
    nextFollowUpDate: new Date('2024-05-20T10:00:00Z').toISOString(),
    convertedAt: null,
    tags: JSON.stringify(['plumbing', 'commercial_quote']),
    createdAt: new Date('2024-05-10T09:00:00Z').toISOString(),
  },
  {
    id: 3,
    firstName: 'Carol',
    lastName: 'Davis',
    email: 'carol.davis@example.com',
    phone: '555-0103',
    secondaryPhone: null,
    address: '789 Pine Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    propertyType: 'residential',
    accessInstructions: 'Dog in yard, call first.',
    preferredContactMethod: 'text',
    notes: 'Met at trade show. Interested in HVAC maintenance plan.',
    status: 'lead',
    leadSource: 'event',
    leadScore: 3,
    lastContactDate: new Date('2024-05-12T11:00:00Z').toISOString(),
    nextFollowUpDate: null,
    convertedAt: null,
    tags: JSON.stringify(['hvac', 'maintenance_plan']),
    createdAt: new Date('2024-05-11T17:00:00Z').toISOString(),
  },
  {
    id: 4,
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@example.com',
    phone: '555-0104',
    secondaryPhone: null,
    address: '101 Maple Dr',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60606',
    propertyType: 'residential',
    accessInstructions: null,
    preferredContactMethod: 'email',
    notes: 'Website inquiry for electrical work. Seems price sensitive.',
    status: 'lead',
    leadSource: 'website',
    leadScore: 2,
    lastContactDate: new Date('2024-05-13T16:30:00Z').toISOString(),
    nextFollowUpDate: new Date('2024-05-22T10:00:00Z').toISOString(),
    convertedAt: null,
    tags: JSON.stringify(['electrical', 'price_sensitive']),
    createdAt: new Date('2024-05-12T08:15:00Z').toISOString(),
  },
  {
    id: 5, // This one is already a customer, should not appear in leads list
    firstName: 'Eve',
    lastName: 'Brown',
    email: 'eve.brown@example.com',
    phone: '555-0105',
    secondaryPhone: null,
    address: '202 Birch Rd',
    city: 'Miami',
    state: 'FL',
    zipCode: '33101',
    propertyType: 'residential',
    accessInstructions: null,
    preferredContactMethod: 'phone',
    notes: 'Long-time customer, annual lawn care.',
    status: 'customer',
    leadSource: 'repeat_customer',
    leadScore: 5,
    lastContactDate: new Date('2024-04-15T14:00:00Z').toISOString(),
    nextFollowUpDate: null,
    convertedAt: new Date('2022-03-01T00:00:00Z').toISOString(),
    tags: JSON.stringify(['lawn_care', 'vip']),
    createdAt: new Date('2022-02-20T10:00:00Z').toISOString(),
  },
  // Add 15-20 more mock leads to test pagination and filtering
  ...Array.from({ length: 15 }, (_, i) => ({
    id: 6 + i,
    firstName: `LeadFirst${6 + i}`,
    lastName: `LeadLast${6 + i}`,
    email: `lead${6 + i}@example.com`,
    phone: `555-02${String(6 + i).padStart(2, '0')}`,
    secondaryPhone: null,
    address: `${100 + i * 5} Test St`,
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210',
    propertyType: i % 2 === 0 ? 'residential' : 'commercial',
    accessInstructions: null,
    preferredContactMethod: 'email',
    notes: `Notes for lead ${6 + i}`,
    status: 'lead',
    leadSource: ['website', 'referral', 'cold_call', 'advertisement'][i % 4],
    leadScore: (i % 5) + 1,
    lastContactDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    nextFollowUpDate: i % 3 === 0 ? new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000).toISOString() : null,
    convertedAt: null,
    tags: JSON.stringify([['tagA', 'tagB'][i % 2]]),
    createdAt: new Date(Date.now() - (i + 5) * 24 * 60 * 60 * 1000).toISOString(),
  })),
];

let nextLeadId = mockLeads.length > 0 ? Math.max(...mockLeads.map(l => l.id)) + 1 : 1;
let mockActivities: ContactActivity[] = [];
let nextActivityId = 1;

const originalFetch = window.fetch;

/** Convert `''` to `undefined` so that optional fields sent
 *  from react-hook-form match the existing mock ­records.
 */
function cleanEmptyStrings<T extends Record<string, any>>(obj: T): T {
  return Object.keys(obj).reduce((acc, key) => {
    const v = obj[key];
    acc[key] = v === '' ? undefined : v;
    return acc;
  }, {} as T);
}

const mockFetch = (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
  const urlString = typeof url === 'string' ? url : url.toString();
  const method = options?.method?.toUpperCase() || 'GET';

  console.log(`MOCK API: Intercepted ${method} ${urlString}`);

  // GET /api/contacts (for leads)
  if (method === 'GET' && urlString.startsWith('/api/contacts')) {
    const params = new URLSearchParams(urlString.split('?')[1] || '');
    const contactType = params.get('contactType');

    if (contactType === 'lead') {
      let filteredLeads = mockLeads.filter(
        (contact) => contact.status === 'lead' // Only leads
      );

      const searchTerm = params.get('search')?.toLowerCase();
      const statusFilter = params.get('status'); // e.g., 'new_lead', 'contacted'
      const leadSourceFilter = params.get('leadSource');
      const page = parseInt(params.get('page') || '1', 10);
      const pageSize = parseInt(params.get('pageSize') || '10', 10);

      if (searchTerm) {
        filteredLeads = filteredLeads.filter(
          (lead) =>
            lead.firstName.toLowerCase().includes(searchTerm) ||
            lead.lastName.toLowerCase().includes(searchTerm) ||
            lead.email?.toLowerCase().includes(searchTerm) ||
            lead.phone?.toLowerCase().includes(searchTerm)
        );
      }
      if (statusFilter) {
        filteredLeads = filteredLeads.filter((lead) => lead.status === statusFilter);
      }
      if (leadSourceFilter) {
        filteredLeads = filteredLeads.filter((lead) => lead.leadSource === leadSourceFilter);
      }

      const totalCount = filteredLeads.length;
      const paginatedLeads = filteredLeads.slice((page - 1) * pageSize, page * pageSize);

      return Promise.resolve(
        new Response(JSON.stringify({ data: paginatedLeads, totalCount }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
    // If not contactType=lead, pass through to original fetch or handle other /api/contacts cases
  }

  // POST /api/contacts (create new lead)
  // Note: The LeadsListComponent doesn't directly use this, but an "Add Lead" modal would.
  if (method === 'POST' && urlString === '/api/contacts') {
    return new Promise((resolve) => {
      setTimeout(async () => { // Simulate network delay
        try {
          const bodyRaw = options?.body ? JSON.parse(options.body as string) as InsertContact : null;
          const body = bodyRaw ? cleanEmptyStrings(bodyRaw) : null;
          if (!body) {
            resolve(new Response(JSON.stringify({ message: 'Request body is missing or invalid.' }), { status: 400 }));
            return;
          }
          const newLead: Contact = {
            id: nextLeadId++,
            ...body,
            status: 'lead',
            createdAt: new Date().toISOString(),
            // Ensure all non-nullable fields from Contact type have defaults or are provided
            email: body.email || null,
            phone: body.phone || null,
            secondaryPhone: body.secondaryPhone || null,
            address: body.address || null,
            city: body.city || null,
            state: body.state || null,
            zipCode: body.zipCode || null,
            propertyType: body.propertyType || 'residential',
            accessInstructions: body.accessInstructions || null,
            preferredContactMethod: body.preferredContactMethod || 'email',
            notes: body.notes || null,
            leadSource: body.leadSource || null,
            leadScore: body.leadScore || 0,
            lastContactDate: body.lastContactDate || null,
            nextFollowUpDate: body.nextFollowUpDate || null,
            convertedAt: null,
            tags: body.tags || null,
          };
          mockLeads.unshift(newLead); // Add to the beginning of the list
          resolve(new Response(JSON.stringify(newLead), { status: 201, headers: { 'Content-Type': 'application/json' } }));
        } catch (e) {
          resolve(new Response(JSON.stringify({ message: 'Invalid JSON in request body.' }), { status: 400 }));
        }
      }, 500);
    });
  }

  // -----------------------------------------------------------
  // GET /api/contacts/:id  (single contact details)
  // -----------------------------------------------------------
  const contactIdMatch = urlString.match(/^\/api\/contacts\/(\d+)$/);
  if (method === 'GET' && contactIdMatch) {
    const id = parseInt(contactIdMatch[1], 10);
    const contact = mockLeads.find((c) => c.id === id);
    if (!contact) {
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Contact not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
    return Promise.resolve(
      new Response(JSON.stringify(contact), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  // -----------------------------------------------------------
  // PATCH /api/contacts/:id  (update contact – not convert path)
  // -----------------------------------------------------------
  if (
    method === 'PATCH' &&
    contactIdMatch &&
    !urlString.includes('/convert-to-customer')
  ) {
    const id = parseInt(contactIdMatch[1], 10);
    const idx = mockLeads.findIndex((c) => c.id === id);
    if (idx === -1) {
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Contact not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
    const bodyRaw =
      options?.body && options.body !== ''
        ? (JSON.parse(options.body as string) as Partial<Contact>)
        : {};
    const updates = cleanEmptyStrings(bodyRaw);
    mockLeads[idx] = { ...mockLeads[idx], ...updates };
    return Promise.resolve(
      new Response(JSON.stringify(mockLeads[idx]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  // PATCH /api/contacts/:id/convert-to-customer
  const convertMatch = urlString.match(/\/api\/contacts\/(\d+)\/convert-to-customer/);
  if (method === 'PATCH' && convertMatch) {
    const leadId = parseInt(convertMatch[1], 10);
    const leadIndex = mockLeads.findIndex((lead) => lead.id === leadId);
    if (leadIndex > -1) {
      mockLeads[leadIndex].status = 'customer'; // update to schema-valid customer status
      mockLeads[leadIndex].convertedAt = new Date().toISOString();
      return Promise.resolve(
        new Response(JSON.stringify(mockLeads[leadIndex]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    } else {
      return Promise.resolve(new Response(JSON.stringify({ message: 'Lead not found' }), { status: 404 }));
    }
  }

  // -----------------------------------------------------------
  // GET /api/contacts/:id/activities
  // -----------------------------------------------------------
  const activitiesMatch = urlString.match(/^\/api\/contacts\/(\d+)\/activities$/);
  if (method === 'GET' && activitiesMatch) {
    const cId = parseInt(activitiesMatch[1], 10);
    const activities = mockActivities.filter((a) => a.contactId === cId);
    return Promise.resolve(
      new Response(JSON.stringify(activities), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  // -----------------------------------------------------------
  // POST /api/contacts/:id/activities
  // -----------------------------------------------------------
  if (method === 'POST' && activitiesMatch) {
    const cId = parseInt(activitiesMatch[1], 10);
    const contactExists = mockLeads.some((c) => c.id === cId);
    if (!contactExists) {
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Contact not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
    const raw =
      options?.body && options.body !== ''
        ? (JSON.parse(options.body as string) as InsertContactActivity)
        : null;
    if (!raw || !raw.content) {
      return Promise.resolve(
        new Response(JSON.stringify({ message: 'Invalid activity body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
    const newActivity: ContactActivity = {
      id: nextActivityId++,
      contactId: cId,
      content: raw.content,
      activityType: raw.activityType ?? 'note',
      createdBy: 1, // mock user id
      scheduledAt: raw.scheduledAt ?? null,
      completedAt: raw.completedAt ?? null,
      isCompleted: false,
      priority: raw.priority ?? 'medium',
      createdAt: new Date().toISOString(),
    };
    mockActivities.unshift(newActivity);
    return Promise.resolve(
      new Response(JSON.stringify(newActivity), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  // DELETE /api/contacts/:id
  const deleteMatch = urlString.match(/\/api\/contacts\/(\d+)/);
  if (method === 'DELETE' && deleteMatch && !urlString.includes('/convert-to-customer')) { // Ensure it's not the convert URL
    const leadId = parseInt(deleteMatch[1], 10);
    const initialLength = mockLeads.length;
    mockLeads = mockLeads.filter((lead) => lead.id !== leadId);
    if (mockLeads.length < initialLength) {
      return Promise.resolve(new Response(null, { status: 204 })); // No content, success
    } else {
      return Promise.resolve(new Response(JSON.stringify({ message: 'Lead not found' }), { status: 404 }));
    }
  }

  // If no mock handler matches, call the original fetch
  console.log(`MOCK API: Passing through ${method} ${urlString} to original fetch.`);
  return originalFetch(url, options);
};

export function initializeMockApi() {
  if (MOCK_API_ENABLED) {
    // @ts-ignore
    window.fetch = mockFetch;
    console.log('%c MOCK API ENABLED ', 'background: #222; color: #bada55; font-weight: bold;');
  } else {
    // @ts-ignore
    window.fetch = originalFetch;
  }
}

// Initialize on load if enabled
// Ensure this runs after the DOM is ready or at least after fetch is defined globally.
// Typically, you'd call this in your main.tsx or App.tsx.
// For standalone testing, you might call it directly.
// initializeMockApi();
