/* ============================================
   B&S Academy â€” Sector Tracks Data
   ============================================
   This is the SINGLE SOURCE OF TRUTH for every
   sector's sub-tracks (the cards/items inside
   each sector section).

   WHY THIS FILE EXISTS:
   Instead of hand-writing each track's HTML inside
   index.html, every track is a plain JS object here.
   A small renderer (see render function below) reads
   this list and builds the cards automatically.

   HOW TO ADD / SPLIT / EDIT A TRACK (no HTML/CSS touch needed):
   - To EDIT a track: change its fields below.
   - To ADD a new track: copy an existing object inside
     the right sector's array, paste it, and edit the values.
   - To SPLIT a combined track into two (e.g. turning
     "Programming + AI" into two separate tracks later):
     duplicate the object, give each one its own id,
     title, description, and banner image, then remove
     the shared one. The page re-renders automatically.

   FIELD REFERENCE:
   - id: short unique slug (used internally, no spaces)
   - title_ar / title_en: track name shown to visitors
   - desc_ar / desc_en: one-line description under the title
   - banner: path to this track's image (optional â€” if
     omitted, the card shows without an image)
   - icon: an inline SVG path string (optional decorative icon)
   ============================================ */

const SECTOR_TRACKS = {

  engineering: {
    number: "01 / ENGINEERING SCIENCES",
    banner_main: null, // add images/banner-engineering-main.jpg when ready
    title_ar: "Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ©",
    title_en: "Engineering Sciences",
    desc_ar: "Ø§Ù„Ø£Ø³Ø§Ø³ Ø§Ù„Ù†Ø¸Ø±ÙŠ ÙˆØ§Ù„Ø±ÙŠØ§Ø¶ÙŠ Ø§Ù„ØµÙ„Ø¨ Ø§Ù„Ù„ÙŠ ÙŠØ¨Ù†ÙŠ Ø¹Ù‚Ù„ÙŠØ© Ø§Ù„Ù…Ù‡Ù†Ø¯Ø³ØŒ Ù‚Ø¨Ù„ Ù…Ø§ ÙŠÙ†ØªÙ‚Ù„ Ù„Ù„ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„ÙŠ ÙÙŠ Ø¹Ø§Ù„Ù… Ø§Ù„ØµÙ†Ø§Ø¹Ø©.",
    desc_en: "The solid theoretical and mathematical foundation that builds an engineer's mindset, before moving to real industrial application.",
    tracks: [
      {
        id: "eng-power-systems",
        title_ar: "Ø£Ù†Ø¸Ù…Ø© Ø§Ù„Ù‚ÙˆÙ‰ Ø§Ù„ÙƒÙ‡Ø±Ø¨ÙŠØ©",
        title_en: "Power Systems",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "eng-power-electronics",
        title_ar: "Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ§Øª Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ©",
        title_en: "Power Electronics",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "eng-circuits",
        title_ar: "Ø§Ù„Ø¯ÙˆØ§Ø¦Ø± Ø§Ù„ÙƒÙ‡Ø±Ø¨ÙŠØ©",
        title_en: "Circuits",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "eng-math",
        title_ar: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠØ©",
        title_en: "Engineering Mathematics",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "eng-matlab",
        title_ar: "Ù†Ù…Ø°Ø¬Ø© MATLAB",
        title_en: "MATLAB Modeling",
        desc_ar: "",
        desc_en: "",
        banner: null
      }
    ]
  },

  // ---------------------------------------------
  // Industrial Automation sector â€” INDEPENDENT from
  // Engineering Sciences per the academy's decision.
  // This is the first sector to use the flexible
  // prerequisites system (see js/supabase-config.js
  // bsComputeUnlockedTreeWithPrerequisites): "IIoT"
  // requires BOTH "Advanced PLC Programming" and
  // "Complete SCADA Mastery" â€” not just the sibling
  // before it. That cross-branch requirement is only
  // expressible through real Supabase data (the
  // `program_prerequisites` table); this local fallback
  // below shows the full tree shape but cannot encode
  // the prerequisite links themselves (those only exist
  // in the database), so in offline/preview mode all
  // automation programs render unlocked.
  // ---------------------------------------------
  automation: {
    number: "06 / INDUSTRIAL AUTOMATION & CONTROL",
    banner_main: null, // add images/banner-automation-main.jpg when ready
    title_ar: "Ù…Ø³Ø§Ø± Ø§Ù„Ø£ØªÙ…ØªØ© Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ© ÙˆØ£Ù†Ø¸Ù…Ø© Ø§Ù„ØªØ­ÙƒÙ…",
    title_en: "Industrial Automation & Control Systems",
    desc_ar: "Ù…Ù† Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠ Ø¥Ù„Ù‰ Ø§Ù„Ø«ÙˆØ±Ø© Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ© Ø§Ù„Ø±Ø§Ø¨Ø¹Ø© â€” Ø±Ø­Ù„Ø© ÙƒØ§Ù…Ù„Ø© Ù„Ù‚ÙŠØ§Ø¯Ø© Ø£Ø¶Ø®Ù… Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ© Ø¨Ø«Ù‚Ø©.",
    desc_en: "From classic control to Industry 4.0 â€” a complete journey to confidently lead massive industrial operations.",
    tracks: [
      {
        id: "auto-classic-control",
        title_ar: "Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠ ÙˆÙ…Ø­Ø±ÙƒØ§Øª Ø§Ù„Ø¯ÙØ¹",
        title_en: "Classic Control & Motor Drives",
        desc_ar: "Ø§Ù„Ù…Ø®Ø·Ø·Ø§Øª Ø§Ù„ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ©ØŒ ØªØµÙ…ÙŠÙ… Ø§Ù„Ù„ÙˆØ­Ø§ØªØŒ Ø§Ù„ÙƒÙˆÙ†ØªØ§ÙƒØªÙˆØ±Ø§ØªØŒ ÙˆØ·Ø±Ù‚ Ø¨Ø¯Ø¡ Ø§Ù„Ù…Ø­Ø±ÙƒØ§Øª",
        desc_en: "Electrical diagrams, panel design, contactors, and motor starting methods",
        banner: null
      },
      {
        id: "auto-instrumentation",
        title_ar: "Ø£Ø¬Ù‡Ø²Ø© Ø§Ù„Ù‚ÙŠØ§Ø³ ÙˆØ§Ù„ØªØ­ÙƒÙ… Ø§Ù„ØµÙ†Ø§Ø¹ÙŠ",
        title_en: "Industrial Instrumentation",
        desc_ar: "Ù…Ø¹Ø§ÙŠØ±Ø© Ø­Ø³Ø§Ø³Ø§Øª Ø§Ù„Ø¶ØºØ· ÙˆØ§Ù„Ø­Ø±Ø§Ø±Ø© ÙˆØ§Ù„ØªØ¯ÙÙ‚ØŒ ÙˆØ§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹ Ø§Ù„Ø¥Ø´Ø§Ø±Ø§Øª Ø§Ù„ØªÙ†Ø§Ø¸Ø±ÙŠØ© ÙˆØ§Ù„Ø±Ù‚Ù…ÙŠØ©",
        desc_en: "Calibrating pressure, temperature, and flow sensors; analog/digital signal handling",
        banner: null
      },
      {
        id: "auto-plc-advanced",
        title_ar: "Ø¨Ø±Ù…Ø¬Ø© Ø§Ù„Ù€ PLC Ø§Ù„Ù…ØªÙ‚Ø¯Ù…",
        title_en: "Advanced PLC Programming",
        desc_ar: "Ù„ØºØ© Ø§Ù„Ø³Ù„Ù… (Ladder Logic)ØŒ Ø¨ÙŠØ¦Ø© TIA PortalØŒ Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„ØªØªØ§Ø¨Ø¹ÙŠØ©",
        desc_en: "Ladder Logic, TIA Portal environment, sequential operations",
        banner: null
      },
      {
        id: "auto-hmi-design",
        title_ar: "ØªØµÙ…ÙŠÙ… ÙˆØ§Ø¬Ù‡Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… HMI",
        title_en: "HMI Design",
        desc_ar: "ØªØµÙ…ÙŠÙ… Ø§Ù„Ø´Ø§Ø´Ø§Øª Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ© ÙˆØ±Ø¨Ø·Ù‡Ø§ Ø¨Ø§Ù„Ù€ PLC",
        desc_en: "Designing interactive screens and linking them to PLCs",
        banner: null
      },
      {
        id: "auto-scada-mastery",
        title_ar: "Ø§Ø­ØªØ±Ø§Ù Ø£Ù†Ø¸Ù…Ø© SCADA",
        title_en: "Complete SCADA Mastery",
        desc_ar: "Ø±Ø¨Ø· Ø®Ø·ÙˆØ· Ø§Ù„Ø¥Ù†ØªØ§Ø¬ØŒ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¥Ù†Ø°Ø§Ø±Ø§ØªØŒ ÙˆØ§Ù„Ø£Ø±Ø´ÙØ© Ø§Ù„Ø£ÙˆÙ„ÙŠØ©",
        desc_en: "Connecting production lines, alarm management, and initial archiving",
        banner: null
      },
      {
        id: "auto-aveva-pi",
        title_ar: "Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ù…Ø¤Ø³Ø³ÙŠ ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª",
        title_en: "AVEVA & PI System Mastery",
        desc_ar: "",
        desc_en: "",
        banner: null,
        children: [
          {
            id: "auto-aveva-intouch",
            title_ar: "ØªØµÙ…ÙŠÙ… ÙˆØ§Ø¬Ù‡Ø§Øª Ø§Ù„Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠØ©",
            title_en: "AVEVA InTouch HMI",
            desc_ar: "",
            desc_en: "",
            banner: null
          },
          {
            id: "auto-aveva-system-platform",
            title_ar: "Ù…Ù†ØµØ© Ø§Ù„Ù†Ø¸Ø§Ù…",
            title_en: "AVEVA System Platform",
            desc_ar: "",
            desc_en: "",
            banner: null,
            children: [
              {
                id: "auto-application-server",
                title_ar: "Ø®Ø§Ø¯Ù… Ø§Ù„ØªØ·Ø¨ÙŠÙ‚Ø§Øª",
                title_en: "Application Server",
                desc_ar: "",
                desc_en: "",
                banner: null
              },
              {
                id: "auto-omi",
                title_ar: "ÙˆØ§Ø¬Ù‡Ø§Øª Ø§Ù„ØªØ´ØºÙŠÙ„ Ø§Ù„Ø±Ù‚Ù…ÙŠØ©",
                title_en: "OMI - Operations Management Interface",
                desc_ar: "",
                desc_en: "",
                banner: null
              }
            ]
          },
          {
            id: "auto-aveva-historian",
            title_ar: "Ø§Ù„Ø£Ø±Ø´ÙØ© Ø§Ù„Ù…Ø­Ù„ÙŠØ© Ù„Ù„Ø¹Ù…Ù„ÙŠØ§Øª",
            title_en: "AVEVA Historian",
            desc_ar: "",
            desc_en: "",
            banner: null
          },
          {
            id: "auto-aveva-pi-system",
            title_ar: "Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¤Ø³Ø³ÙŠØ© ÙˆØªØ­Ù„ÙŠÙ„Ù‡Ø§",
            title_en: "AVEVA PI System",
            desc_ar: "",
            desc_en: "",
            banner: null
          }
        ]
      },
      {
        id: "auto-iiot",
        title_ar: "Ø¥Ù†ØªØ±Ù†Øª Ø§Ù„Ø£Ø´ÙŠØ§Ø¡ Ø§Ù„ØµÙ†Ø§Ø¹ÙŠ ÙˆØ§Ù„Ø«ÙˆØ±Ø© Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ© Ø§Ù„Ø±Ø§Ø¨Ø¹Ø©",
        title_en: "IIoT & Industry 4.0",
        desc_ar: "ðŸ”’ ÙŠØªØ·Ù„Ø¨ Ø§Ø¬ØªÙŠØ§Ø² Ø¨Ø±Ø§Ù…Ø¬ PLC Ø§Ù„Ù…ØªÙ‚Ø¯Ù… Ùˆ SCADA Ø£ÙˆÙ„Ø§Ù‹ â€” Ø±Ø¨Ø· Ø£Ø±Ø¶ Ø§Ù„Ù…ØµÙ†Ø¹ Ø¨Ø§Ù„Ø£Ù†Ø¸Ù…Ø© Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠØ© ÙˆØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø°ÙƒÙŠØ©",
        desc_en: "ðŸ”’ Requires completing Advanced PLC and SCADA first â€” connecting the factory floor to cloud systems and smart data analysis",
        banner: null,
        children: [
          {
            id: "auto-iiot-networking",
            title_ar: "Ø§Ù„Ø´Ø¨ÙƒØ§Øª Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ© ÙˆØ­ÙˆØ³Ø¨Ø© Ø§Ù„Ø­Ø§ÙØ©",
            title_en: "Industrial Networking & Edge Computing",
            desc_ar: "Ø¨Ø±ÙˆØªÙˆÙƒÙˆÙ„Ø§Øª OPC UA, MQTTØŒ Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø­Ø§ÙØ©ØŒ ÙˆØ¨Ø±Ù…Ø¬Ø© Node-RED",
            desc_en: "OPC UA, MQTT protocols, Edge Gateways, and Node-RED programming",
            banner: null
          },
          {
            id: "auto-iiot-cloud",
            title_ar: "Ø§Ù„Ù…Ù†ØµØ§Øª Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠØ© ÙˆÙ„ÙˆØ­Ø§Øª Ø§Ù„Ù‚ÙŠØ§Ø³",
            title_en: "Cloud IoT & Dashboards",
            desc_ar: "Ø±Ø¨Ø· Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ØµÙ†Ø¹ Ø¨Ù€ AWS IoT Ø£Ùˆ AzureØŒ ÙˆÙ„ÙˆØ­Ø§Øª Ù…Ø±Ø§Ù‚Ø¨Ø© Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Grafana",
            desc_en: "Connecting factory data to AWS IoT or Azure, and Grafana dashboards",
            banner: null
          },
          {
            id: "auto-iiot-smart-manufacturing",
            title_ar: "Ø§Ù„ØªØµÙ†ÙŠØ¹ Ø§Ù„Ø°ÙƒÙŠ ÙˆØ§Ù„ØªÙˆØ£Ù… Ø§Ù„Ø±Ù‚Ù…ÙŠ",
            title_en: "Smart Manufacturing & Digital Twin",
            desc_ar: "Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ©ØŒ Ø§Ù„ØµÙŠØ§Ù†Ø© Ø§Ù„ØªÙ†Ø¨Ø¤ÙŠØ©ØŒ ÙˆÙ…ÙØ§Ù‡ÙŠÙ… Ø§Ù„ØªÙˆØ£Ù… Ø§Ù„Ø±Ù‚Ù…ÙŠ",
            desc_en: "AI on industrial data, predictive maintenance, and Digital Twin concepts",
            banner: null
          }
        ]
      }
    ]
  },

  accounting: {
    number: "02 / SMART ACCOUNTING & FINTECH",
    banner_main: "images/banner-accounting-main.webp",
    title_ar: "Ø§Ù„Ù…Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø°ÙƒÙŠØ© ÙˆØ§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø§Ù„Ù…Ø§Ù„ÙŠØ©",
    title_en: "Smart Accounting & FinTech",
    desc_ar: "Ù†Ø¹ÙŠØ¯ ØµÙŠØ§ØºØ© Ù…ÙÙ‡ÙˆÙ… Ø§Ù„Ù…Ø­Ø§Ø³Ø¨Ø© Ù„Ù†ØµÙ†Ø¹ \"Ø§Ù„Ù…Ø­Ù„Ù„ Ø§Ù„Ù…Ø§Ù„ÙŠ Ø§Ù„Ø°ÙƒÙŠ\". Ù…Ù† Ø£Ø³Ø§Ø³ÙŠØ§Øª Ø§Ù„Ø¯ÙØ§ØªØ± ÙˆØ­ØªÙ‰ Ø£ØªÙ…ØªØ© Ø§Ù„Ù…Ù‡Ø§Ù… ÙˆØ¨Ù†Ø§Ø¡ Ù„ÙˆØ­Ø§Øª Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ©.",
    desc_en: "Reshaping accounting to build the \"Smart Financial Analyst.\" From bookkeeping basics to task automation and interactive dashboards.",
    children_sequential_lock: true, // the 5 stages build on each other
    tracks: [
      {
        id: "acc-stage-0",
        title_ar: "Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„ØµÙØ±ÙŠØ©: Ø§Ù„Ø£Ø³Ø§Ø³ Ø§Ù„Ù…Ø§Ù„ÙŠ",
        title_en: "Stage 0: The Foundation",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-stage0.webp",
        children: [
          { id: "acc-practical", title_ar: "Ø§Ù„Ù…Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ©", title_en: "Practical Accounting", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-statistics", title_ar: "Ø§Ù„Ø¥Ø­ØµØ§Ø¡ Ù„Ù„Ù…Ø§Ù„ÙŠÙŠÙ†", title_en: "Statistics for Finance", desc_ar: "", desc_en: "", banner: null }
        ]
      },
      {
        id: "acc-stage-1",
        title_ar: "Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰: Ø§Ø­ØªØ±Ø§Ù Ø§Ù„Ø¥ÙƒØ³ÙŠÙ„ Ùˆ Power BI",
        title_en: "Stage 1: Excel & Power BI Mastery",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-stage1.webp",
        children: [
          { id: "acc-excel-essential", title_ar: "Excel Essential Training", title_en: "Excel Essential Training", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-excel-formulas", title_ar: "Ø§Ø­ØªØ±Ø§Ù Ø§Ù„ØµÙŠØº ÙˆØ§Ù„Ø¯ÙˆØ§Ù„ ÙÙŠ Ø§Ù„Ø¥ÙƒØ³ÙŠÙ„", title_en: "Mastering Excel Formulas and Functions", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-pivot-tables", title_ar: "ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Pivot Tables", title_en: "Data Analysis using Pivot Tables", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-power-query", title_ar: "Power Query in Excel", title_en: "Power Query in Excel", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-what-if", title_ar: "What If Analysis in Excel", title_en: "What If Analysis in Excel", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-dashboard-bootcamp", title_ar: "Excel Dashboard Bootcamp", title_en: "Excel Dashboard Bootcamp: Build Interactive Reports", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-power-pivot", title_ar: "Power Pivot Masterclass", title_en: "Power Pivot Masterclass", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-tips-tricks", title_ar: "Ù†ØµØ§Ø¦Ø­ ÙˆØ­ÙŠÙ„ Ø³Ø±ÙŠØ¹Ø© ÙÙŠ Ø§Ù„Ø¥ÙƒØ³ÙŠÙ„", title_en: "Short Tips & Tricks (Excel)", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-powerbi-masterclass", title_ar: "Power BI Masterclass", title_en: "Power BI Masterclass", desc_ar: "", desc_en: "", banner: null }
        ]
      },
      {
        id: "acc-stage-2",
        title_ar: "Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù†ÙŠØ©: Ø¥Ø¯Ø§Ø±Ø© Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠØ©",
        title_en: "Stage 2: Cloud & Databases",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-stage2.webp",
        children: [
          { id: "acc-google-sheets", title_ar: "Ø§Ø³ØªØ®Ø¯Ø§Ù… Google Sheets Ù„Ù„ØªØ¹Ø§ÙˆÙ† Ø§Ù„Ù…Ø§Ù„ÙŠ Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠ", title_en: "Google Sheets for Cloud Financial Collaboration", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-sql-erp", title_ar: "Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ£Ù†Ø¸Ù…Ø© ERP Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… SQL", title_en: "Databases & ERP Systems using SQL", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-tableau", title_ar: "Ø§Ø³ØªØ®Ø¯Ø§Ù… Tableau Ù„Ø¹Ø±Ø¶ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ØªÙ‚Ø¯Ù…", title_en: "Tableau for Advanced Data Visualization", desc_ar: "", desc_en: "", banner: null }
        ]
      },
      {
        id: "acc-stage-3",
        title_ar: "Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù„Ø«Ø©: Ø§Ø­ØªØ±Ø§Ù Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ÙˆØ§Ù„Ø£ØªÙ…ØªØ© Ø§Ù„Ù…Ø§Ù„ÙŠØ©",
        title_en: "Stage 3: AI & Financial Automation",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-stage3.webp",
        children: [
          { id: "acc-chatgpt-excel", title_ar: "ChatGPT & AI for Microsoft Excel", title_en: "ChatGPT & AI for Microsoft Excel", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-copilot-excel", title_ar: "Ø§Ø­ØªØ±Ø§Ù Microsoft Copilot ÙÙŠ Ø§Ù„Ø¥ÙƒØ³ÙŠÙ„", title_en: "AI-Driven Excel: Mastering Microsoft Copilot", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-copilot-formulas", title_ar: "Ø§Ù„ØµÙŠØº ÙˆØ§Ù„Ø¯ÙˆØ§Ù„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Copilot", title_en: "Formulas and Functions using Copilot", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-python-beginners", title_ar: "Python for Beginners", title_en: "Python for Beginners", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-python-data", title_ar: "ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø§Ù„ÙŠØ© Ø§Ù„Ø¶Ø®Ù…Ø© Ø¨Ø§Ù„Ø¨Ø§ÙŠØ«ÙˆÙ†", title_en: "Data Analysis using Python", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-power-automate", title_ar: "Power Apps & Power Automate Bootcamp", title_en: "Power Apps & Power Automate Bootcamp", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-n8n-agents", title_ar: "Ø¨Ù†Ø§Ø¡ ÙˆÙƒÙ„Ø§Ø¡ ÙˆØ£ØªÙ…ØªØ© Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø¹Ø¨Ø± N8N", title_en: "AI Agents & Automations using N8N", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-generative-ai", title_ar: "Ø§Ø­ØªØ±Ø§Ù Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø§Ù„ØªÙˆÙ„ÙŠØ¯ÙŠ", title_en: "Generative AI Mastery", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-prompt-engineering", title_ar: "Prompt Engineering & Vibe Coding", title_en: "Prompt Engineering & Vibe Coding", desc_ar: "", desc_en: "", banner: null }
        ]
      },
      {
        id: "acc-stage-final",
        title_ar: "Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©: Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„ØªØ®Ø±Ø¬",
        title_en: "Final Stage: Graduation Project",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-final.webp",
        children: [
          { id: "acc-graduation-project", title_ar: "Ù…Ø­Ø§ÙƒØ§Ø© Ø´Ø±ÙƒØ© Ø­Ù‚ÙŠÙ‚ÙŠØ©", title_en: "Real Company Simulation", desc_ar: "ØªÙ†Ø¸ÙŠÙ Ø¨ÙŠØ§Ù†Ø§ØªØŒ Ø§Ø³ØªØ¹Ù„Ø§Ù…Ø§Øª SQLØŒ Ù„ÙˆØ­Ø§Øª ØªØ­ÙƒÙ… Power BIØŒ ÙˆØ£ØªÙ…ØªØ© Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±", desc_en: "Data cleaning, SQL queries, Power BI dashboards, and report automation", banner: null }
        ]
      }
    ]
  },

  academic: {
    number: "03 / ACADEMIC EXCELLENCE & SUPPORT",
    banner_main: null, // add images/banner-academic-main.jpg when ready
    title_ar: "Ø§Ù„Ø¨Ø­Ø« Ø§Ù„Ø¹Ù„Ù…ÙŠ ÙˆØ¯Ø¹Ù… Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹",
    title_en: "Academic Excellence & Project Support",
    desc_ar: "Ø¥Ø´Ø±Ø§Ù Ù‡Ù†Ø¯Ø³ÙŠ Ù…ØªÙƒØ§Ù…Ù„ ÙŠØ±Ø§ÙÙ‚Ùƒ Ù…Ù† ÙˆÙ„Ø§Ø¯Ø© Ø§Ù„ÙÙƒØ±Ø© ÙˆØ­ØªÙ‰ Ø§Ù„Ù…Ù†Ø§Ù‚Ø´Ø© ÙˆØ§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø¹Ù„Ù…ÙŠØ©.",
    desc_en: "Comprehensive engineering supervision from idea generation to final defense and graduation.",
    tracks: [
      {
        id: "acad-masters",
        title_ar: "Ø¨Ø§Ø­Ø«ÙŠ Ø§Ù„Ù…Ø§Ø¬Ø³ØªÙŠØ±",
        title_en: "Master's Researchers",
        desc_ar: "Ø¥Ø´Ø±Ø§Ù ÙƒØ§Ù…Ù„ Ù…Ù† Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ù„Ù„Ù†Ù‡Ø§ÙŠØ©ØŒ ØªÙ†Ø³ÙŠÙ‚ Ø§Ù„Ø±Ø³Ø§Ù„Ø©ØŒ ØªØ¬Ù‡ÙŠØ² Ù„Ù„ÙÙ‡Ù… Ø§Ù„Ø¹Ù…ÙŠÙ‚ ÙˆØ¬Ø§Ù‡Ø²ÙŠØ© Ø§Ù„Ù…Ù†Ø§Ù‚Ø´Ø©",
        desc_en: "End-to-end supervision, formatting, deep understanding prep, defense readiness",
        banner: null
      },
      {
        id: "acad-bachelors",
        title_ar: "Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠÙˆØ³",
        title_en: "Bachelor's Students",
        desc_ar: "Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ÙÙƒØ±Ø©ØŒ Ø§Ù„ØªÙ†ÙÙŠØ° Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠ Ø§Ù„Ø¯Ù‚ÙŠÙ‚ØŒ ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ØŒ Ø§Ù„ØªØ­Ø¶ÙŠØ± Ù„Ù„Ø¹Ø±Ø¶ Ø§Ù„ØªÙ‚Ø¯ÙŠÙ…ÙŠ",
        desc_en: "Idea selection, accurate engineering execution, documentation, presentation prep",
        banner: null
      }
    ]
  },

  highschool: {
    number: "04 / B&S HIGH SCHOOL",
    banner_main: null, // add images/banner-highschool-main.jpg when ready
    title_ar: "Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù†ÙˆÙŠØ©",
    title_en: "High School",
    desc_ar: "Ø´Ø±Ø­ ØªÙØ§Ø¹Ù„ÙŠ ÙŠØ¨Ù†ÙŠ Ø¹Ù‚Ù„ÙŠØ© Ø¹Ù„Ù…ÙŠØ© ØµØ­ÙŠØ­Ø© ØªÙ…Ù‡Ø¯ Ù„Ù„ØªÙÙƒÙŠØ± Ø§Ù„Ù‡Ù†Ø¯Ø³ÙŠ.",
    desc_en: "Interactive explanations building a strong scientific mindset for future engineering thinking.",
    tracks: [
      {
        id: "hs-physics",
        title_ar: "Ø§Ù„ÙÙŠØ²ÙŠØ§Ø¡",
        title_en: "Physics",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "hs-math",
        title_ar: "Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ§Øª",
        title_en: "Mathematics",
        desc_ar: "",
        desc_en: "",
        banner: null
      }
    ]
  },

  // ---------------------------------------------
  // Kids & Teens sector
  // Currently 2 cards: "Programming + AI" is one
  // combined track for now. To split it later into
  // "Programming" and "AI" separately, just break this
  // single object into two â€” see instructions above.
  // ---------------------------------------------
  kids: {
    number: "05 / KIDS & TEENS TECH SCHOOL",
    banner_main: "images/banner-kids-main.webp",
    title_ar: "Ù…Ø¯Ø±Ø³Ø© Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ù„ØµØºØ§Ø± Ø§Ù„Ø³Ù†",
    title_en: "Kids & Teens Tech School",
    desc_ar: "ØªØ­ÙˆÙŠÙ„ Ø·ÙÙ„Ùƒ Ù…Ù† Ù…Ø³ØªÙ‡Ù„Ùƒ Ù„Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø¥Ù„Ù‰ Ù…Ø¨Ø¯Ø¹ ÙˆÙ…Ø·ÙˆØ± ÙÙŠ Ø¨ÙŠØ¦Ø© ØªÙØ§Ø¹Ù„ÙŠØ© Ù…Ù…ØªØ¹Ø©.",
    desc_en: "Transforming your child from a technology consumer into a creator in a fun, interactive environment.",
    tracks: [
      {
        id: "kids-programming-ai",
        title_ar: "Ø§Ù„Ø¨Ø±Ù…Ø¬Ø© Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ© ÙˆØ§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ",
        title_en: "Interactive Programming & AI",
        desc_ar: "Ù…Ù† Ø£ÙˆÙ„ Ù„Ø¹Ø¨Ø© ÙŠØ¨Ù†ÙŠÙ‡Ø§ Ø§Ù„Ø·ÙÙ„ Ø¨Ù€ Scratch Ù„Ø­Ø¯ Ø£ÙˆÙ„ Ø®Ø·ÙˆØ© ÙÙŠ Ø¹Ø§Ù„Ù… Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ",
        desc_en: "From a child's first Scratch game to first steps into AI",
        banner: "images/banner-kids-programming-ai.webp"
      },
      {
        id: "kids-english",
        title_ar: "Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ©",
        title_en: "Interactive English",
        desc_ar: "PhonicsØŒ Ø§Ù„Ù‚ØµØµ Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ©ØŒ ÙˆØ§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© Ø¨Ø·Ø±ÙŠÙ‚Ø© Ù…Ø±Ø­Ø© ÙˆÙ…Ø´Ø¬Ø¹Ø©",
        desc_en: "Phonics, interactive storytelling, and fun conversation practice",
        banner: "images/banner-kids-english.webp"
      }
    ]
  }

  // ---------------------------------------------
  // Future sectors go here following the exact
  // same shape as above.
  // ---------------------------------------------
};

/* ============================================
   Sector ORDER for the overview cards (controls
   the display order on the homepage)
   ============================================ */
const SECTOR_ORDER = ['engineering', 'automation', 'accounting', 'academic', 'highschool', 'kids'];
let sectorOverviewRenderToken = 0;

function bsPreferWebpAsset(url) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/(images\/(?:logo2?|banner-[^?#"')]+))\.(?:png|jpe?g)(?=([?#]|$))/gi, '$1.webp');
}

function getLocalSectorOverviewData() {
  return SECTOR_ORDER.map(key => {
    const s = SECTOR_TRACKS[key];
    return s ? { key, ...s } : null;
  }).filter(Boolean);
}

function mapLiveSectorRows(rows) {
  return rows.map(row => ({
    key: row.sector_key,
    number: row.sort_order ? `0${row.sort_order} / ${row.sector_key.toUpperCase()}` : row.sector_key.toUpperCase(),
    title_ar: row.title_ar,
    title_en: row.title_en,
    desc_ar: row.desc_ar,
    desc_en: row.desc_en,
    banner_main: bsPreferWebpAsset(row.banner_url)
  }));
}

function injectSectorOverviewCards(container, sectors, lang) {
  container.innerHTML = sectors.map(rawSector => {
    const s = { ...rawSector, banner_main: bsPreferWebpAsset(rawSector.banner_main) };
    return `
    <a href="#sector-detail-${s.key}" data-nav="sector-detail" data-sector-key="${s.key}" class="sector-overview-card reveal">
      <div class="sector-overview-card-banner">
        ${s.banner_main ? `<img src="${s.banner_main}" alt="${lang === 'ar' ? s.title_ar : s.title_en}" loading="lazy" decoding="async">` : '<div class="sector-overview-card-noimg"></div>'}
      </div>
      <div class="sector-overview-card-body">
        <span class="sector-number">${s.number}</span>
        <h3>${lang === 'ar' ? s.title_ar : s.title_en}</h3>
        <p>${lang === 'ar' ? s.desc_ar : s.desc_en}</p>
        <span class="sector-overview-card-link">${lang === 'ar' ? 'Ø§Ø¹Ø±Ù Ø£ÙƒØªØ± â†' : 'Learn more â†’'}</span>
      </div>
    </a>
  `;
  }).join('');

  requestAnimationFrame(() => {
    container.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
  });
}

/* ============================================
   Renderer 1: Homepage "overview" cards â€”
   one compact card per sector, linking to that
   sector's own detail page.

   DATA SOURCE PRIORITY:
   1. Supabase `programs` table (live, real tree â€”
      reflects whatever the admin panel has saved)
   2. Local SECTOR_TRACKS object above (fallback,
      used when Supabase isn't configured yet or
      a sector has no rows in the database)
   ============================================ */
async function renderSectorOverviewCards() {
  const container = document.getElementById('sectorOverviewGrid');
  if (!container) return;

  const lang = currentLang || 'ar';
  const renderToken = ++sectorOverviewRenderToken;
  injectSectorOverviewCards(container, getLocalSectorOverviewData(), lang);

  // Refresh from the live database in the background.
  // The local cards are already visible, so a slow network never leaves this section blank.
  if (typeof bsGetTopLevelSectors === 'function' && typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured) {
    const liveSectors = await bsGetTopLevelSectors();
    if (renderToken === sectorOverviewRenderToken && liveSectors && liveSectors.length) {
      injectSectorOverviewCards(container, mapLiveSectorRows(liveSectors), lang);
    }
  }
}

/* ============================================
   Renderer 2: Sector DETAIL page â€” fills the
   generic #page-sector-detail with the chosen
   sector's full content (banner, title, desc,
   and its program tree, to any depth).

   DATA SOURCE PRIORITY: same as renderSectorOverviewCards â€”
   live Supabase tree first, local SECTOR_TRACKS fallback.
   ============================================ */
async function renderSectorDetailPage(sectorKey) {
  const lang = currentLang || 'ar';

  const bannerWrap = document.getElementById('sectorDetailBanner');
  const bannerImg = document.getElementById('sectorDetailBannerImg');
  const numberEl = document.getElementById('sectorDetailNumber');
  const titleEl = document.getElementById('sectorDetailTitle');
  const descEl = document.getElementById('sectorDetailDesc');
  const breadcrumbEl = document.getElementById('breadcrumbCurrent');
  const tracksContainer = document.getElementById('sectorDetailTracks');

  let sectorInfo = null;
  let tree = [];
  let displayRootNodeId = null;

  // Try the live database first
  if (typeof bsGetSectorProgramTree === 'function' && typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured) {
    tree = await bsWithTimeout(bsGetSectorProgramTree(sectorKey), 2500, []);
    if (tree && tree.length) {
      // In the recursive model, the sector's own info is the
      // single root row with parent_id = null for this sector_key.
      // If a sector somehow has multiple top-level rows, we treat
      // the first as the sector header and the rest as its programs.
      const sectors = await (typeof bsGetTopLevelSectors === 'function'
        ? bsWithTimeout(bsGetTopLevelSectors(), 2000, [])
        : []);
      const matchingSector = (sectors || []).find(s => s.sector_key === sectorKey);
      if (matchingSector) {
        sectorInfo = {
          number: matchingSector.sort_order ? `0${matchingSector.sort_order} / ${sectorKey.toUpperCase()}` : sectorKey.toUpperCase(),
          title_ar: matchingSector.title_ar,
          title_en: matchingSector.title_en,
          desc_ar: matchingSector.desc_ar,
          desc_en: matchingSector.desc_en,
          banner_main: bsPreferWebpAsset(matchingSector.banner_url)
        };

        const normalizeTitle = (value) => String(value || '').trim().toLowerCase();
        const rootSectorNode = tree.find(node =>
          node.children && node.children.length &&
          normalizeTitle(node.title_ar) === normalizeTitle(matchingSector.title_ar) &&
          normalizeTitle(node.title_en) === normalizeTitle(matchingSector.title_en)
        );

        if (rootSectorNode) {
          displayRootNodeId = rootSectorNode.id;
        }
      }
    }
  }

  // Fallback to local static data
  if (!sectorInfo) {
    const s = SECTOR_TRACKS[sectorKey];
    if (!s) return;
    sectorInfo = s;
    // Wrap the flat local `tracks` array into the same shape
    // the recursive renderer expects. Supports nested `children`
    // on any track (e.g. a "stage" containing several courses),
    // matching the same shape Supabase's tree returns.
    function wrapLocalNode(t) {
      return {
        id: t.id,
        title_ar: t.title_ar,
        title_en: t.title_en,
        desc_ar: t.desc_ar,
        desc_en: t.desc_en,
        banner_url: bsPreferWebpAsset(t.banner),
        children_sequential_lock: t.children_sequential_lock || false,
        children: (t.children || []).map(wrapLocalNode)
      };
    }
    tree = s.tracks.map(wrapLocalNode);

    if (s.children_sequential_lock === true) {
      const localRootId = `${sectorKey}-sector-root`;
      tree = [{
        id: localRootId,
        title_ar: s.title_ar,
        title_en: s.title_en,
        desc_ar: s.desc_ar,
        desc_en: s.desc_en,
        banner_url: bsPreferWebpAsset(s.banner_main),
        children_sequential_lock: true,
        children: tree
      }];
      displayRootNodeId = localRootId;
    }
  }

  const title = lang === 'ar' ? sectorInfo.title_ar : sectorInfo.title_en;

  if (sectorInfo.banner_main) {
    bannerImg.src = bsPreferWebpAsset(sectorInfo.banner_main);
    bannerImg.alt = title;
    bannerWrap.style.display = '';
  } else {
    bannerWrap.style.display = 'none';
  }

  numberEl.textContent = sectorInfo.number;
  titleEl.textContent = title;
  descEl.textContent = lang === 'ar' ? sectorInfo.desc_ar : sectorInfo.desc_en;
  if (breadcrumbEl) breadcrumbEl.textContent = title;

  // If a student is logged in, fetch their progress AND any
  // flexible prerequisite links for this sector before rendering.
  let progressMap = {};
  let prerequisiteLinks = [];
  const session = (() => { try { return JSON.parse(sessionStorage.getItem('bs_session') || 'null'); } catch { return null; } })();
  const studentId = session && !session.demo ? session.userId : null;

  if (studentId && typeof bsGetStudentProgressForSector === 'function' && typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured) {
    progressMap = await bsWithTimeout(bsGetStudentProgressForSector(studentId, sectorKey), 2200, {});
    if (typeof bsGetSectorPrerequisites === 'function') {
      prerequisiteLinks = await bsWithTimeout(bsGetSectorPrerequisites(sectorKey), 2200, []);
    }
  }

  if (studentId && typeof bsComputeUnlockedTreeWithPrerequisites === 'function') {
    // A real student is logged in: apply BOTH the sequential lock
    // (sibling-based, opt-in per parent) AND any explicit cross-branch
    // prerequisite links (e.g. "IIoT requires PLC AND SCADA").
    tree = bsComputeUnlockedTreeWithPrerequisites(tree, progressMap, prerequisiteLinks);
  } else {
    // No one logged in (a visitor browsing the curriculum, or
    // demo/preview mode): show everything as unlocked so the
    // full catalog is visible, like a course catalog/brochure.
    const markAllUnlocked = (nodes) => nodes.forEach(n => { n.unlocked = true; n.children && markAllUnlocked(n.children); });
    markAllUnlocked(tree);
  }

  const displayRootNode = displayRootNodeId ? tree.find(node => node.id === displayRootNodeId) : null;
  const renderTree = displayRootNode
    ? [...(displayRootNode.children || []), ...tree.filter(node => node !== displayRootNode)]
    : tree;

  renderStudentPathSummary(renderTree, lang, !!studentId, title, sectorKey);
  renderLockPolicyPanel(renderTree, lang, sectorKey, !!studentId);
  tracksContainer.innerHTML = renderTree.map(node => renderProgramNode(node, lang, 0)).join('');
  setupCourseTools(lang);

  document.title = `${title} | B&S Academy`;
}

function bsWithTimeout(promise, timeoutMs, fallbackValue) {
  let timerId;
  const timeout = new Promise(resolve => {
    timerId = setTimeout(() => resolve(fallbackValue), timeoutMs);
  });
  return Promise.race([promise, timeout])
    .catch(() => fallbackValue)
    .finally(() => clearTimeout(timerId));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function flattenProgramTree(nodes, depth = 0, output = []) {
  (nodes || []).forEach(node => {
    output.push({ node, depth });
    if (node.children && node.children.length) flattenProgramTree(node.children, depth + 1, output);
  });
  return output;
}

function getProgramStatus(node) {
  const progress = Number(node.progress_percent || 0);
  if (node.unlocked === false) return 'locked';
  if (progress >= 100) return 'completed';
  if (progress > 0) return 'in-progress';
  return 'available';
}

function getSectorLockPolicy(sectorKey, lang) {
  const policies = {
    accounting: {
      ar: {
        title: 'Ù†Ø¸Ø§Ù… Ø§Ù„Ù‚ÙÙ„ ÙÙŠ Ù…Ø³Ø§Ø± Ø§Ù„Ù…Ø­Ø§Ø³Ø¨Ø©',
        desc: 'Ø§Ù„Ù‚ÙÙ„ Ù‡Ù†Ø§ Ù…Ø¹Ù…ÙˆÙ„ Ø¹Ø´Ø§Ù† Ø§Ù„Ø·Ø§Ù„Ø¨ ÙŠÙ…Ø´ÙŠ Ù…Ù† Ø§Ù„Ø£Ø³Ø§Ø³ Ø§Ù„Ù…Ø§Ù„ÙŠ Ù„Ø­Ø¯ Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„ØªØ®Ø±Ø¬ Ø¨ØªØ±ØªÙŠØ¨ Ù…Ù†Ø·Ù‚ÙŠ.',
        rules: [
          'Ø§Ù„Ù…Ø±Ø§Ø­Ù„ Ø§Ù„Ø®Ù…Ø³Ø© ØªÙØªØ­ Ø¨Ø§Ù„ØªØªØ§Ø¨Ø¹: Ù„Ø§Ø²Ù… ØªÙ†Ø¬Ø² Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ© Ø¹Ø´Ø§Ù† ØªÙØªØ­ Ø§Ù„Ù„ÙŠ Ø¨Ø¹Ø¯Ù‡Ø§.',
          'Ø§Ù„ÙƒÙˆØ±Ø³Ø§Øª Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ù…ÙØªÙˆØ­Ø© Ù…ØªØ§Ø­Ø© Ù„Ù„Ø·Ø§Ù„Ø¨ØŒ Ù…Ø¹ ØªÙˆØµÙŠØ© Ø¨Ø§Ù„ØªØ±ØªÙŠØ¨ Ø§Ù„Ù…Ù‚ØªØ±Ø­.',
          'Ù„Ùˆ Ø§Ù„Ø·Ø§Ù„Ø¨ Ù…Ø³ØªÙˆØ§Ù‡ Ø£Ø¹Ù„Ù‰ØŒ ÙŠÙ‚Ø¯Ø± ÙŠØ·Ù„Ø¨ Ø§Ø®ØªØ¨Ø§Ø± ØªØ­Ø¯ÙŠØ¯ Ù…Ø³ØªÙˆÙ‰ Ù„ØªØ®Ø·ÙŠ Ù…Ø±Ø­Ù„Ø© Ù…Ù†Ø§Ø³Ø¨Ø©.'
        ]
      },
      en: {
        title: 'Locking system for Accounting',
        desc: 'Locks keep the student moving from the financial foundation to the graduation project in a logical sequence.',
        rules: [
          'The five stages unlock sequentially: complete the current stage to open the next one.',
          'Courses inside an open stage are available, with a recommended order.',
          'Advanced students can request a placement exam to bypass an appropriate stage.'
        ]
      }
    },
    automation: {
      ar: {
        title: 'Ù†Ø¸Ø§Ù… Ø§Ù„Ù‚ÙÙ„ ÙÙŠ Ø§Ù„Ø£ØªÙ…ØªØ© Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ©',
        desc: 'Ù…Ø³Ø§Ø± Ø§Ù„Ø£ØªÙ…ØªØ© ÙŠØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø£Ø³Ø§Ø³ÙŠØ§Øª ØµÙ†Ø§Ø¹ÙŠØ© Ù‚Ø¨Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙÙŠ Ø§Ù„Ø£Ù†Ø¸Ù…Ø© Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø©.',
        rules: [
          'Ø¨Ø¹Ø¶ Ø§Ù„Ø¨Ø±Ø§Ù…Ø¬ Ø§Ù„Ù…ØªÙ‚Ø¯Ù…Ø© ØªØ­ØªØ§Ø¬ Ø¥ÙƒÙ…Ø§Ù„ Ø£ÙƒØ«Ø± Ù…Ù† Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø³Ø§Ø¨Ù‚.',
          'Ù…Ø³Ø§Ø± IIoT Ùˆ Industry 4.0 ÙŠØªÙØªØ­ Ø¨Ø¹Ø¯ Ø¬Ø§Ù‡Ø²ÙŠØ© Ø§Ù„Ø·Ø§Ù„Ø¨ ÙÙŠ PLC ÙˆSCADA ÙˆØ§Ù„Ø¨ÙŠØ§Ù†Ø§Øª.',
          'Ø§Ø®ØªØ¨Ø§Ø± ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…Ø³ØªÙˆÙ‰ Ù…ØªØ§Ø­ Ù„Ù„Ø·Ù„Ø§Ø¨ Ø£ØµØ­Ø§Ø¨ Ø§Ù„Ø®Ø¨Ø±Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ©.'
        ]
      },
      en: {
        title: 'Locking system for Automation',
        desc: 'Automation depends on industrial foundations before moving into advanced systems.',
        rules: [
          'Some advanced programs require more than one prior program.',
          'IIoT & Industry 4.0 opens after readiness in PLC, SCADA, and data foundations.',
          'Placement exams are available for students with practical experience.'
        ]
      }
    },
    default: {
      ar: {
        title: 'Ù†Ø¸Ø§Ù… Ø§Ù„ØªÙ‚Ø¯Ù… ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù‚Ø³Ù…',
        desc: 'Ø§Ù„Ù‚Ø³Ù… Ø­Ø§Ù„ÙŠÙ‹Ø§ Ù…Ø±Ù†ØŒ ÙˆØ§Ù„Ø·Ø§Ù„Ø¨ ÙŠÙ‚Ø¯Ø± ÙŠØ¨Ø¯Ø£ Ù…Ù† Ø£Ù†Ø³Ø¨ Ù†Ù‚Ø·Ø© Ø­Ø³Ø¨ Ù…Ø³ØªÙˆØ§Ù‡ ÙˆØ§Ø­ØªÙŠØ§Ø¬Ù‡.',
        rules: [
          'Ø§Ù„Ø¨Ø±Ø§Ù…Ø¬ ØªØ¸Ù‡Ø± ÙƒØ®Ø±ÙŠØ·Ø© ÙˆØ§Ø¶Ø­Ø© Ø¨Ø¯Ù„ Ù‚Ø§Ø¦Ù…Ø© Ø¹Ø´ÙˆØ§Ø¦ÙŠØ©.',
          'ÙŠÙ…ÙƒÙ† Ø·Ù„Ø¨ ØªÙˆØ¬ÙŠÙ‡ Ù‚Ø¨Ù„ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ù„ØªØ­Ø¯ÙŠØ¯ Ù†Ù‚Ø·Ø© Ø§Ù„Ø¨Ø¯Ø§ÙŠØ©.',
          'ØªÙ‚Ø¯Ù… Ø§Ù„Ø·Ø§Ù„Ø¨ ÙŠÙØ­ÙØ¸ Ø¨Ø¹Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.'
        ]
      },
      en: {
        title: 'Progress system in this sector',
        desc: 'This sector is currently flexible, so students can start from the right point for their level and need.',
        rules: [
          'Programs are shown as a clear pathway instead of a random list.',
          'Students can request guidance before enrollment to choose a starting point.',
          'Progress is saved after login.'
        ]
      }
    }
  };

  const policy = policies[sectorKey] || policies.default;
  return policy[lang] || policy.ar;
}

function renderLockPolicyPanel(tree, lang, sectorKey, hasStudentSession) {
  const panel = document.getElementById('sectorLockPolicyPanel');
  if (!panel) return;

  const policy = getSectorLockPolicy(sectorKey, lang);
  const sequentialGroups = flattenProgramTree(tree).filter(item => item.node.children_sequential_lock === true).length;
  const lockedCount = flattenProgramTree(tree).filter(item => getProgramStatus(item.node) === 'locked').length;
  const copy = lang === 'ar'
    ? {
        label: hasStudentSession ? 'Ù†Ø´Ø· Ø¹Ù„Ù‰ Ø­Ø³Ø§Ø¨Ùƒ' : 'Ø³ÙŠØ¸Ù‡Ø± ÙØ¹Ù„ÙŠÙ‹Ø§ Ø¨Ø¹Ø¯ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„',
        sequential: 'Ù…Ø¬Ù…ÙˆØ¹Ø§Øª Ù…ØªØªØ§Ø¨Ø¹Ø©',
        locked: 'Ù…Ù‚ÙÙˆÙ„ Ø§Ù„Ø¢Ù†'
      }
    : {
        label: hasStudentSession ? 'Active on your account' : 'Applies after login',
        sequential: 'Sequential groups',
        locked: 'Currently locked'
      };

  panel.innerHTML = `
    <div class="lock-policy-copy">
      <span>${copy.label}</span>
      <h3>${escapeHtml(policy.title)}</h3>
      <p>${escapeHtml(policy.desc)}</p>
      <ul>
        ${policy.rules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}
      </ul>
    </div>
    <div class="lock-policy-stats">
      <div><strong>${sequentialGroups}</strong><span>${copy.sequential}</span></div>
      <div><strong>${lockedCount}</strong><span>${copy.locked}</span></div>
    </div>
  `;
}

function getCourseToolsCopy(lang) {
  return lang === 'ar'
    ? {
        title: 'Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø·Ø§Ù„Ø¨',
        search: 'Ø§Ø¨Ø­Ø« Ø¨Ø§Ø³Ù… Ø§Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø£Ùˆ Ø§Ù„Ù…Ù‡Ø§Ø±Ø©...',
        all: 'ÙƒÙ„ Ø§Ù„Ø­Ø§Ù„Ø§Øª',
        available: 'Ø§Ù„Ù…ØªØ§Ø­',
        inProgress: 'Ù‚ÙŠØ¯ Ø§Ù„ØªØ¹Ù„Ù…',
        locked: 'Ø§Ù„Ù…Ù‚ÙÙˆÙ„',
        completed: 'Ø§Ù„Ù…ÙƒØªÙ…Ù„',
        expand: 'ÙØªØ­ ÙƒÙ„ Ø§Ù„ØªÙØ§ØµÙŠÙ„',
        collapse: 'Ø·ÙŠ Ø§Ù„ØªÙØ§ØµÙŠÙ„',
        empty: 'Ù…ÙÙŠØ´ Ø¨Ø±Ø§Ù…Ø¬ Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¨Ø­Ø« Ø£Ùˆ Ø§Ù„ÙÙ„ØªØ± Ø§Ù„Ø­Ø§Ù„ÙŠ.',
        result: count => `${count} Ù†ØªÙŠØ¬Ø© Ø¸Ø§Ù‡Ø±Ø©`
      }
    : {
        title: 'Student tools',
        search: 'Search by program or skill...',
        all: 'All statuses',
        available: 'Available',
        inProgress: 'In progress',
        locked: 'Locked',
        completed: 'Completed',
        expand: 'Expand details',
        collapse: 'Collapse details',
        empty: 'No programs match the current search or filter.',
        result: count => `${count} result${count === 1 ? '' : 's'} shown`
      };
}

function inferProgramMeta(node, lang, depth, hasChildren, status) {
  const title = `${node.title_ar || ''} ${node.title_en || ''}`.toLowerCase();
  const isStage = hasChildren || node.node_type === 'stage' || title.includes('stage') || title.includes('Ù…Ø±Ø­Ù„Ø©') || title.includes('Ø§Ù„Ù…Ø±Ø­Ù„Ø©');
  const sector = node.sector_key || '';

  const level = (() => {
    if (isStage) return lang === 'ar' ? 'Ù…Ø±Ø­Ù„Ø© ØªØ¹Ù„ÙŠÙ…ÙŠØ©' : 'Learning stage';
    if (title.includes('advanced') || title.includes('master') || title.includes('Ø§Ø­ØªØ±Ø§Ù') || title.includes('Ù…ØªÙ‚Ø¯Ù…')) {
      return lang === 'ar' ? 'Ù…ØªÙ‚Ø¯Ù…' : 'Advanced';
    }
    if (title.includes('essential') || title.includes('foundation') || title.includes('beginners') || title.includes('Ø£Ø³Ø§Ø³') || title.includes('Ù…Ø¨ØªØ¯Ø¦')) {
      return lang === 'ar' ? 'ØªØ£Ø³ÙŠØ³ÙŠ' : 'Foundation';
    }
    return lang === 'ar' ? 'Ù…ØªÙˆØ³Ø·' : 'Intermediate';
  })();

  const duration = (() => {
    if (isStage) {
      const childCount = (node.children || []).length;
      return lang === 'ar' ? `${Math.max(childCount, 1)} Ø¨Ø±Ø§Ù…Ø¬` : `${Math.max(childCount, 1)} programs`;
    }
    if (sector === 'academic') return lang === 'ar' ? 'Ø­Ø³Ø¨ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹' : 'Project-based';
    if (sector === 'kids') return lang === 'ar' ? 'Ù…Ø³Ø§Ø± Ù…Ø±Ù†' : 'Flexible path';
    return lang === 'ar' ? '4 - 8 Ø¬Ù„Ø³Ø§Øª' : '4 - 8 sessions';
  })();

  const format = (() => {
    if (isStage) return lang === 'ar' ? 'Ù…Ø³Ø§Ø± Ù…Ø±ØªØ¨' : 'Sequenced path';
    if (sector === 'academic') return lang === 'ar' ? 'Ø¥Ø´Ø±Ø§Ù ÙˆÙ…ØªØ§Ø¨Ø¹Ø©' : 'Mentorship';
    return lang === 'ar' ? 'Ø¹Ù…Ù„ÙŠ + Ù…Ù„ÙØ§Øª' : 'Hands-on + files';
  })();

  const outcomes = (() => {
    if (isStage) {
      return lang === 'ar'
        ? ['ÙÙ‡Ù… ØªØ±ØªÙŠØ¨ Ø§Ù„Ù…Ø±Ø­Ù„Ø©', 'ÙØªØ­ Ø§Ù„Ø¨Ø±Ø§Ù…Ø¬ Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù…Ø³ØªÙˆØ§Ùƒ', 'Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù„Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„ØªØ§Ù„ÙŠØ© Ø¹Ù†Ø¯ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²']
        : ['Understand the stage sequence', 'Open the right programs for your level', 'Move forward after completion'];
    }
    if (title.includes('excel') || title.includes('power bi') || title.includes('pivot') || title.includes('Ø¥ÙƒØ³ÙŠÙ„')) {
      return lang === 'ar'
        ? ['ØªÙ†Ø¸ÙŠÙ… ÙˆØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª', 'Ø¨Ù†Ø§Ø¡ ØªÙ‚Ø§Ø±ÙŠØ± ÙˆÙ„ÙˆØ­Ø§Øª Ù…ØªØ§Ø¨Ø¹Ø©', 'ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù…Ù„ÙŠ Ø¹Ù„Ù‰ Ù…Ù„ÙØ§Øª Ù…Ø§Ù„ÙŠØ©']
        : ['Organize and analyze data', 'Build reports and dashboards', 'Practice on financial files'];
    }
    if (title.includes('sql') || title.includes('database') || title.includes('erp') || title.includes('Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª')) {
      return lang === 'ar'
        ? ['ÙÙ‡Ù… Ø¨Ù†ÙŠØ© Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª', 'ÙƒØªØ§Ø¨Ø© Ø§Ø³ØªØ¹Ù„Ø§Ù…Ø§Øª Ø¹Ù…Ù„ÙŠØ©', 'Ø±Ø¨Ø· Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±']
        : ['Understand database structure', 'Write practical queries', 'Connect data to reports'];
    }
    if (title.includes('ai') || title.includes('chatgpt') || title.includes('copilot') || title.includes('python') || title.includes('Ø°ÙƒØ§Ø¡')) {
      return lang === 'ar'
        ? ['Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø¨ÙˆØ¹ÙŠ', 'Ø£ØªÙ…ØªØ© Ù…Ù‡Ø§Ù… Ù…ØªÙƒØ±Ø±Ø©', 'ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¥Ù„Ù‰ Ù‚Ø±Ø§Ø±Ø§Øª']
        : ['Use AI tools responsibly', 'Automate repetitive work', 'Turn data into decisions'];
    }
    if (sector === 'automation') {
      return lang === 'ar'
        ? ['ÙÙ‡Ù… Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„ØµÙ†Ø§Ø¹ÙŠ Ø¹Ù…Ù„ÙŠÙ‹Ø§', 'ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù„Ù‰ Ø³ÙŠÙ†Ø§Ø±ÙŠÙˆÙ‡Ø§Øª ØªØ´ØºÙŠÙ„', 'ØªØ¬Ù‡ÙŠØ²Ùƒ Ù„Ø³ÙˆÙ‚ Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„ØµÙ†Ø§Ø¹ÙŠ']
        : ['Understand industrial systems practically', 'Practice operating scenarios', 'Prepare for industrial work'];
    }
    if (sector === 'academic') {
      return lang === 'ar'
        ? ['Ø®Ø·Ø© ØªÙ†ÙÙŠØ° ÙˆØ§Ø¶Ø­Ø©', 'ØªÙˆØ«ÙŠÙ‚ ÙˆØ´Ø±Ø­ Ø§Ø­ØªØ±Ø§ÙÙŠ', 'Ø§Ø³ØªØ¹Ø¯Ø§Ø¯ Ù„Ù„Ù…Ù†Ø§Ù‚Ø´Ø© Ø£Ùˆ Ø§Ù„Ø¹Ø±Ø¶']
        : ['Clear execution plan', 'Professional documentation', 'Defense or presentation readiness'];
    }
    if (sector === 'kids') {
      return lang === 'ar'
        ? ['ØªØ¹Ù„Ù… Ù…Ù…ØªØ¹ ÙˆØªÙØ§Ø¹Ù„ÙŠ', 'Ù…Ø´Ø±ÙˆØ¹ ØµØºÙŠØ± ÙÙŠ ÙƒÙ„ Ù…Ø±Ø­Ù„Ø©', 'Ø¨Ù†Ø§Ø¡ Ø«Ù‚Ø© Ø§Ù„Ø·ÙÙ„ Ù…Ø¹ Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§']
        : ['Fun interactive learning', 'A small project each stage', 'Build confidence with technology'];
    }
    return lang === 'ar'
      ? ['ÙÙ‡Ù… Ø§Ù„ÙÙƒØ±Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©', 'ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù…Ù„ÙŠ Ø®Ø·ÙˆØ© Ø¨Ø®Ø·ÙˆØ©', 'ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ù„ØªØ§Ù„ÙŠØ©']
      : ['Understand the core idea', 'Practice step by step', 'Identify the next step'];
  })();

  const lockHint = status === 'locked'
    ? (lang === 'ar'
        ? 'Ø§ÙØªØ­Ù‡ Ø¨Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ Ù‚Ø¨Ù„Ù‡ Ø£Ùˆ Ø§Ø·Ù„Ø¨ Ø§Ø®ØªØ¨Ø§Ø± ØªØ­Ø¯ÙŠØ¯ Ù…Ø³ØªÙˆÙ‰.'
        : 'Unlock it by completing the requirement before it or requesting a placement exam.')
    : (lang === 'ar'
        ? 'Ù…ØªØ§Ø­ Ù„Ùƒ Ø§Ù„Ø¢Ù†ØŒ ÙˆÙŠÙ…ÙƒÙ†Ùƒ Ø·Ù„Ø¨ ØªÙˆØ¬ÙŠÙ‡ Ù‚Ø¨Ù„ Ø§Ù„Ø¨Ø¯Ø¡.'
        : 'Available now. You can request guidance before starting.');

  return { level, duration, format, outcomes, lockHint, isStage };
}

function setupCourseTools(lang) {
  const tools = document.getElementById('sectorCourseTools');
  const tracksContainer = document.getElementById('sectorDetailTracks');
  if (!tools || !tracksContainer) return;

  const copy = getCourseToolsCopy(lang);
  tools.innerHTML = `
    <div class="course-tools-title">${copy.title}</div>
    <div class="course-tools-controls">
      <input type="search" class="course-search-input" id="courseSearchInput" placeholder="${copy.search}">
      <select class="course-status-filter" id="courseStatusFilter" aria-label="${copy.all}">
        <option value="all">${copy.all}</option>
        <option value="available">${copy.available}</option>
        <option value="in-progress">${copy.inProgress}</option>
        <option value="locked">${copy.locked}</option>
        <option value="completed">${copy.completed}</option>
      </select>
      <button type="button" class="course-view-toggle" id="courseViewToggle" data-expanded="true">${copy.collapse}</button>
    </div>
    <div class="course-tools-meta">
      <span id="courseFilterResult">${copy.result(tracksContainer.querySelectorAll('.track-card').length)}</span>
      <span class="course-filter-empty" id="courseFilterEmpty" hidden>${copy.empty}</span>
    </div>
  `;

  const searchInput = tools.querySelector('#courseSearchInput');
  const statusFilter = tools.querySelector('#courseStatusFilter');
  const viewToggle = tools.querySelector('#courseViewToggle');
  const resultEl = tools.querySelector('#courseFilterResult');
  const emptyEl = tools.querySelector('#courseFilterEmpty');

  const applyFilters = () => {
    const query = (searchInput.value || '').trim().toLowerCase();
    const status = statusFilter.value;

    function filterCard(card) {
      const ownMatchesText = !query || (card.dataset.search || '').includes(query);
      const ownMatchesStatus = status === 'all' || card.dataset.status === status;
      let childVisible = false;

      card.querySelectorAll(':scope > .track-card-body > .track-card-children > .track-card').forEach(child => {
        if (filterCard(child)) childVisible = true;
      });

      const isVisible = (ownMatchesText && ownMatchesStatus) || childVisible;
      card.hidden = !isVisible;
      return isVisible;
    }

    let visibleCount = 0;
    tracksContainer.querySelectorAll(':scope > .track-card').forEach(card => {
      if (filterCard(card)) visibleCount += card.querySelectorAll('.track-card:not([hidden])').length || 1;
    });

    resultEl.textContent = copy.result(visibleCount);
    emptyEl.hidden = visibleCount !== 0;
  };

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  viewToggle.addEventListener('click', () => {
    const expanded = viewToggle.dataset.expanded === 'true';
    tracksContainer.classList.toggle('courses-compact', expanded);
    viewToggle.dataset.expanded = expanded ? 'false' : 'true';
    viewToggle.textContent = expanded ? copy.expand : copy.collapse;
  });

  applyFilters();
}

function renderStudentPathSummary(tree, lang, hasStudentSession, sectorTitle) {
  const panel = document.getElementById('sectorStudentPathPanel');
  if (!panel) return;

  const flat = flattenProgramTree(tree).filter(item => item.depth > 0 || !(item.node.children && item.node.children.length));
  const total = flat.length;
  const completed = flat.filter(item => getProgramStatus(item.node) === 'completed').length;
  const inProgress = flat.filter(item => getProgramStatus(item.node) === 'in-progress').length;
  const locked = flat.filter(item => getProgramStatus(item.node) === 'locked').length;
  const available = flat.filter(item => getProgramStatus(item.node) === 'available').length;
  const nextItem = flat.find(item => ['in-progress', 'available'].includes(getProgramStatus(item.node)));
  const nextTitle = nextItem
    ? (lang === 'ar' ? nextItem.node.title_ar : nextItem.node.title_en)
    : (lang === 'ar' ? 'ÙƒÙ„ Ø§Ù„Ø¨Ø±Ø§Ù…Ø¬ Ø§Ù„Ù…ØªØ§Ø­Ø© Ù…ÙƒØªÙ…Ù„Ø©' : 'All available programs are complete');
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const copy = lang === 'ar'
    ? {
        eyebrow: hasStudentSession ? 'Ø±Ø­Ù„ØªÙƒ Ø¯Ø§Ø®Ù„ Ù‡Ø°Ø§ Ø§Ù„Ù‚Ø³Ù…' : 'Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ù‚Ø³Ù… Ù„Ù„Ø·Ø§Ù„Ø¨',
        title: hasStudentSession ? `ØªÙ‚Ø¯Ù…Ùƒ ÙÙŠ ${sectorTitle}` : `Ø§ÙƒØªØ´Ù ØªØ±ØªÙŠØ¨ ${sectorTitle}`,
        desc: hasStudentSession
          ? 'Ø§Ù„Ù‚ÙÙ„ Ù‡Ù†Ø§ Ù…Ø´ Ø¹Ù‚ÙˆØ¨Ø©Ø› Ù‡Ùˆ ØªØ±ØªÙŠØ¨ Ø°ÙƒÙŠ ÙŠÙØªØ­ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„ØªØ§Ù„ÙŠØ© Ù„Ù…Ø§ ØªØ®Ù„Øµ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ Ø£Ùˆ ØªØ¬ØªØ§Ø² Ø§Ø®ØªØ¨Ø§Ø± ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…Ø³ØªÙˆÙ‰.'
          : 'Ø³Ø¬Ù„ Ø¯Ø®ÙˆÙ„Ùƒ Ø¹Ø´Ø§Ù† ØªØ´ÙˆÙ ØªÙ‚Ø¯Ù…Ùƒ Ø§Ù„Ø­Ù‚ÙŠÙ‚ÙŠØŒ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ù…ÙØªÙˆØ­Ø©ØŒ ÙˆØ§Ù„Ø¨Ø±Ø§Ù…Ø¬ Ø§Ù„Ù…Ù‚ÙÙˆÙ„Ø© Ø­Ø³Ø¨ Ù…Ø³ØªÙˆØ§Ùƒ.',
        total: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø¨Ø±Ø§Ù…Ø¬',
        available: 'Ù…ØªØ§Ø­ Ø§Ù„Ø¢Ù†',
        progress: 'Ù‚ÙŠØ¯ Ø§Ù„ØªØ¹Ù„Ù…',
        locked: 'Ù…Ù‚ÙÙˆÙ„ Ù…Ø¤Ù‚ØªÙ‹Ø§',
        completed: 'Ù…ÙƒØªÙ…Ù„',
        next: 'Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ù„ØªØ§Ù„ÙŠØ©',
        login: 'Ø¯Ø®ÙˆÙ„ / Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨',
        request: 'Ø§Ø·Ù„Ø¨ ØªÙˆØ¬ÙŠÙ‡'
      }
    : {
        eyebrow: hasStudentSession ? 'Your journey in this sector' : 'Student pathway map',
        title: hasStudentSession ? `Your progress in ${sectorTitle}` : `Explore the ${sectorTitle} sequence`,
        desc: hasStudentSession
          ? 'Locks are a smart learning sequence: the next stage opens when you finish the required work or pass a placement exam.'
          : 'Log in to see your real progress, open stages, and locked programs based on your level.',
        total: 'Total programs',
        available: 'Available now',
        progress: 'In progress',
        locked: 'Temporarily locked',
        completed: 'Completed',
        next: 'Next step',
        login: 'Log in / Sign up',
        request: 'Request guidance'
      };

  panel.innerHTML = `
    <div class="student-path-copy">
      <span class="student-path-eyebrow">${copy.eyebrow}</span>
      <h2>${escapeHtml(copy.title)}</h2>
      <p>${copy.desc}</p>
      <div class="student-path-next">
        <span>${copy.next}</span>
        <strong>${escapeHtml(nextTitle)}</strong>
      </div>
      <div class="student-path-actions">
        <a href="auth.html" class="student-path-action primary">${copy.login}</a>
        <a href="#ondemand" class="student-path-action">${copy.request}</a>
      </div>
    </div>
    <div class="student-path-meter" aria-label="${copy.completed}: ${percent}%">
      <div class="student-path-ring" style="--path-progress:${percent}%;">
        <span>${percent}%</span>
      </div>
      <div class="student-path-stats">
        <div><strong>${total}</strong><span>${copy.total}</span></div>
        <div><strong>${available}</strong><span>${copy.available}</span></div>
        <div><strong>${inProgress}</strong><span>${copy.progress}</span></div>
        <div><strong>${locked}</strong><span>${copy.locked}</span></div>
        <div><strong>${completed}</strong><span>${copy.completed}</span></div>
      </div>
    </div>
  `;
}

/* ============================================
   Recursive node renderer â€” draws ONE program
   card, then (if it has children) draws them
   nested inside it, to any depth. This single
   function is what gives the system unlimited
   nesting without any extra code per level.
   ============================================ */
function renderProgramNode(node, lang, depth) {
  const title = escapeHtml(lang === 'ar' ? node.title_ar : node.title_en);
  const desc = escapeHtml(lang === 'ar' ? node.desc_ar : node.desc_en);
  const banner = bsPreferWebpAsset(node.banner_url || node.banner); // supports both DB field name and local fallback shape
  const hasChildren = node.children && node.children.length > 0;

  // unlocked defaults to true when the lock system hasn't run
  // (e.g. a visitor with no account browsing the curriculum)
  const isLocked = node.unlocked === false;
  const progress = node.progress_percent || 0;
  const showBypassBtn = node.has_bypass_exam && isLocked;
  const hasPrereqs = node.prerequisite_ids && node.prerequisite_ids.length > 0;
  const status = getProgramStatus(node);
  const statusLabels = lang === 'ar'
    ? { locked: 'Ù…Ù‚ÙÙˆÙ„', available: 'Ù…ØªØ§Ø­', 'in-progress': 'Ù‚ÙŠØ¯ Ø§Ù„ØªØ¹Ù„Ù…', completed: 'Ù…ÙƒØªÙ…Ù„' }
    : { locked: 'Locked', available: 'Available', 'in-progress': 'In progress', completed: 'Completed' };
  const lockedNote = lang === 'ar'
    ? (hasPrereqs
        ? `ÙŠØªØ·Ù„Ø¨ Ø¥ÙƒÙ…Ø§Ù„ ${node.prerequisite_ids.length} ${node.prerequisite_ids.length === 1 ? 'Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø³Ø§Ø¨Ù‚' : 'Ø¨Ø±Ø§Ù…Ø¬ Ø³Ø§Ø¨Ù‚Ø©'}`
        : 'Ø§ÙƒÙ…Ù„ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© Ø£Ùˆ Ø§Ø·Ù„Ø¨ Ø§Ø®ØªØ¨Ø§Ø± ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…Ø³ØªÙˆÙ‰ Ù„ÙØªØ­ Ù‡Ø°Ø§ Ø§Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬')
    : (hasPrereqs
        ? `Requires completing ${node.prerequisite_ids.length} prior program${node.prerequisite_ids.length > 1 ? 's' : ''}`
        : 'Complete the previous stage or request a placement exam to unlock this program');
  const searchableText = [
    node.title_ar,
    node.title_en,
    node.desc_ar,
    node.desc_en,
    statusLabels[status]
  ].filter(Boolean).join(' ').toLowerCase();
  const meta = inferProgramMeta(node, lang, depth, hasChildren, status);
  const detailsId = `details-${String(node.id || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  return `
    <div class="track-card ${hasChildren ? 'track-card-has-children' : ''} depth-${depth} track-card-${status} ${isLocked ? 'track-card-locked' : ''}" data-track-id="${escapeHtml(node.id)}" data-status="${status}" data-search="${escapeHtml(searchableText)}">
      ${banner ? `
        <div class="track-card-banner">
          <img src="${escapeHtml(banner)}" alt="${title}" loading="lazy">
          ${isLocked ? `<div class="track-card-lock-overlay"><span>${statusLabels.locked}</span></div>` : ''}
        </div>
      ` : ''}
      <div class="track-card-body">
        <div class="track-card-title-row">
          <h4 class="track-card-title">${title}</h4>
          <span class="track-status-badge track-status-${status}">${statusLabels[status]}</span>
        </div>
        <div class="program-quick-meta">
          <span>${meta.level}</span>
          <span>${meta.duration}</span>
          <span>${meta.format}</span>
        </div>
        ${desc ? `<p class="track-card-desc">${desc}</p>` : ''}
        ${isLocked ? `
          <p class="prereq-note">${lockedNote}</p>
        ` : ''}
        ${!isLocked ? `
          <div class="program-card-meta">
            <span>${lang === 'ar' ? 'Ø§Ù„ØªÙ‚Ø¯Ù…' : 'Progress'}</span>
            <strong>${progress}%</strong>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width:${progress}%"></div>
          </div>
        ` : ''}
        ${showBypassBtn ? `
          <button class="btn-bypass-exam" data-program-id="${escapeHtml(node.id)}">
            ${lang === 'ar' ? 'Ø§Ø®ØªØ¨Ø§Ø± ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…Ø³ØªÙˆÙ‰ / ØªØ®Ø·ÙŠ' : 'Placement / Bypass Exam'}
          </button>
        ` : ''}
        <details class="program-details" id="${escapeHtml(detailsId)}">
          <summary>${lang === 'ar' ? 'ØªÙØ§ØµÙŠÙ„ ØªØ³Ø§Ø¹Ø¯Ùƒ ØªØ¨Ø¯Ø£' : 'Details to help you start'}</summary>
          <div class="program-details-body">
            <p>${meta.lockHint}</p>
            <ul>
              ${meta.outcomes.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
            <div class="program-actions">
              <a href="#ondemand" class="program-action primary">${lang === 'ar' ? 'Ø§Ø·Ù„Ø¨ ØªØ³Ø¬ÙŠÙ„ / ØªÙˆØ¬ÙŠÙ‡' : 'Request enrollment / guidance'}</a>
              <a href="auth.html" class="program-action">${lang === 'ar' ? 'Ø§Ø­ÙØ¸ ØªÙ‚Ø¯Ù…ÙŠ' : 'Save my progress'}</a>
            </div>
          </div>
        </details>
        ${hasChildren ? `
          <div class="track-card-children">
            ${node.children.map(child => renderProgramNode(child, lang, depth + 1)).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/* ============================================
   Legacy renderer kept for any [data-tracks-sector]
   container still in use elsewhere (back-compat).
   ============================================ */
function renderSectorTracks() {
  document.querySelectorAll('[data-tracks-sector]').forEach(container => {
    const sectorKey = container.getAttribute('data-tracks-sector');
    const sectorData = SECTOR_TRACKS[sectorKey];
    if (!sectorData) return;

    const lang = currentLang || 'ar';

    container.innerHTML = sectorData.tracks.map(track => `
      <div class="track-card reveal" data-track-id="${track.id}">
        ${track.banner ? `
          <div class="track-card-banner">
            <img src="${track.banner}" alt="${lang === 'ar' ? track.title_ar : track.title_en}" loading="lazy">
          </div>
        ` : ''}
        <div class="track-card-body">
          <h4 class="track-card-title">${lang === 'ar' ? track.title_ar : track.title_en}</h4>
          ${(lang === 'ar' ? track.desc_ar : track.desc_en) ? `<p class="track-card-desc">${lang === 'ar' ? track.desc_ar : track.desc_en}</p>` : ''}
        </div>
      </div>
    `).join('');
  });
}

// Re-render overview cards on load + whenever language toggles
document.addEventListener('DOMContentLoaded', () => {
  renderSectorOverviewCards();
  renderSectorTracks();

  document.querySelectorAll('#langToggle, #langToggleSector').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        renderSectorOverviewCards();
        renderSectorTracks();
        // If currently viewing a sector detail page, re-render it in the new language
        const activeSectorKey = document.getElementById('page-sector-detail')?.dataset.currentSector;
        if (activeSectorKey) renderSectorDetailPage(activeSectorKey);
      }, 0);
    });
  });
});
