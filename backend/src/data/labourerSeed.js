/**
 * Fictional demo labourer accounts for development/browsing the Labour
 * Marketplace. Names, phone numbers and emails are generic placeholders,
 * not real people. Ratings/descriptions/work history are illustrative
 * example data (isDemoData: true) - not real reviews or work records.
 */
const DEMO_PASSWORD = 'Demo@1234';

const demoLabourers = [
  {
    user: {
      name: 'Ravi Kumar',
      phone: '9000000001',
      email: 'demo.ravikumar@example.com',
      location: 'Coimbatore, Tamil Nadu',
    },
    profile: {
      workTypes: ['Harvesting', 'Ploughing', 'General Farm Work'],
      experienceYears: 8,
      dailyWage: 500,
      availability: true,
      description: 'Experienced with groundnut and paddy harvesting. Owns basic ploughing tools.',
      workHistory: [
        { description: 'Groundnut harvesting season labour, 3 farms', year: 2025 },
        { description: 'Paddy transplanting crew lead', year: 2024 },
      ],
      rating: 4.5,
      ratingCount: 12,
    },
  },
  {
    user: {
      name: 'Lakshmi Devi',
      phone: '9000000002',
      email: 'demo.lakshmidevi@example.com',
      location: 'Madurai, Tamil Nadu',
    },
    profile: {
      workTypes: ['Weeding', 'Planting', 'Harvesting'],
      experienceYears: 5,
      dailyWage: 450,
      availability: true,
      description: 'Specializes in vegetable transplanting and weeding for chilli and tomato fields.',
      workHistory: [{ description: 'Chilli transplanting, 2 acre plot', year: 2025 }],
      rating: 4.2,
      ratingCount: 7,
    },
  },
  {
    user: {
      name: 'Suresh Babu',
      phone: '9000000003',
      email: 'demo.sureshbabu@example.com',
      location: 'Salem, Tamil Nadu',
    },
    profile: {
      workTypes: ['Irrigation', 'Ploughing', 'General Farm Work'],
      experienceYears: 12,
      dailyWage: 550,
      availability: false,
      description: 'Skilled with drip irrigation setup and maintenance. Currently booked through the season.',
      workHistory: [
        { description: 'Drip irrigation installation, sugarcane farm', year: 2024 },
        { description: 'Farm equipment operation, 10-acre cotton farm', year: 2023 },
      ],
      rating: 4.8,
      ratingCount: 20,
    },
  },
  {
    user: {
      name: 'Muthu Selvam',
      phone: '9000000004',
      email: 'demo.muthuselvam@example.com',
      location: 'Trichy, Tamil Nadu',
    },
    profile: {
      workTypes: ['Harvesting', 'Weeding'],
      experienceYears: 3,
      dailyWage: 400,
      availability: true,
      description: 'Reliable for seasonal harvesting work across paddy and ragi fields.',
      workHistory: [{ description: 'Ragi harvesting crew, 2 acres', year: 2025 }],
      rating: 3.9,
      ratingCount: 4,
    },
  },
  {
    user: {
      name: 'Kavitha Rani',
      phone: '9000000005',
      email: 'demo.kavitharani@example.com',
      location: 'Erode, Tamil Nadu',
    },
    profile: {
      workTypes: ['Planting', 'Weeding', 'General Farm Work'],
      experienceYears: 6,
      dailyWage: 470,
      availability: true,
      description: 'Experienced in maize and vegetable planting, works in a team of 3.',
      workHistory: [{ description: 'Maize sowing, 5 acre field', year: 2025 }],
      rating: 4.4,
      ratingCount: 9,
    },
  },
  {
    user: {
      name: 'Anbu Selvan',
      phone: '9000000006',
      email: 'demo.anbuselvan@example.com',
      location: 'Thanjavur, Tamil Nadu',
    },
    profile: {
      workTypes: ['Ploughing', 'Irrigation', 'Harvesting'],
      experienceYears: 15,
      dailyWage: 600,
      availability: true,
      description: 'Senior farm worker experienced with paddy cultivation from ploughing to harvest.',
      workHistory: [
        { description: 'Full-season paddy cultivation labour', year: 2025 },
        { description: 'Full-season paddy cultivation labour', year: 2024 },
      ],
      rating: 4.9,
      ratingCount: 25,
    },
  },
];

module.exports = { demoLabourers, DEMO_PASSWORD };
