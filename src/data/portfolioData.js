/* ==========================================================================
   PORTFOLIO DATA — NAVEEN KUMAR E
   ========================================================================== */

export const PERSONAL_INFO = {
  name: "Naveen Kumar E",
  brandName: "CodeofNaveen",
  role: "Full-stack Software Developer & Creative Technologist",
  email: "naveenkumar.dev@outlook.com",
  location: "Chennai, India",
  timezone: "Asia/Kolkata",
  socials: [
    { label: "LinkedIn", href: "https://linkedin.com/in/naveen-kumar-e" },
    { label: "GitHub", href: "https://github.com/naveenkumar-dev" },
    { label: "Email", href: "mailto:naveenkumar.dev@outlook.com" }
  ],
  education: {
    degree: "B.Tech in Information Technology",
    institution: "KCG College of Technology, Chennai",
    period: "2022–2026",
    gpa: "7.52 / 10",
    description: "Curriculum focused on algorithms, software architecture, distributed databases, cloud systems, and full-stack engineering."
  },
  certifications: [
    { title: "Infosys Springboard Certifications", issuer: "INFOSYS" },
    { title: "Accenture Industry Readiness Certifications", issuer: "ACCENTURE" },
    { title: "Python Essential Training", issuer: "LINKEDIN LEARNING" },
    { title: "Fundamentals of Digital Marketing", issuer: "GOOGLE" },
    { title: "NPTEL Course — Foundational Computer Science", issuer: "NPTEL / IIT" },
    { title: "NPTEL Course — Web Technology & Systems", issuer: "NPTEL / IIT" }
  ]
};

export const PROJECTS = [
  {
    id: "agroequip-ai",
    title: "AgroEquipAI",
    year: "2026",
    category: "AI-Assisted Smart Agriculture",
    tagline: "Agricultural equipment, priced from the real address.",
    image: "/assets/images/project-agroequip.jpg",
    desc: "An agriculture-focused digital marketplace empowering farmers to discover and rent specialized machinery with transparent rates and multilingual accessibility.",
    arch: "Dual-Sided Marketplace = Farmer Rental Engine + Owner Fleet Management + Role Isolation",
    features: [
      "User and equipment-owner authenticated roles with granular permissions",
      "Secure OTP-based login workflow tailored for rural connectivity",
      "Multilingual interface supporting English and regional Indian languages",
      "Real-time equipment discovery, availability calendar, and rental booking",
      "Full booking lifecycle history and owner fleet revenue analytics",
      "Robust REST API with end-to-end CRUD operations and MongoDB indexing"
    ],
    tags: ["React Native", "Expo", "Node.js", "Express.js", "MongoDB", "AsyncStorage", "REST APIs"]
  },
  {
    id: "multi-tenant-crm",
    title: "Multi-Tenant Sales & Calling Platform",
    year: "2025–2026",
    category: "CRM / Enterprise Architecture",
    tagline: "A storefront & platform that stays up when others don't.",
    image: "/assets/images/project-crm.jpg",
    desc: "An enterprise-grade multi-tenant sales platform engineered around tenant isolation, role-based access control (RBAC), and feature-level entitlement switches.",
    arch: "Access Granted = Tenant Access + Feature Enabled + Role Permission",
    features: [
      "Tenant-aware database schema isolation preventing cross-tenant leakage",
      "Fine-grained role-based access control (RBAC) with custom administrative matrices",
      "Dynamic feature flag entitlements per tenant subscription tier",
      "Lead scoring pipeline, interactive customer timeline, and automated call logging",
      "Deals conversion pipeline with comprehensive analytics reporting"
    ],
    tags: ["React / Next.js", "C# / .NET", "PostgreSQL", "REST APIs", "Git & GitHub"]
  },
  {
    id: "ticket-classifier",
    title: "Smart Support Ticket Classifier",
    year: "2025",
    category: "AI / Automation / NLP",
    tagline: "Automated support triage, classified as you submit.",
    image: "/assets/images/project-classifier.jpg",
    desc: "A machine learning and NLP-backed support ticket classification service analyzing incoming customer inquiries, predicting routing queues, and evaluating urgency.",
    arch: "Ticket Resolution Flow = Ingestion → NLP Tokenizer → Multi-Class Classifier → Priority Queue",
    features: [
      "Automated ticket ingestion with real-time text parsing and tokenization",
      "Multi-class text classification routing tickets to billing, technical, or accounts",
      "Sentiment and urgency tag scoring for automated escalation workflows",
      "Clean, modern web interface for support engineers to manage high-priority queues"
    ],
    tags: ["Python", "Flask", "Scikit-Learn", "NLP Classification", "HTML5 & Modern CSS"]
  }
];

export const TESTIMONIALS = [
  {
    quote: "“Consistently delivered production-ready React modules and demonstrated strong grasp of component state, API integrations, and frontend workflows.”",
    author: "Enterprise Project Review",
    role: "Engineering Mentor",
    rating: "★ 5.0 · FULL-STACK"
  },
  {
    quote: "“Exceptional problem-solving speed on full-stack web systems. Great communication, clean code standards, and reliable delivery under deadlines.”",
    author: "Software Development Lead",
    role: "Technical Lead",
    rating: "★ 5.0 · REACT & NODE"
  },
  {
    quote: "“The multi-tenant architecture and role-based permissions were implemented with meticulous attention to edge cases and data isolation.”",
    author: "CRM System Architect",
    role: "Architecture Review",
    rating: "★ 5.0 · ARCHITECTURE"
  }
];

export const SERVICES = [
  {
    number: "01",
    subtitle: "FULL-STACK DEVELOPMENT",
    title: "Frontend Engineering",
    desc: "Sites that earn their keep. Fluid, responsive, and performance-tuned.",
    items: [
      "React, Next.js & TypeScript",
      "Tailwind CSS & Vanilla CSS",
      "State management & custom hooks",
      "Cross-browser performance QA"
    ]
  },
  {
    number: "02",
    subtitle: "WEBGL & BACKEND",
    title: "Backend & APIs",
    desc: "Resilient servers, structured webhooks, and secure authentication.",
    items: [
      "Node.js & Express.js",
      "Java & Spring Boot",
      "RESTful API architectures",
      "Tenant isolation & RBAC security"
    ]
  },
  {
    number: "03",
    subtitle: "DATABASES & CLOUD",
    title: "Databases & Cloud",
    desc: "Relational & document stores optimized for queries and zero loss.",
    items: [
      "PostgreSQL & MongoDB",
      "Google Cloud Platform (GCP)",
      "Docker containerization",
      "Git & GitHub CI pipelines"
    ]
  },
  {
    number: "04",
    subtitle: "AI AUTOMATION",
    title: "AI Automation",
    desc: "Machine learning services and automated queues that work while you sleep.",
    items: [
      "Python & Flask services",
      "NLP text classification",
      "Automated triage pipelines",
      "Webhook integrations"
    ]
  }
];

