/**
 * Per-role editorial content for /roles/[slug] landing pages.
 * Keys match SALARY_SCALE ids.
 */

export type RoleContent = {
  headline: string;
  subheadline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  keywords: string[];
  discipline: string;
};

export const ROLE_CONTENT: Record<string, RoleContent> = {
  "fpa-analyst": {
    headline: "Finance Analyst (FP&A)",
    subheadline: "Strategic Finance & Financial Planning professionals placed globally",
    description:
      "DeepTalent places elite FP&A and Strategic Finance professionals from Africa into demanding global financial-services and technology firms. Our network includes analysts with deep experience in multi-entity consolidation, board-level reporting, scenario modelling, and SaaS metrics.",
    responsibilities: [
      "Build and maintain three-statement financial models and rolling forecasts",
      "Prepare monthly board packs, KPI dashboards, and variance analyses",
      "Own budgeting and long-range planning cycles end-to-end",
      "Partner with business unit leaders to drive commercial decisions",
      "Design and automate reporting processes in Excel, Google Sheets, or BI tools",
    ],
    requirements: [
      "3+ years in FP&A, corporate finance, or strategic finance",
      "Proficiency in financial modelling and Excel / Google Sheets",
      "Experience with Xero, QuickBooks, NetSuite, or similar ERP",
      "Strong written communication — board-ready output expected",
      "CPA, ACCA, CIMA, or equivalent (mid/senior preferred)",
    ],
    keywords: ["fp&a analyst", "financial planning", "strategic finance", "budget analyst", "corporate finance"],
    discipline: "Finance & Accounting",
  },

  "kyc-aml": {
    headline: "KYC / AML Analyst",
    subheadline: "Compliance Monitoring & Financial Crime professionals placed globally",
    description:
      "DeepTalent sources credentialled KYC and AML analysts for fintechs, crypto firms, banks, and payment processors. Our analysts are trained on FATF guidelines, SAR filing, enhanced due diligence, and transaction monitoring platforms including Actimize, Feedzai, and Chainalysis.",
    responsibilities: [
      "Perform customer due diligence (CDD) and enhanced due diligence (EDD) reviews",
      "Monitor transactions for suspicious activity and file SARs where required",
      "Maintain up-to-date knowledge of FATF, FinCEN, and jurisdictional regulations",
      "Manage the client onboarding compliance queue and escalation workflows",
      "Review PEP, adverse media, and sanctions screening alerts",
    ],
    requirements: [
      "2+ years in KYC, AML, or financial crime compliance",
      "Familiarity with FATF 40 Recommendations and CDD Rule",
      "Experience with screening tools (World-Check, Refinitiv, etc.)",
      "CAMS certification or in progress (preferred)",
      "Attention to detail and audit-ready documentation habits",
    ],
    keywords: ["kyc analyst", "aml analyst", "compliance monitoring", "financial crime", "anti-money laundering"],
    discipline: "Compliance & Risk",
  },

  "product-manager": {
    headline: "Product Manager",
    subheadline: "Experienced Product Managers placed with global tech companies",
    description:
      "DeepTalent places product managers who have shipped in high-growth, complex environments — fintech, SaaS, marketplace, and enterprise. Our PMs own roadmaps, write crisp PRDs, lead cross-functional sprints, and navigate stakeholder alignment with confidence.",
    responsibilities: [
      "Define and maintain a prioritised product roadmap aligned to business goals",
      "Write product requirements documents (PRDs) and user stories",
      "Run sprint planning, backlog grooming, and retrospectives",
      "Conduct user research, synthesise insights, and translate them into features",
      "Track product metrics and lead data-driven iteration cycles",
    ],
    requirements: [
      "3+ years as a product manager in a tech company",
      "Demonstrated record of shipping products from concept to launch",
      "Strong written communication and stakeholder management skills",
      "Comfortable with analytics tools (Mixpanel, Amplitude, Looker)",
      "Experience in agile / scrum environments",
    ],
    keywords: ["product manager", "product owner", "PM", "product lead", "agile product manager"],
    discipline: "Product & Design",
  },

  "project-manager": {
    headline: "Project Manager",
    subheadline: "Delivery-focused Project Managers placed with global clients",
    description:
      "DeepTalent places project managers with strong delivery records across software, infrastructure, compliance, and operations projects. Our PMs are versed in Agile, Prince2, and hybrid frameworks, with proven experience managing distributed teams across time zones.",
    responsibilities: [
      "Own end-to-end project delivery: scope, schedule, budget, and risk",
      "Facilitate sprint ceremonies and cross-functional alignment meetings",
      "Maintain project plans, RAID logs, and status reports for stakeholders",
      "Manage vendor and third-party dependencies",
      "Drive post-project reviews and continuous improvement",
    ],
    requirements: [
      "3+ years in project management (technology or operations)",
      "PMP, Prince2, or equivalent certification (preferred)",
      "Proficiency in Jira, Asana, Monday.com, or similar",
      "Strong stakeholder communication and risk management skills",
      "Experience managing remote, distributed teams",
    ],
    keywords: ["project manager", "program manager", "delivery manager", "scrum master", "PMP"],
    discipline: "Product & Design",
  },

  "accountant": {
    headline: "Accountant / Bookkeeper",
    subheadline: "Qualified Accountants and Bookkeepers placed globally",
    description:
      "DeepTalent places qualified accountants and experienced bookkeepers with SMEs, startups, and scale-ups across the UK, US, Canada, and Australia. Our candidates maintain accurate books, manage monthly closes, and prepare financial statements to audit-ready standards.",
    responsibilities: [
      "Manage day-to-day bookkeeping: AP/AR, bank reconciliations, and general ledger",
      "Prepare monthly management accounts and cash flow reports",
      "Assist with payroll processing and VAT / GST / sales tax returns",
      "Support statutory audits and liaise with external accountants",
      "Implement and improve accounting processes in Xero or QuickBooks",
    ],
    requirements: [
      "2+ years in accounting or bookkeeping",
      "Proficiency in Xero, QuickBooks, Sage, or FreshBooks",
      "ACCA, ACA, AAT, or CPA qualification (or in progress)",
      "Accuracy and reliability in meeting monthly close deadlines",
      "Experience with multi-currency accounting (preferred)",
    ],
    keywords: ["accountant", "bookkeeper", "management accountant", "xero accountant", "quickbooks bookkeeper"],
    discipline: "Finance & Accounting",
  },

  "cybersecurity-analyst": {
    headline: "Cybersecurity Analyst",
    subheadline: "Security Operations & Information Security professionals placed globally",
    description:
      "DeepTalent places cybersecurity analysts into SOC teams, infosec functions, and cloud security roles at financial services, healthcare, and technology companies. Our analysts are experienced in threat detection, incident response, SIEM platforms, and vulnerability management.",
    responsibilities: [
      "Monitor SIEM alerts, triage incidents, and escalate high-severity events",
      "Conduct vulnerability assessments and coordinate remediation",
      "Assist with penetration test scoping, execution, and reporting",
      "Maintain security documentation: playbooks, policies, and risk registers",
      "Support compliance activities: ISO 27001, SOC 2, PCI-DSS",
    ],
    requirements: [
      "2+ years in cybersecurity or information security",
      "Experience with SIEM platforms (Splunk, Microsoft Sentinel, etc.)",
      "CompTIA Security+, CEH, CISSP, or equivalent (preferred)",
      "Knowledge of OWASP Top 10 and common attack vectors",
      "Scripting ability in Python or PowerShell (preferred)",
    ],
    keywords: ["cybersecurity analyst", "soc analyst", "infosec", "information security analyst", "security engineer"],
    discipline: "Compliance & Risk",
  },

  "bi-analyst": {
    headline: "Business Intelligence (BI) Analyst",
    subheadline: "BI & Analytics professionals placed with data-driven organisations",
    description:
      "DeepTalent places BI analysts who turn raw data into actionable commercial insight. Our analysts are fluent in SQL, proficient in Tableau, Power BI, or Looker, and experienced in building self-serve dashboards that reduce reporting overhead for leadership teams.",
    responsibilities: [
      "Design, build, and maintain BI dashboards and reports in Tableau, Power BI, or Looker",
      "Write complex SQL queries across relational and columnar databases",
      "Partner with business teams to define KPIs and data requirements",
      "Ensure data quality and consistency across reporting pipelines",
      "Document data models, metric definitions, and data dictionaries",
    ],
    requirements: [
      "3+ years in BI, data analytics, or a related role",
      "Advanced SQL and experience with data warehouses (BigQuery, Snowflake, Redshift)",
      "Proficiency in Tableau, Power BI, or Looker",
      "Strong presentation and data storytelling skills",
      "Experience with dbt or data modelling tools (preferred)",
    ],
    keywords: ["bi analyst", "business intelligence analyst", "tableau developer", "power bi analyst", "looker analyst"],
    discipline: "Data & Analytics",
  },

  "full-stack-developer": {
    headline: "Full-Stack Developer",
    subheadline: "Full-Stack Software Engineers placed with global product teams",
    description:
      "DeepTalent places full-stack engineers into product-led companies building on modern stacks. Our engineers ship features, maintain clean codebases, and integrate with complex APIs — from early-stage startups to Series B+ scale-ups across fintech, SaaS, and marketplace sectors.",
    responsibilities: [
      "Design, build, and ship full-stack features end-to-end",
      "Write clean, well-tested TypeScript / JavaScript (React, Next.js, Node.js)",
      "Integrate with third-party APIs: Stripe, Plaid, Twilio, etc.",
      "Participate in code reviews and maintain engineering standards",
      "Collaborate with designers and product managers in agile sprints",
    ],
    requirements: [
      "3+ years as a full-stack developer",
      "Strong React / Next.js and Node.js skills",
      "Comfortable with PostgreSQL, MongoDB, or similar databases",
      "Familiarity with CI/CD pipelines and cloud deployment (AWS, GCP, Vercel)",
      "Clear written communication for async collaboration",
    ],
    keywords: ["full-stack developer", "software engineer", "react developer", "node.js developer", "next.js developer"],
    discipline: "Technology & Engineering",
  },

  "credit-analyst": {
    headline: "Credit Analyst",
    subheadline: "Credit Risk & Underwriting professionals placed globally",
    description:
      "DeepTalent places credit analysts for lenders, fintechs, and investment firms that require rigorous underwriting, portfolio monitoring, and credit risk modelling. Our analysts are comfortable with both commercial and consumer credit frameworks.",
    responsibilities: [
      "Assess creditworthiness of individuals or businesses using financial and qualitative data",
      "Build and maintain credit risk models and scorecards",
      "Prepare credit memos and present recommendations to credit committees",
      "Monitor portfolio performance, identify deteriorating credits, and propose actions",
      "Ensure compliance with lending policies and regulatory credit risk standards",
    ],
    requirements: [
      "2+ years in credit analysis, underwriting, or lending",
      "Proficiency in financial statement analysis and cash flow modelling",
      "CFA Level I or credit-specific certification (preferred)",
      "Experience with credit risk platforms or LOS systems",
      "Strong written communication for credit memo production",
    ],
    keywords: ["credit analyst", "underwriter", "credit risk analyst", "loan analyst", "lending analyst"],
    discipline: "Finance & Accounting",
  },

  "data-analyst": {
    headline: "Data Analyst",
    subheadline: "Data Analysts placed with analytics-led global companies",
    description:
      "DeepTalent places data analysts who bridge raw data and business decision-making. Our analysts are proficient in SQL and Python, comfortable with A/B testing, and experienced translating ambiguous questions into structured analyses with clear recommendations.",
    responsibilities: [
      "Extract, clean, and analyse large datasets to answer business questions",
      "Build and maintain dashboards that surface operational and commercial metrics",
      "Design and analyse A/B tests; communicate results to non-technical stakeholders",
      "Collaborate with engineering teams to instrument product events",
      "Document methodologies and maintain a shared analytics knowledge base",
    ],
    requirements: [
      "2+ years in data analysis or a quantitative role",
      "Advanced SQL (window functions, CTEs, query optimisation)",
      "Proficiency in Python (pandas, numpy) or R",
      "Experience with BI tools: Looker, Tableau, Metabase, or similar",
      "Strong statistical reasoning and experimental design skills",
    ],
    keywords: ["data analyst", "analytics engineer", "sql analyst", "business analyst data", "reporting analyst"],
    discipline: "Data & Analytics",
  },

  "devops-cloud": {
    headline: "DevOps / Cloud Engineer",
    subheadline: "DevOps, SRE & Platform Engineers placed globally",
    description:
      "DeepTalent places DevOps and cloud engineers into engineering teams that need reliable infrastructure, fast deployments, and strong observability. Our engineers are experienced with AWS, GCP, and Azure, and proficient in Terraform, Kubernetes, and CI/CD tooling.",
    responsibilities: [
      "Design, build, and maintain cloud infrastructure on AWS, GCP, or Azure",
      "Manage CI/CD pipelines (GitHub Actions, CircleCI, Jenkins)",
      "Implement infrastructure-as-code using Terraform or Pulumi",
      "Set up monitoring, alerting, and incident response workflows",
      "Improve deployment reliability and reduce mean time to recovery (MTTR)",
    ],
    requirements: [
      "3+ years in DevOps, SRE, or platform engineering",
      "Strong proficiency in Terraform or equivalent IaC tools",
      "Experience with Kubernetes (EKS, GKE, or AKS)",
      "AWS / GCP / Azure certification (preferred)",
      "Scripting in Python, Bash, or Go",
    ],
    keywords: ["devops engineer", "cloud engineer", "site reliability engineer", "SRE", "platform engineer", "kubernetes"],
    discipline: "Technology & Engineering",
  },

  "ux-ui-designer": {
    headline: "UX / UI Designer",
    subheadline: "Product Designers & UX/UI professionals placed with global teams",
    description:
      "DeepTalent places UX and UI designers with strong portfolios into product-led companies. Our designers handle everything from user research and information architecture to high-fidelity prototyping in Figma, and have shipped consumer and B2B product experiences at scale.",
    responsibilities: [
      "Lead user research: interviews, surveys, usability testing, and synthesis",
      "Create wireframes, user flows, and high-fidelity Figma prototypes",
      "Maintain and extend a design system used by multiple product teams",
      "Collaborate with engineers to ensure pixel-accurate implementation",
      "Define and track UX metrics (task completion, error rate, NPS)",
    ],
    requirements: [
      "3+ years in UX/UI or product design",
      "Strong Figma skills and portfolio demonstrating end-to-end product thinking",
      "Experience conducting user research and translating insights into design decisions",
      "Familiarity with accessibility standards (WCAG 2.1)",
      "Experience contributing to or building a design system (preferred)",
    ],
    keywords: ["ux designer", "ui designer", "product designer", "figma designer", "interaction designer"],
    discipline: "Product & Design",
  },

  "ai-prompt-engineer": {
    headline: "AI Prompt Engineer / Specialist",
    subheadline: "AI Prompt Engineers & LLM Specialists placed globally",
    description:
      "DeepTalent places AI prompt engineers and LLM specialists into product, operations, and research teams building with GPT-4o, Claude, Gemini, and open-source models. Our specialists design prompt libraries, evaluate model outputs, and integrate AI into production workflows.",
    responsibilities: [
      "Design, test, and iterate on prompts for LLM-powered features and automations",
      "Build and maintain prompt libraries, evaluation datasets, and testing pipelines",
      "Integrate LLM APIs (OpenAI, Anthropic, Google) into product workflows",
      "Measure output quality: accuracy, hallucination rate, latency, cost per token",
      "Stay current with fast-moving AI research and tooling landscape",
    ],
    requirements: [
      "2+ years working directly with LLMs in a product or research context",
      "Proficiency with OpenAI, Anthropic, or Google AI APIs",
      "Python scripting for prompt evaluation and automation",
      "Strong written reasoning — systematic and evidence-based approach to iteration",
      "Familiarity with RAG, vector databases, or agent frameworks (preferred)",
    ],
    keywords: ["ai prompt engineer", "llm engineer", "prompt engineer", "ai automation specialist", "genai engineer"],
    discipline: "Technology & Engineering",
  },

  "executive-assistant": {
    headline: "Executive / Operations Assistant",
    subheadline: "Executive Assistants & Operations Coordinators placed globally",
    description:
      "DeepTalent places high-calibre executive assistants and operations coordinators with founders, C-suite executives, and senior leadership teams. Our EAs manage complex schedules, coordinate cross-border travel, and own business-critical administrative workflows.",
    responsibilities: [
      "Manage executive calendars, inbox triage, and scheduling across time zones",
      "Coordinate domestic and international travel, visas, and logistics",
      "Prepare meeting agendas, board materials, and executive briefings",
      "Maintain systems and processes: CRMs, project trackers, and SOPs",
      "Handle confidential communications and sensitive information with discretion",
    ],
    requirements: [
      "3+ years supporting C-suite or senior leadership",
      "Exceptional written and verbal communication in English",
      "Proficiency in Google Workspace and Microsoft 365",
      "Proven ability to manage competing priorities with minimal supervision",
      "Absolute discretion with confidential information",
    ],
    keywords: ["executive assistant", "EA", "operations assistant", "chief of staff", "virtual assistant", "admin"],
    discipline: "Operations & Support",
  },

  "customer-service": {
    headline: "Customer Service Representative",
    subheadline: "Customer Support professionals placed with global product companies",
    description:
      "DeepTalent places customer service representatives with consumer and B2B companies that need reliable, empathetic, and process-oriented support talent. Our CSRs handle multi-channel support (chat, email, phone) and are experienced with Zendesk, Intercom, and Freshdesk.",
    responsibilities: [
      "Respond to customer enquiries via email, chat, and phone within SLA targets",
      "Diagnose and resolve product issues, escalating where needed",
      "Maintain accurate records of interactions in CRM and support platforms",
      "Identify recurring issues and flag them to product and operations teams",
      "Contribute to knowledge-base articles and support documentation",
    ],
    requirements: [
      "1+ year in customer service or support",
      "Clear written and verbal communication in English",
      "Proficiency with Zendesk, Intercom, Freshdesk, or equivalent",
      "Empathetic and patient under pressure",
      "Experience in SaaS or fintech support environment (preferred)",
    ],
    keywords: ["customer service representative", "customer support", "customer success", "support agent", "help desk"],
    discipline: "Operations & Support",
  },
};
