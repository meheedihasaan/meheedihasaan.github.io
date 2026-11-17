// Everything about you that is not a project, a paper or a blog post.
// Projects: src/content/projects/*.md · Papers: src/content/publications.bib · Posts: fetched from Medium at build.

export const profile = {
  name: 'Mehedi Hasan',
  role: 'Research Engineer, IAR, MIU · Software Engineer',
  bio: 'Research engineer working on Green AI and AI for agriculture, climate and the environment, and, in parallel, a software engineer building payment, banking and crypto systems where a slow or inconsistent API means real money lost.',
  about: "As a research engineer at IAR, MIU, I work on Green AI, measuring and cutting the energy cost of AI, and on AI for agriculture, climate change and environmental science. As a software engineer at Dhrubok Infotech, I've spent 3.5+ years on payment, banking and crypto backends: Dhaka Bank's digital banking app and an EU Bitcoin wallet, in Java and Spring Boot, with event-driven design on Kafka and RabbitMQ and a lot of database performance work.",
  location: 'Dhaka, Bangladesh',
  // Leave orcid empty until you have one; citation counts switch on automatically when it is set.
  orcid: '',
  links: {
    email: 'mehedihasan111941@gmail.com',
    phone: '+880 1717-397402',
    github: 'https://github.com/meheedihasaan',
    linkedin: 'https://www.linkedin.com/in/meheedihasaan',
    medium: 'https://medium.com/@meheedihasaan',
    leetcode: 'https://leetcode.com/meheedihasaan',
    scholar: '',
    cv: '',
  },
  news: [
    { date: 'Nov 2026', text: 'Joined IAR, Manarat International University as a Research Engineer.', isNew: true },
    { date: 'Jul 2025', text: 'Promoted to Software Engineer at Dhrubok Infotech Services.' },
    { date: 'Jul 2023', text: 'Promoted from Trainee to Junior Software Engineer in 3 months.' },
  ],
  stats: [
    { n: 3, suffix: '.5+', label: 'years engineering' },
    { n: 150, suffix: 'k+', label: 'customers served' },
    { n: 90, suffix: '%', label: 'API latency cut' },
    { n: 3, suffix: ' mo', label: 'trainee to junior' },
  ],
  interests: [
    { title: 'Green AI', text: 'Measuring and cutting the energy and carbon cost of AI: efficient inference, model compression and carbon-aware serving.', tags: ['green-ai', 'efficient-inference', 'carbon'] },
    { title: 'AI in Agriculture', text: 'Crop disease detection, yield prediction and smart irrigation, with models light enough to run on low-cost devices in the field.', tags: ['agritech', 'computer-vision', 'edge-ai'] },
    { title: 'AI in Climate Change', text: 'Forecasting extreme weather and flood risk, and tracking emissions, with machine learning on climate data.', tags: ['climate', 'forecasting', 'risk'] },
    { title: 'AI in Environmental Science', text: 'Monitoring air and water quality, land use and biodiversity from satellite imagery and sensor networks.', tags: ['remote-sensing', 'air-quality', 'sensors'] },
  ],
  work: [
    { when: '06/2023 – present · Dhaka Bank', title: 'DBL Go Plus', url: 'https://play.google.com/store/apps/details?id=com.dbl.goplus', text: 'Digital banking app for 150,000+ customers: in-bank, EFTN, NPSB and bKash transfers, Bangla QR merchant payments, bill payment and top-up. One shared limit-and-validation layer for every money-moving feature.', tags: ['spring-boot', 'banking', 'performance'] },
    { when: '05/2024 – present · EU', title: 'WaveSpace', url: 'https://app.wave.space/', text: 'An EU Bitcoin and euro wallet with payment cards. Auto top-up over Lightning via Nostr Wallet Connect made WaveCard one of the first debit cards to spend Bitcoin from self-custody automatically.', tags: ['lightning', 'psd2', 'travel-rule'] },
    { when: '05/2023 – 08/2023 · Dhaka Bank', title: 'Self Service Portal', url: 'https://selfbanking.dhakabank.com.bd/', text: 'Debit card request and activation flows and tax slip submission, secure and compliant with regulatory requirements.', tags: ['portal', 'compliance'] },
  ],
  experience: [
    { now: true, title: 'Research Engineer', org: 'IAR, Manarat International University', when: '11/2026 – present', text: 'Green AI and AI for agriculture, climate change and environmental science.' },
    { now: true, title: 'Software Engineer', org: 'Dhrubok Infotech Services Ltd', when: '07/2025 – present', text: 'Cut API response times by up to 90% (query tuning, indexing, removing N+1 patterns). Moved key flows to Kafka and RabbitMQ, added Redis caching and rate limiting, and built Lightning payments and EU compliance for WaveSpace.' },
    { title: 'Junior Software Engineer', org: 'Dhrubok Infotech Services Ltd', when: '07/2023 – 07/2025', text: 'Designed REST APIs for DBL Go Plus and WaveSpace, from design through production. Integrated banking, payment and blockchain APIs, with idempotency so no transfer is duplicated or lost.' },
    { title: 'Trainee Software Engineer', org: 'Dhrubok Infotech Services Ltd', when: '05/2023 – 07/2023', text: "Features and production fixes on Dhaka Bank's Self Service and Corporate portals; promoted in 3 months." },
  ],
  skills: [
    ['languages', ['Java', 'SQL', 'C++', 'Python']],
    ['backend', ['Spring Boot', 'Spring Security', 'JPA/Hibernate', 'JWT', 'OAuth2', 'REST', 'Microservices']],
    ['messaging & data', ['Kafka', 'RabbitMQ', 'Redis', 'PostgreSQL', 'MySQL', 'Liquibase']],
    ['ops', ['Docker', 'AWS', 'GitHub Actions', 'Prometheus', 'Grafana']],
    ['AI & agentic', ['Claude Code', 'Cursor', 'Copilot', 'Codex', 'Multi-agent workflows', 'Ollama']],
    ['practices', ['System design', 'Performance tuning', 'JUnit', 'Testcontainers']],
  ],
  awards: [
    { place: '9th', text: 'Programming Contest Celebrating Mujib 100 Years' },
    { place: '9th', text: 'RoboDoc presents DCC Programming Fest' },
    { place: '16th', text: 'WYSD Inter Polytechnic Programming Contest' },
  ],
};

// Figures shown in the space readout, with their sources (refresh when you update the site)
export const earthFacts = {
  co2: { value: '426.1 ppm', when: 'Sep 2026', source: 'NOAA GML, Mauna Loa monthly mean' },
  temp: { value: '+1.19 °C', when: '2025', source: 'NASA GISTEMP v4, annual mean vs 1951–1980' },
};
