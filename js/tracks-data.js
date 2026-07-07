/* ============================================
   B&S Academy — Sector Tracks Data
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
   - banner: path to this track's image (optional — if
     omitted, the card shows without an image)
   - icon: an inline SVG path string (optional decorative icon)
   ============================================ */

const SECTOR_TRACKS = {

  engineering: {
    number: "01 / ENGINEERING SCIENCES",
    banner_main: null, // add images/banner-engineering-main.jpg when ready
    title_ar: "العلوم الهندسية",
    title_en: "Engineering Sciences",
    desc_ar: "الأساس النظري والرياضي الصلب اللي يبني عقلية المهندس، قبل ما ينتقل للتطبيق العملي في عالم الصناعة.",
    desc_en: "The solid theoretical and mathematical foundation that builds an engineer's mindset, before moving to real industrial application.",
    tracks: [
      {
        id: "eng-power-systems",
        title_ar: "أنظمة القوى الكهربية",
        title_en: "Power Systems",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "eng-power-electronics",
        title_ar: "الإلكترونيات الصناعية",
        title_en: "Power Electronics",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "eng-circuits",
        title_ar: "الدوائر الكهربية",
        title_en: "Circuits",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "eng-math",
        title_ar: "الرياضيات الهندسية",
        title_en: "Engineering Mathematics",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "eng-matlab",
        title_ar: "نمذجة MATLAB",
        title_en: "MATLAB Modeling",
        desc_ar: "",
        desc_en: "",
        banner: null
      }
    ]
  },

  // ---------------------------------------------
  // Industrial Automation sector — INDEPENDENT from
  // Engineering Sciences per the academy's decision.
  // This is the first sector to use the flexible
  // prerequisites system (see js/supabase-config.js
  // bsComputeUnlockedTreeWithPrerequisites): "IIoT"
  // requires BOTH "Advanced PLC Programming" and
  // "Complete SCADA Mastery" — not just the sibling
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
    title_ar: "مسار الأتمتة الصناعية وأنظمة التحكم",
    title_en: "Industrial Automation & Control Systems",
    desc_ar: "من التحكم الكلاسيكي إلى الثورة الصناعية الرابعة — رحلة كاملة لقيادة أضخم العمليات الصناعية بثقة.",
    desc_en: "From classic control to Industry 4.0 — a complete journey to confidently lead massive industrial operations.",
    tracks: [
      {
        id: "auto-classic-control",
        title_ar: "التحكم الكلاسيكي ومحركات الدفع",
        title_en: "Classic Control & Motor Drives",
        desc_ar: "المخططات الكهربائية، تصميم اللوحات، الكونتاكتورات، وطرق بدء المحركات",
        desc_en: "Electrical diagrams, panel design, contactors, and motor starting methods",
        banner: null
      },
      {
        id: "auto-instrumentation",
        title_ar: "أجهزة القياس والتحكم الصناعي",
        title_en: "Industrial Instrumentation",
        desc_ar: "معايرة حساسات الضغط والحرارة والتدفق، والتعامل مع الإشارات التناظرية والرقمية",
        desc_en: "Calibrating pressure, temperature, and flow sensors; analog/digital signal handling",
        banner: null
      },
      {
        id: "auto-plc-advanced",
        title_ar: "برمجة الـ PLC المتقدم",
        title_en: "Advanced PLC Programming",
        desc_ar: "لغة السلم (Ladder Logic)، بيئة TIA Portal، العمليات التتابعية",
        desc_en: "Ladder Logic, TIA Portal environment, sequential operations",
        banner: null
      },
      {
        id: "auto-hmi-design",
        title_ar: "تصميم واجهات المستخدم HMI",
        title_en: "HMI Design",
        desc_ar: "تصميم الشاشات التفاعلية وربطها بالـ PLC",
        desc_en: "Designing interactive screens and linking them to PLCs",
        banner: null
      },
      {
        id: "auto-scada-mastery",
        title_ar: "احتراف أنظمة SCADA",
        title_en: "Complete SCADA Mastery",
        desc_ar: "ربط خطوط الإنتاج، إدارة الإنذارات، والأرشفة الأولية",
        desc_en: "Connecting production lines, alarm management, and initial archiving",
        banner: null
      },
      {
        id: "auto-aveva-pi",
        title_ar: "التحكم المؤسسي وإدارة البيانات",
        title_en: "AVEVA & PI System Mastery",
        desc_ar: "",
        desc_en: "",
        banner: null,
        children: [
          {
            id: "auto-aveva-intouch",
            title_ar: "تصميم واجهات المراقبة التقليدية",
            title_en: "AVEVA InTouch HMI",
            desc_ar: "",
            desc_en: "",
            banner: null
          },
          {
            id: "auto-aveva-system-platform",
            title_ar: "منصة النظام",
            title_en: "AVEVA System Platform",
            desc_ar: "",
            desc_en: "",
            banner: null,
            children: [
              {
                id: "auto-application-server",
                title_ar: "خادم التطبيقات",
                title_en: "Application Server",
                desc_ar: "",
                desc_en: "",
                banner: null
              },
              {
                id: "auto-omi",
                title_ar: "واجهات التشغيل الرقمية",
                title_en: "OMI - Operations Management Interface",
                desc_ar: "",
                desc_en: "",
                banner: null
              }
            ]
          },
          {
            id: "auto-aveva-historian",
            title_ar: "الأرشفة المحلية للعمليات",
            title_en: "AVEVA Historian",
            desc_ar: "",
            desc_en: "",
            banner: null
          },
          {
            id: "auto-aveva-pi-system",
            title_ar: "إدارة البيانات المؤسسية وتحليلها",
            title_en: "AVEVA PI System",
            desc_ar: "",
            desc_en: "",
            banner: null
          }
        ]
      },
      {
        id: "auto-iiot",
        title_ar: "إنترنت الأشياء الصناعي والثورة الصناعية الرابعة",
        title_en: "IIoT & Industry 4.0",
        desc_ar: "🔒 يتطلب اجتياز برامج PLC المتقدم و SCADA أولاً — ربط أرض المصنع بالأنظمة السحابية وتحليل البيانات الذكية",
        desc_en: "🔒 Requires completing Advanced PLC and SCADA first — connecting the factory floor to cloud systems and smart data analysis",
        banner: null,
        children: [
          {
            id: "auto-iiot-networking",
            title_ar: "الشبكات الصناعية وحوسبة الحافة",
            title_en: "Industrial Networking & Edge Computing",
            desc_ar: "بروتوكولات OPC UA, MQTT، بوابات الحافة، وبرمجة Node-RED",
            desc_en: "OPC UA, MQTT protocols, Edge Gateways, and Node-RED programming",
            banner: null
          },
          {
            id: "auto-iiot-cloud",
            title_ar: "المنصات السحابية ولوحات القياس",
            title_en: "Cloud IoT & Dashboards",
            desc_ar: "ربط بيانات المصنع بـ AWS IoT أو Azure، ولوحات مراقبة باستخدام Grafana",
            desc_en: "Connecting factory data to AWS IoT or Azure, and Grafana dashboards",
            banner: null
          },
          {
            id: "auto-iiot-smart-manufacturing",
            title_ar: "التصنيع الذكي والتوأم الرقمي",
            title_en: "Smart Manufacturing & Digital Twin",
            desc_ar: "الذكاء الاصطناعي على البيانات الصناعية، الصيانة التنبؤية، ومفاهيم التوأم الرقمي",
            desc_en: "AI on industrial data, predictive maintenance, and Digital Twin concepts",
            banner: null
          }
        ]
      }
    ]
  },

  accounting: {
    number: "02 / SMART ACCOUNTING & FINTECH",
    banner_main: "images/banner-accounting-main.jpg",
    title_ar: "المحاسبة الذكية والتكنولوجيا المالية",
    title_en: "Smart Accounting & FinTech",
    desc_ar: "نعيد صياغة مفهوم المحاسبة لنصنع \"المحلل المالي الذكي\". من أساسيات الدفاتر وحتى أتمتة المهام وبناء لوحات التحكم التفاعلية.",
    desc_en: "Reshaping accounting to build the \"Smart Financial Analyst.\" From bookkeeping basics to task automation and interactive dashboards.",
    children_sequential_lock: true, // the 5 stages build on each other
    tracks: [
      {
        id: "acc-stage-0",
        title_ar: "المرحلة الصفرية: الأساس المالي",
        title_en: "Stage 0: The Foundation",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-stage0.jpg",
        children: [
          { id: "acc-practical", title_ar: "المحاسبة العملية", title_en: "Practical Accounting", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-statistics", title_ar: "الإحصاء للماليين", title_en: "Statistics for Finance", desc_ar: "", desc_en: "", banner: null }
        ]
      },
      {
        id: "acc-stage-1",
        title_ar: "المرحلة الأولى: احتراف الإكسيل و Power BI",
        title_en: "Stage 1: Excel & Power BI Mastery",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-stage1.jpg",
        children: [
          { id: "acc-excel-essential", title_ar: "Excel Essential Training", title_en: "Excel Essential Training", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-excel-formulas", title_ar: "احتراف الصيغ والدوال في الإكسيل", title_en: "Mastering Excel Formulas and Functions", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-pivot-tables", title_ar: "تحليل البيانات باستخدام Pivot Tables", title_en: "Data Analysis using Pivot Tables", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-power-query", title_ar: "Power Query in Excel", title_en: "Power Query in Excel", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-what-if", title_ar: "What If Analysis in Excel", title_en: "What If Analysis in Excel", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-dashboard-bootcamp", title_ar: "Excel Dashboard Bootcamp", title_en: "Excel Dashboard Bootcamp: Build Interactive Reports", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-power-pivot", title_ar: "Power Pivot Masterclass", title_en: "Power Pivot Masterclass", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-tips-tricks", title_ar: "نصائح وحيل سريعة في الإكسيل", title_en: "Short Tips & Tricks (Excel)", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-powerbi-masterclass", title_ar: "Power BI Masterclass", title_en: "Power BI Masterclass", desc_ar: "", desc_en: "", banner: null }
        ]
      },
      {
        id: "acc-stage-2",
        title_ar: "المرحلة الثانية: إدارة قواعد البيانات السحابية",
        title_en: "Stage 2: Cloud & Databases",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-stage2.jpg",
        children: [
          { id: "acc-google-sheets", title_ar: "استخدام Google Sheets للتعاون المالي السحابي", title_en: "Google Sheets for Cloud Financial Collaboration", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-sql-erp", title_ar: "قواعد البيانات وأنظمة ERP باستخدام SQL", title_en: "Databases & ERP Systems using SQL", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-tableau", title_ar: "استخدام Tableau لعرض البيانات المتقدم", title_en: "Tableau for Advanced Data Visualization", desc_ar: "", desc_en: "", banner: null }
        ]
      },
      {
        id: "acc-stage-3",
        title_ar: "المرحلة الثالثة: احتراف الذكاء الاصطناعي والأتمتة المالية",
        title_en: "Stage 3: AI & Financial Automation",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-stage3.jpg",
        children: [
          { id: "acc-chatgpt-excel", title_ar: "ChatGPT & AI for Microsoft Excel", title_en: "ChatGPT & AI for Microsoft Excel", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-copilot-excel", title_ar: "احتراف Microsoft Copilot في الإكسيل", title_en: "AI-Driven Excel: Mastering Microsoft Copilot", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-copilot-formulas", title_ar: "الصيغ والدوال باستخدام Copilot", title_en: "Formulas and Functions using Copilot", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-python-beginners", title_ar: "Python for Beginners", title_en: "Python for Beginners", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-python-data", title_ar: "تحليل البيانات المالية الضخمة بالبايثون", title_en: "Data Analysis using Python", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-power-automate", title_ar: "Power Apps & Power Automate Bootcamp", title_en: "Power Apps & Power Automate Bootcamp", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-n8n-agents", title_ar: "بناء وكلاء وأتمتة بالذكاء الاصطناعي عبر N8N", title_en: "AI Agents & Automations using N8N", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-generative-ai", title_ar: "احتراف الذكاء الاصطناعي التوليدي", title_en: "Generative AI Mastery", desc_ar: "", desc_en: "", banner: null },
          { id: "acc-prompt-engineering", title_ar: "Prompt Engineering & Vibe Coding", title_en: "Prompt Engineering & Vibe Coding", desc_ar: "", desc_en: "", banner: null }
        ]
      },
      {
        id: "acc-stage-final",
        title_ar: "المرحلة النهائية: مشروع التخرج",
        title_en: "Final Stage: Graduation Project",
        desc_ar: "", desc_en: "", banner: "images/banner-accounting-final.jpg",
        children: [
          { id: "acc-graduation-project", title_ar: "محاكاة شركة حقيقية", title_en: "Real Company Simulation", desc_ar: "تنظيف بيانات، استعلامات SQL، لوحات تحكم Power BI، وأتمتة التقارير", desc_en: "Data cleaning, SQL queries, Power BI dashboards, and report automation", banner: null }
        ]
      }
    ]
  },

  academic: {
    number: "03 / ACADEMIC EXCELLENCE & SUPPORT",
    banner_main: null, // add images/banner-academic-main.jpg when ready
    title_ar: "البحث العلمي ودعم المشاريع",
    title_en: "Academic Excellence & Project Support",
    desc_ar: "إشراف هندسي متكامل يرافقك من ولادة الفكرة وحتى المناقشة والحصول على الدرجة العلمية.",
    desc_en: "Comprehensive engineering supervision from idea generation to final defense and graduation.",
    tracks: [
      {
        id: "acad-masters",
        title_ar: "باحثي الماجستير",
        title_en: "Master's Researchers",
        desc_ar: "إشراف كامل من البداية للنهاية، تنسيق الرسالة، تجهيز للفهم العميق وجاهزية المناقشة",
        desc_en: "End-to-end supervision, formatting, deep understanding prep, defense readiness",
        banner: null
      },
      {
        id: "acad-bachelors",
        title_ar: "مشاريع البكالوريوس",
        title_en: "Bachelor's Students",
        desc_ar: "اختيار الفكرة، التنفيذ الهندسي الدقيق، توثيق المشروع، التحضير للعرض التقديمي",
        desc_en: "Idea selection, accurate engineering execution, documentation, presentation prep",
        banner: null
      }
    ]
  },

  highschool: {
    number: "04 / B&S HIGH SCHOOL",
    banner_main: null, // add images/banner-highschool-main.jpg when ready
    title_ar: "المرحلة الثانوية",
    title_en: "High School",
    desc_ar: "شرح تفاعلي يبني عقلية علمية صحيحة تمهد للتفكير الهندسي.",
    desc_en: "Interactive explanations building a strong scientific mindset for future engineering thinking.",
    tracks: [
      {
        id: "hs-physics",
        title_ar: "الفيزياء",
        title_en: "Physics",
        desc_ar: "",
        desc_en: "",
        banner: null
      },
      {
        id: "hs-math",
        title_ar: "الرياضيات",
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
  // single object into two — see instructions above.
  // ---------------------------------------------
  kids: {
    number: "05 / KIDS & TEENS TECH SCHOOL",
    banner_main: "images/banner-kids-main.jpg",
    title_ar: "مدرسة التكنولوجيا لصغار السن",
    title_en: "Kids & Teens Tech School",
    desc_ar: "تحويل طفلك من مستهلك للتكنولوجيا إلى مبدع ومطور في بيئة تفاعلية ممتعة.",
    desc_en: "Transforming your child from a technology consumer into a creator in a fun, interactive environment.",
    tracks: [
      {
        id: "kids-programming-ai",
        title_ar: "البرمجة التفاعلية والذكاء الاصطناعي",
        title_en: "Interactive Programming & AI",
        desc_ar: "من أول لعبة يبنيها الطفل بـ Scratch لحد أول خطوة في عالم الذكاء الاصطناعي",
        desc_en: "From a child's first Scratch game to first steps into AI",
        banner: "images/banner-kids-programming-ai.jpg"
      },
      {
        id: "kids-english",
        title_ar: "الإنجليزية التفاعلية",
        title_en: "Interactive English",
        desc_ar: "Phonics، القصص التفاعلية، والمحادثة بطريقة مرحة ومشجعة",
        desc_en: "Phonics, interactive storytelling, and fun conversation practice",
        banner: "images/banner-kids-english.jpg"
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

/* ============================================
   Renderer 1: Homepage "overview" cards —
   one compact card per sector, linking to that
   sector's own detail page.

   DATA SOURCE PRIORITY:
   1. Supabase `programs` table (live, real tree —
      reflects whatever the admin panel has saved)
   2. Local SECTOR_TRACKS object above (fallback,
      used when Supabase isn't configured yet or
      a sector has no rows in the database)
   ============================================ */
async function renderSectorOverviewCards() {
  const container = document.getElementById('sectorOverviewGrid');
  if (!container) return;

  const lang = currentLang || 'ar';
  let sectors = [];

  // Try the live database first
  if (typeof bsGetTopLevelSectors === 'function' && typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured) {
    const liveSectors = await bsGetTopLevelSectors();
    if (liveSectors && liveSectors.length) {
      sectors = liveSectors.map(row => ({
        key: row.sector_key,
        number: row.sort_order ? `0${row.sort_order} / ${row.sector_key.toUpperCase()}` : row.sector_key.toUpperCase(),
        title_ar: row.title_ar,
        title_en: row.title_en,
        desc_ar: row.desc_ar,
        desc_en: row.desc_en,
        banner_main: row.banner_url
      }));
    }
  }

  // Fallback to local static data if the database had nothing
  if (!sectors.length) {
    sectors = SECTOR_ORDER.map(key => {
      const s = SECTOR_TRACKS[key];
      return s ? { key, ...s } : null;
    }).filter(Boolean);
  }

  container.innerHTML = sectors.map(s => `
    <a href="#sector-detail-${s.key}" data-nav="sector-detail" data-sector-key="${s.key}" class="sector-overview-card reveal">
      <div class="sector-overview-card-banner">
        ${s.banner_main ? `<img src="${s.banner_main}" alt="${lang === 'ar' ? s.title_ar : s.title_en}" loading="lazy">` : '<div class="sector-overview-card-noimg"></div>'}
      </div>
      <div class="sector-overview-card-body">
        <span class="sector-number">${s.number}</span>
        <h3>${lang === 'ar' ? s.title_ar : s.title_en}</h3>
        <p>${lang === 'ar' ? s.desc_ar : s.desc_en}</p>
        <span class="sector-overview-card-link">${lang === 'ar' ? 'اعرف أكتر ←' : 'Learn more →'}</span>
      </div>
    </a>
  `).join('');
}

/* ============================================
   Renderer 2: Sector DETAIL page — fills the
   generic #page-sector-detail with the chosen
   sector's full content (banner, title, desc,
   and its program tree, to any depth).

   DATA SOURCE PRIORITY: same as renderSectorOverviewCards —
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

  // Try the live database first
  if (typeof bsGetSectorProgramTree === 'function' && typeof isSupabaseConfigured !== 'undefined' && isSupabaseConfigured) {
    tree = await bsGetSectorProgramTree(sectorKey);
    if (tree && tree.length) {
      // In the recursive model, the sector's own info is the
      // single root row with parent_id = null for this sector_key.
      // If a sector somehow has multiple top-level rows, we treat
      // the first as the sector header and the rest as its programs.
      const sectors = await (typeof bsGetTopLevelSectors === 'function' ? bsGetTopLevelSectors() : []);
      const matchingSector = (sectors || []).find(s => s.sector_key === sectorKey);
      if (matchingSector) {
        sectorInfo = {
          number: matchingSector.sort_order ? `0${matchingSector.sort_order} / ${sectorKey.toUpperCase()}` : sectorKey.toUpperCase(),
          title_ar: matchingSector.title_ar,
          title_en: matchingSector.title_en,
          desc_ar: matchingSector.desc_ar,
          desc_en: matchingSector.desc_en,
          banner_main: matchingSector.banner_url
        };
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
        banner_url: t.banner,
        children_sequential_lock: t.children_sequential_lock || false,
        children: (t.children || []).map(wrapLocalNode)
      };
    }
    tree = s.tracks.map(wrapLocalNode);
  }

  const title = lang === 'ar' ? sectorInfo.title_ar : sectorInfo.title_en;

  if (sectorInfo.banner_main) {
    bannerImg.src = sectorInfo.banner_main;
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
    progressMap = await bsGetStudentProgressForSector(studentId, sectorKey);
    if (typeof bsGetSectorPrerequisites === 'function') {
      prerequisiteLinks = await bsGetSectorPrerequisites(sectorKey);
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

  tracksContainer.innerHTML = tree.map(node => renderProgramNode(node, lang, 0)).join('');

  document.title = `${title} | B&S Academy`;
}

/* ============================================
   Recursive node renderer — draws ONE program
   card, then (if it has children) draws them
   nested inside it, to any depth. This single
   function is what gives the system unlimited
   nesting without any extra code per level.
   ============================================ */
function renderProgramNode(node, lang, depth) {
  const title = lang === 'ar' ? node.title_ar : node.title_en;
  const desc = lang === 'ar' ? node.desc_ar : node.desc_en;
  const banner = node.banner_url || node.banner; // supports both DB field name and local fallback shape
  const hasChildren = node.children && node.children.length > 0;

  // unlocked defaults to true when the lock system hasn't run
  // (e.g. a visitor with no account browsing the curriculum)
  const isLocked = node.unlocked === false;
  const progress = node.progress_percent || 0;
  const showBypassBtn = node.has_bypass_exam && isLocked;
  const hasPrereqs = node.prerequisite_ids && node.prerequisite_ids.length > 0;

  return `
    <div class="track-card ${hasChildren ? 'track-card-has-children' : ''} depth-${depth} ${isLocked ? 'track-card-locked' : ''}" data-track-id="${node.id}">
      ${banner ? `
        <div class="track-card-banner">
          <img src="${banner}" alt="${title}" loading="lazy">
          ${isLocked ? `<div class="track-card-lock-overlay">🔒</div>` : ''}
        </div>
      ` : ''}
      <div class="track-card-body">
        <div class="track-card-title-row">
          <h4 class="track-card-title">${title}</h4>
          ${isLocked ? '<span class="lock-badge">🔒</span>' : (progress > 0 ? '<span class="unlocked-badge">🔓</span>' : '')}
        </div>
        ${desc ? `<p class="track-card-desc">${desc}</p>` : ''}
        ${isLocked && hasPrereqs ? `
          <p class="prereq-note">${lang === 'ar'
            ? `🔗 يتطلب إكمال ${node.prerequisite_ids.length} ${node.prerequisite_ids.length === 1 ? 'برنامج' : 'برامج'} سابقة`
            : `🔗 Requires completing ${node.prerequisite_ids.length} prior program${node.prerequisite_ids.length > 1 ? 's' : ''}`}</p>
        ` : ''}
        ${!isLocked && progress > 0 ? `
          <div class="progress-bar-track" style="margin-top:8px;">
            <div class="progress-bar-fill" style="width:${progress}%"></div>
          </div>
          <span class="progress-percent" style="font-size:0.75rem;">${progress}%</span>
        ` : ''}
        ${showBypassBtn ? `
          <button class="btn-bypass-exam" data-program-id="${node.id}">
            ${lang === 'ar' ? '📝 امتحان تحديد المستوى / تخطي' : '📝 Placement / Bypass Exam'}
          </button>
        ` : ''}
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