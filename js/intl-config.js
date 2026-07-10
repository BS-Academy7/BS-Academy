/* ============================================
   B&S Academy - International settings
   Countries, phone codes, languages, currencies
   ============================================ */

const BS_COUNTRIES = [
  { code: 'EG', name_ar: 'مصر', name_en: 'Egypt', dial: '+20', currency: 'EGP' },
  { code: 'SA', name_ar: 'السعودية', name_en: 'Saudi Arabia', dial: '+966', currency: 'SAR' },
  { code: 'AE', name_ar: 'الإمارات', name_en: 'United Arab Emirates', dial: '+971', currency: 'AED' },
  { code: 'KW', name_ar: 'الكويت', name_en: 'Kuwait', dial: '+965', currency: 'KWD' },
  { code: 'QA', name_ar: 'قطر', name_en: 'Qatar', dial: '+974', currency: 'QAR' },
  { code: 'BH', name_ar: 'البحرين', name_en: 'Bahrain', dial: '+973', currency: 'BHD' },
  { code: 'OM', name_ar: 'عمان', name_en: 'Oman', dial: '+968', currency: 'OMR' },
  { code: 'JO', name_ar: 'الأردن', name_en: 'Jordan', dial: '+962', currency: 'JOD' },
  { code: 'IQ', name_ar: 'العراق', name_en: 'Iraq', dial: '+964', currency: 'USD' },
  { code: 'LB', name_ar: 'لبنان', name_en: 'Lebanon', dial: '+961', currency: 'USD' },
  { code: 'MA', name_ar: 'المغرب', name_en: 'Morocco', dial: '+212', currency: 'MAD' },
  { code: 'DZ', name_ar: 'الجزائر', name_en: 'Algeria', dial: '+213', currency: 'DZD' },
  { code: 'TN', name_ar: 'تونس', name_en: 'Tunisia', dial: '+216', currency: 'TND' },
  { code: 'US', name_ar: 'الولايات المتحدة', name_en: 'United States', dial: '+1', currency: 'USD' },
  { code: 'GB', name_ar: 'المملكة المتحدة', name_en: 'United Kingdom', dial: '+44', currency: 'GBP' },
  { code: 'DE', name_ar: 'ألمانيا', name_en: 'Germany', dial: '+49', currency: 'EUR' },
  { code: 'FR', name_ar: 'فرنسا', name_en: 'France', dial: '+33', currency: 'EUR' },
  { code: 'OTHER', name_ar: 'دولة أخرى', name_en: 'Other country', dial: '+', currency: 'USD' }
];

const BS_CURRENCIES = [
  { code: 'EGP', name_ar: 'جنيه مصري', name_en: 'Egyptian Pound', symbol: 'EGP' },
  { code: 'SAR', name_ar: 'ريال سعودي', name_en: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'AED', name_ar: 'درهم إماراتي', name_en: 'UAE Dirham', symbol: 'AED' },
  { code: 'KWD', name_ar: 'دينار كويتي', name_en: 'Kuwaiti Dinar', symbol: 'KWD' },
  { code: 'QAR', name_ar: 'ريال قطري', name_en: 'Qatari Riyal', symbol: 'QAR' },
  { code: 'BHD', name_ar: 'دينار بحريني', name_en: 'Bahraini Dinar', symbol: 'BHD' },
  { code: 'OMR', name_ar: 'ريال عماني', name_en: 'Omani Rial', symbol: 'OMR' },
  { code: 'USD', name_ar: 'دولار أمريكي', name_en: 'US Dollar', symbol: 'USD' },
  { code: 'EUR', name_ar: 'يورو', name_en: 'Euro', symbol: 'EUR' },
  { code: 'GBP', name_ar: 'جنيه إسترليني', name_en: 'British Pound', symbol: 'GBP' }
];

const BS_DOCUMENT_LANGUAGES = [
  { code: 'ar', label_ar: 'العربية', label_en: 'Arabic' },
  { code: 'en', label_ar: 'English', label_en: 'English' },
  { code: 'dual', label_ar: 'عربي + English', label_en: 'Arabic + English' }
];

function bsIntlLang() {
  return window.currentLang || document.documentElement.lang || 'ar';
}

function bsCountryLabel(country, lang = bsIntlLang()) {
  if (!country) return '';
  return lang === 'en' ? country.name_en : country.name_ar;
}

function bsCurrencyLabel(currency, lang = bsIntlLang()) {
  if (!currency) return '';
  return `${currency.code} - ${lang === 'en' ? currency.name_en : currency.name_ar}`;
}

function bsFindCountry(code) {
  return BS_COUNTRIES.find(country => country.code === code) || BS_COUNTRIES[0];
}

function bsFindCurrency(code) {
  return BS_CURRENCIES.find(currency => currency.code === code) || BS_CURRENCIES[0];
}

function bsPopulateCountrySelect(select, selectedCode = 'EG') {
  if (!select) return;
  const lang = bsIntlLang();
  select.innerHTML = BS_COUNTRIES.map(country => `
    <option value="${country.code}" data-dial="${country.dial}" data-currency="${country.currency}" ${country.code === selectedCode ? 'selected' : ''}>
      ${bsCountryLabel(country, lang)} (${country.dial})
    </option>
  `).join('');
}

function bsPopulateCurrencySelect(select, selectedCode = 'EGP') {
  if (!select) return;
  const lang = bsIntlLang();
  select.innerHTML = BS_CURRENCIES.map(currency => `
    <option value="${currency.code}" ${currency.code === selectedCode ? 'selected' : ''}>
      ${bsCurrencyLabel(currency, lang)}
    </option>
  `).join('');
}

function bsPopulateDocumentLanguageSelect(select, selectedCode = 'ar') {
  if (!select) return;
  const lang = bsIntlLang();
  select.innerHTML = BS_DOCUMENT_LANGUAGES.map(item => `
    <option value="${item.code}" ${item.code === selectedCode ? 'selected' : ''}>
      ${lang === 'en' ? item.label_en : item.label_ar}
    </option>
  `).join('');
}

function bsNormalizeLocalPhone(phone) {
  return String(phone || '').replace(/[^\d]/g, '').replace(/^0+/, '');
}

function bsComposeInternationalPhone(countryCode, localPhone) {
  const country = bsFindCountry(countryCode);
  const local = bsNormalizeLocalPhone(localPhone);
  if (!local) return '';
  return `${country.dial}${local}`;
}

function bsApplyCountryPhoneGroup(group) {
  if (!group) return;
  const countrySelect = group.querySelector('[data-country-select]');
  const phoneInput = group.querySelector('[data-local-phone]');
  const dialLabel = group.querySelector('[data-dial-label]');
  const hiddenFullPhone = group.querySelector('[data-full-phone]');
  const hiddenCurrency = group.querySelector('[data-country-currency]');

  bsPopulateCountrySelect(countrySelect, countrySelect?.dataset.selected || 'EG');

  function syncPhone() {
    const country = bsFindCountry(countrySelect?.value || 'EG');
    if (dialLabel) dialLabel.textContent = country.dial;
    if (hiddenCurrency) hiddenCurrency.value = country.currency;
    if (hiddenFullPhone) hiddenFullPhone.value = bsComposeInternationalPhone(country.code, phoneInput?.value || '');
    if (phoneInput) phoneInput.placeholder = country.code === 'EG' ? '1xx xxx xxxx' : 'phone number';
  }

  countrySelect?.addEventListener('change', syncPhone);
  phoneInput?.addEventListener('input', syncPhone);
  syncPhone();
}

function bsApplyIntlControls(root = document) {
  root.querySelectorAll('[data-country-select]').forEach(select => {
    if (!select.options.length) {
      bsPopulateCountrySelect(select, select.dataset.selected || 'EG');
    }
  });
  root.querySelectorAll('[data-country-phone-group]').forEach(bsApplyCountryPhoneGroup);
  root.querySelectorAll('[data-currency-select]').forEach(select => {
    bsPopulateCurrencySelect(select, select.dataset.selected || 'EGP');
  });
  root.querySelectorAll('[data-document-language-select]').forEach(select => {
    bsPopulateDocumentLanguageSelect(select, select.dataset.selected || 'ar');
  });
  bsLinkPrimaryCountryToPhone(root);
}

function bsLinkPrimaryCountryToPhone(root = document) {
  const primarySelectors = root.querySelectorAll('select[name="country_code"], #signupCountry');
  primarySelectors.forEach(primary => {
    const form = primary.closest('form') || root;
    const phoneGroup = form.querySelector('[data-country-phone-group]');
    const phoneCountry = phoneGroup?.querySelector('[data-country-select]');
    const hiddenCurrency = phoneGroup?.querySelector('[data-country-currency]');
    const sync = () => {
      const country = bsFindCountry(primary.value || 'EG');
      if (phoneCountry && (!phoneCountry.value || phoneCountry.dataset.followPrimary !== 'false')) {
        phoneCountry.value = country.code;
        phoneCountry.dispatchEvent(new Event('change'));
      }
      if (hiddenCurrency) hiddenCurrency.value = country.currency;
    };
    primary.addEventListener('change', sync);
    sync();
  });
}

document.addEventListener('DOMContentLoaded', () => bsApplyIntlControls(document));
