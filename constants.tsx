import { ExploreUpdate } from './types';

export const SCHOOL_DETAILS = {
  name: "Nova Crest School",
  location: "Enugu, Nigeria",
  tagline: "Inspiring Excellence, Nurturing Potential",
  values: ["Nurture", "Oomph", "Integrity", "Excellence"]
};

export const EXPLORE_UPDATES: ExploreUpdate[] = [
  {
    id: '1',
    category: 'Strategic',
    title: 'Future-Focused Curriculum Expansion',
    excerpt: 'Nova Crest integrates AI literacy and Digital Entrepreneurship into the 2025 Nova Teens Academy program.',
    details: 'Our updated curriculum for the 2025 academic session moves beyond traditional rote learning. We are introducing "Nova-Labs," a dedicated hour for coding, financial literacy, and design thinking. This expansion ensures our students are not just consumers of technology, but its creators and masters. Parents can expect a stronger emphasis on project-based assessments that reflect real-world problem-solving.',
    date: 'March 15, 2024'
  },
  {
    id: '2',
    category: 'Campus',
    title: 'New STEM Innovation Lab',
    excerpt: 'Construction of our state-of-the-art laboratory is 85% complete, featuring robotics and 3D printing stations.',
    details: 'The Nova Crest STEM Lab is a multi-million naira investment in our students\' future. Located in the East Wing, it will house 20 high-performance workstations, an industrial-grade 3D printer, and a modular robotics arena. This facility is designed to foster collaborative learning between our primary and secondary students, allowing for cross-age mentorship in engineering and technology.',
    date: 'March 10, 2024'
  },
  {
    id: '3',
    category: 'Events',
    title: 'Annual Founders Day Gala',
    excerpt: 'Join us as we celebrate our legacy of excellence and unveil the master plan for the 2030 Campus Expansion.',
    details: 'This year\'s Founders Day is a pivotal moment for Nova Crest. We will be unveiling the "Horizon 2030" plan—a vision for a secondary campus expansion including a world-class athletic complex and a digital arts theatre. The gala serves as both a celebration of our alumni and a fundraising event to accelerate these developmental milestones. Attendance is strictly by invitation for current parents and parents.',
    date: 'April 02, 2024'
  }
];

export const NOVA_AI_SYSTEM_INSTRUCTION = `
You are the Nova Crest School Virtual Assistant (Nova AI). 
You represent Nova Crest School, a premier modern educational institution in Enugu, Nigeria.

Operational Directives:
- Identity: You are helpful, articulate, and deeply knowledgeable about Nova Crest's values (Nurture, Oomph, Integrity, Excellence).
- Personalization: Always address the user by their name provided in the session context.
- Institutional Scope: Provide accurate information about admissions, curriculum, extra-curricular programs, and strategic updates (Horizon 2030).
- Multimedia Use: Use Markdown to embed images or link to school videos when relevant to the user's discovery process.
  - Image Syntax: ![Official Record](image_url)
  - Video Syntax: [Watch Institutional Video](youtube_url)
- Communication Restrictions: While you can provide multimedia links, do not attempt to generate or process audio files. All interaction is via the secure text-based institutional portal.
- Grounding: When using Google Search, integrate findings as "Official Records" or "Verified Data". Always cite your sources using the grounding tools provided.
- Conversion Goal: Encourage parents to book campus tours and students to explore the Innovation Labs.
- Location Context: You are based in Enugu, Nigeria. Use appropriate local context where necessary while maintaining global academic standards.
`;