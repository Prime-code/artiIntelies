
import { Plan } from './types';

export const SCHOOL_DETAILS = {
  name: "Nova Crest School",
  location: "Enugu, Nigeria",
  address: "Plot 42, Independence Layout, Enugu State",
  phone: "+234 800 NOVA CREST",
  email: "admissions@novacrestschools.com",
  website: "https://novacrestschools.com",
  tagline: "Inspiring Excellence, Nurturing Potential",
  mission: "Nova Crest School is a vibrant learning community where children are nurtured, inspired, and prepared for lifelong success. The school builds on a legacy of excellence and introduces a future-focused educational vision that equips students to thrive academically, socially, and ethically in a rapidly evolving world.",
  vision: "To be the leading modern educational institution in Nigeria, recognized for producing globally competitive leaders who are grounded in integrity and creative excellence.",
  history: "Founded on the principles of holistic development, Nova Crest has evolved from a local visionary project into a regional beacon of educational innovation.",
  values: {
    nurture: "Nurture: fostering safety, support, and growth in every student.",
    oomph: "Oomph: bringing energy, enthusiasm, and creativity to everything.",
    integrity: "Integrity: honesty, kindness, and respect in all actions.",
    excellence: "Excellence: a commitment to perfection in all pursuits."
  },
  programs: [
    { name: "Early Years Foundation", age: "2 - 5 Years", description: "Holistic development, early literacy, and social skills." },
    { name: "Primary Excellence", age: "6 - 11 Years", description: "Academic program integrated with creative arts and STEM." },
    { name: "Nova Teens Academy", age: "12 - 17 Years", description: "Leadership, digital literacy, and entrepreneurship." }
  ],
  admissions: [
    "1. Inquiry & Campus Tour",
    "2. Application Submission",
    "3. Entrance Assessment",
    "4. Family Interview",
    "5. Offer of Admission"
  ]
};

export const PLANS: Plan[] = [
  { id: 'free', name: 'Nova Discovery', price: 0, duration: 'daily', wordLimit: 3000 },
];

export const NOVA_AI_SYSTEM_INSTRUCTION = `
You are the Nova Crest School Virtual Assistant (Nova AI), representing a premier modern school in Enugu.

Interaction Guidelines:
- Tone: Formal, respectful, and highly intelligent.
- Personalization: Always address the user by their name.
- Domain Knowledge: Provide expert details on Nova Crest School's admissions (5-step process), curriculum (STEM/Arts integration), and values (Nurture, Oomph, Integrity, Excellence).
- Goal: Convert inquiries into school tours or application starts.
- Constraints: Maintain a text-only interaction. If asked for voice, explain that institutional security protocols prioritize encrypted text communication.
`;
