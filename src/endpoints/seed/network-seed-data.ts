type NetworkArgs = {
  profileImageID: number
}

export const simonHolmes = ({ profileImageID }: NetworkArgs) => {
  return {
    slug: 'simon-holmes',
    _status: 'published' as const,
    name: 'Simon Holmes',
    role: 'Founder & bald',
    profileImage: profileImageID,
    bio: 'Placeholder bio - will be updated manually through the admin panel.',
    skills: [{ skill: 'Product engineering' }, { skill: 'Delivery' }],
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/simondholmes/',
      twitter: '',
      github: 'https://github.com/simonholmes',
      website: 'https://simonholmes.com',
    },
    meta: {
      title: 'Simon Holmes | HCE Network',
      description: 'Founder & CEO at HCE Venture Studio.',
    },
  }
}

export const johnDurrant = ({ profileImageID }: NetworkArgs) => {
  return {
    slug: 'john-durrant',
    _status: 'published' as const,
    name: 'John Durrant',
    role: 'Founder & athlete',
    profileImage: profileImageID,
    bio: 'Placeholder bio - will be updated manually through the admin panel.',
    skills: [{ skill: 'Product strategy' }, { skill: 'Ideation' }],
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/johndurrant/',
      twitter: '',
      github: 'https://github.com/JohnD-EE',
      website: '',
    },
    meta: {
      title: 'John Durrant | HCE Network',
      description: 'Network member at HCE Venture Studio.',
    },
  }
}

export const networkMember1 = ({ profileImageID }: NetworkArgs) => {
  return {
    slug: 'alex-chen',
    _status: 'published' as const,
    name: 'Alex Chen',
    role: 'AI/ML Engineer & Venture Partner',
    profileImage: profileImageID,
    bio: 'Former machine learning lead at a FTSE 100 company, now building ethical AI solutions for startups. Passionate about making AI accessible whilst ensuring it remains human-centric and transparent. 10+ years of experience in natural language processing and computer vision.',
    skills: [
      { skill: 'Machine Learning' },
      { skill: 'Python' },
      { skill: 'TensorFlow' },
      { skill: 'MLOps' },
      { skill: 'AI Ethics' },
      { skill: 'Technical Leadership' },
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/alexchen',
      twitter: 'https://twitter.com/alexchen',
      github: 'https://github.com/alexchen',
      website: 'https://alexchen.dev',
    },
    meta: {
      title: 'Alex Chen | HCE Network',
      description:
        'AI/ML Engineer & Venture Partner at HCE Venture Studio. Building ethical AI solutions with 10+ years of experience.',
    },
  }
}

export const networkMember2 = ({ profileImageID }: NetworkArgs) => {
  return {
    slug: 'sarah-williams',
    _status: 'published' as const,
    name: 'Sarah Williams',
    role: 'Product Strategy & UX Design',
    profileImage: profileImageID,
    bio: 'Award-winning product designer with a background in psychology and human-computer interaction. Specialises in creating intuitive experiences that solve real problems for real people. Believes that great design is invisible—it just works.',
    skills: [
      { skill: 'Product Strategy' },
      { skill: 'UX Research' },
      { skill: 'Interface Design' },
      { skill: 'Design Systems' },
      { skill: 'User Testing' },
      { skill: 'Figma' },
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahwilliams',
      twitter: 'https://twitter.com/sarahwilliams',
      github: '',
      website: 'https://sarahwilliams.design',
    },
    meta: {
      title: 'Sarah Williams | HCE Network',
      description:
        'Product Strategy & UX Design specialist at HCE. Award-winning designer creating intuitive human-centric experiences.',
    },
  }
}

export const networkMember3 = ({ profileImageID }: NetworkArgs) => {
  return {
    slug: 'james-okonkwo',
    _status: 'published' as const,
    name: 'James Okonkwo',
    role: 'Full-Stack Developer & DevOps',
    profileImage: profileImageID,
    bio: 'Polyglot developer who loves building scalable, maintainable systems. Strong advocate for developer experience and documentation. When not coding, teaches web development to career changers and mentors junior developers in the local tech community.',
    skills: [
      { skill: 'TypeScript' },
      { skill: 'React' },
      { skill: 'Node.js' },
      { skill: 'PostgreSQL' },
      { skill: 'AWS' },
      { skill: 'Docker' },
      { skill: 'CI/CD' },
      { skill: 'Mentoring' },
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/jamesokonkwo',
      twitter: 'https://twitter.com/jamesokonkwo',
      github: 'https://github.com/jamesokonkwo',
      website: 'https://jamesokonkwo.dev',
    },
    meta: {
      title: 'James Okonkwo | HCE Network',
      description:
        'Full-Stack Developer & DevOps specialist at HCE. Building scalable systems and mentoring the next generation of developers.',
    },
  }
}
