(function () {
  'use strict';

  var translations = {
    ar: {
      back: 'العودة للأكاديمية',
      role: 'المؤسس والمدير العام',
      intro: 'يقود B&S Academy برؤية تجعل التعليم العملي واضحًا، قابلًا للقياس، وقريبًا من احتياجات الطالب وسوق العمل.',
      readVision: 'اقرأ الرؤية',
      programs: 'استكشف البرامج',
      visionEyebrow: 'اتجاه واضح',
      visionTitle: 'رؤية الأكاديمية',
      visionText: 'أن تصبح B&S Academy بيئة تعليمية موثوقة تربط المعرفة بالتطبيق، وتمنح كل طالب مسارًا واضحًا لبناء المهارة والثقة والقدرة على الإنجاز.',
      principle1Title: 'تعليم يترجم إلى مهارة',
      principle1Text: 'كل مسار يبدأ بالفهم وينتهي بتطبيق يمكن للطالب استخدامه وتطويره.',
      principle2Title: 'مسار يناسب الطالب',
      principle2Text: 'نراعي المستوى والهدف وسرعة التعلم بدل تقديم تجربة واحدة للجميع.',
      principle3Title: 'جودة يمكن قياسها',
      principle3Text: 'نعتمد المتابعة والمشروعات والتقييم ليتحول التقدم إلى نتيجة واضحة.',
      founderVisionEyebrow: 'من المؤسس',
      founderVisionTitle: 'رؤية صاحب الأكاديمية',
      founderVisionQuote: 'أؤمن أن أفضل تعليم هو الذي يجعل الطالب قادرًا على الفهم والعمل واتخاذ القرار بنفسه. لذلك نبني الأكاديمية خطوة بخطوة حول احتياج حقيقي، ومسؤولية واضحة، وتجربة تحترم وقت الطالب وطموحه.',
      founderVisionText: 'هدفي أن يجد الطالب داخل B&S Academy أكثر من محتوى: يجد توجيهًا، متابعة، وأدوات تساعده على الانتقال من المعرفة إلى الإنجاز بثقة.',
      promise: 'وعدنا أن تظل قيمة الطالب وتقدمه هما المعيار الأول في كل قرار تعليمي.'
    },
    en: {
      back: 'Back to the Academy',
      role: 'Founder & General Manager',
      intro: 'He leads B&S Academy with a vision that makes practical learning clear, measurable, and closely connected to each student and the real world of work.',
      readVision: 'Read the vision',
      programs: 'Explore programs',
      visionEyebrow: 'A clear direction',
      visionTitle: 'Academy Vision',
      visionText: 'To make B&S Academy a trusted learning environment that connects knowledge with practice and gives every student a clear path to build skill, confidence, and the ability to achieve.',
      principle1Title: 'Learning that becomes skill',
      principle1Text: 'Every path begins with understanding and ends with practical work students can use and improve.',
      principle2Title: 'A path built around the student',
      principle2Text: 'We account for level, objective, and learning pace instead of offering one experience to everyone.',
      principle3Title: 'Measurable quality',
      principle3Text: 'Follow-up, projects, and assessment turn progress into a visible result.',
      founderVisionEyebrow: 'From the Founder',
      founderVisionTitle: "The Founder's Vision",
      founderVisionQuote: 'I believe the best education enables students to understand, work, and make decisions independently. We therefore build the Academy around real needs, clear responsibility, and an experience that respects each student’s time and ambition.',
      founderVisionText: 'My goal is for every student to find more than content at B&S Academy: guidance, follow-up, and tools that help turn knowledge into confident achievement.',
      promise: 'Our promise is that student value and progress remain the first measure behind every educational decision.'
    }
  };

  var toggle = document.getElementById('founderLangToggle');

  function applyLanguage(lang) {
    var selected = translations[lang] ? lang : 'ar';
    document.documentElement.lang = selected;
    document.documentElement.dir = selected === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-founder-i18n]').forEach(function (element) {
      var key = element.getAttribute('data-founder-i18n');
      if (translations[selected][key]) element.textContent = translations[selected][key];
    });
    toggle.textContent = selected === 'ar' ? 'EN' : 'AR';
    localStorage.setItem('bs_lang', selected);
  }

  toggle.addEventListener('click', function () {
    applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar');
  });

  applyLanguage(localStorage.getItem('bs_lang') || 'ar');
}());
