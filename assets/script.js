// SEA LORDS — vanilla JS (no framework, no build step)

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Accordion (Rules page) ---------- */
  document.querySelectorAll('.accordion-item').forEach((item) => {
    const head = item.querySelector('.accordion-head');
    const panel = item.querySelector('.accordion-panel');
    if (!head || !panel) return;

    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      item.parentElement.querySelectorAll('.accordion-item.is-open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.accordion-panel').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Tabs (Market page) ---------- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach((b) => b.classList.remove('is-active'));
      tabPanels.forEach((p) => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      const panel = document.querySelector(`.tab-panel[data-tab="${target}"]`);
      if (panel) panel.classList.add('is-active');
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  /* ---------- Active nav state (top nav + bottom tab bar) ---------- */
  const currentPage = document.body.getAttribute('data-page');
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.getAttribute('data-nav') === currentPage) {
      link.classList.add('is-active');
    }
  });

  /* ---------- Form Builder (ساخت فرم) — only runs on forms.html ---------- */
  const pickerGrid = document.getElementById('formPickerGrid');
  const wizardBox = document.getElementById('formWizard');
  if (pickerGrid && wizardBox) initFormBuilder(pickerGrid, wizardBox);
});

/* ============================================================
   Shared game-data lists (kept in sync with the Market prices)
============================================================ */
const RESOURCES = [
  { key: 'coin', label: 'سکه', icon: '💰' },
  { key: 'wood', label: 'چوب', icon: '🪵' },
  { key: 'stone', label: 'سنگ', icon: '🪨' },
  { key: 'fish', label: 'ماهی', icon: '🐟' },
  { key: 'pop', label: 'جمعیت', icon: '👥' },
];

const TROOPS = [
  { key: 'spear', label: 'نیزه‌دار', icon: '🛡', cost: { coin: 20, fish: 4, pop: 1, equip: { icon: '🛡', amount: 1, label: 'نیزه' } } },
  { key: 'sword', label: 'شمشیرزن', icon: '🗡', cost: { coin: 30, fish: 5, pop: 1, equip: { icon: '🗡', amount: 1, label: 'شمشیر' } } },
  { key: 'archer', label: 'کماندار', icon: '🏹', cost: { coin: 35, fish: 5, pop: 1, equip: { icon: '🏹', amount: 1, label: 'کمان' } } },
  { key: 'axe', label: 'تبرزن', icon: '🪓', cost: { coin: 45, fish: 6, pop: 1, equip: { icon: '🪓', amount: 1, label: 'تبر' } } },
];

const SHIPS = [
  { key: 'merchant', label: 'کشتی تجاری', icon: '🚢', cost: { coin: 250, wood: 150, stone: 50 } },
  { key: 'transport', label: 'کشتی ترابری', icon: '⛴', cost: { coin: 350, wood: 220, stone: 80 } },
  { key: 'escort', label: 'کشتی محافظ', icon: '🛡', cost: { coin: 450, wood: 280, stone: 120 } },
  { key: 'warship', label: 'کشتی جنگی', icon: '⚔', cost: { coin: 700, wood: 400, stone: 200 } },
];

const BUILDINGS = [
  { key: 'house', label: 'خانه مسکونی', icon: '🏘', cost: { coin: 150, wood: 80, stone: 50 } },
  { key: 'lumber', label: 'اردوگاه چوب‌بری', icon: '🪵', cost: { coin: 200, wood: 60, stone: 80 } },
  { key: 'quarry', label: 'معدن سنگ', icon: '🪨', cost: { coin: 220, wood: 70, stone: 90 } },
  { key: 'workshop', label: 'کارگاه ادوات', icon: '🛠', cost: { coin: 350, wood: 120, stone: 120 } },
  { key: 'harbor', label: 'بندر', icon: '⚓', cost: { coin: 500, wood: 250, stone: 180 } },
  { key: 'tower', label: 'برج نگهبانی', icon: '🏰', cost: { coin: 450, wood: 100, stone: 220 } },
];

/* Looks up the market price of a purchased item and multiplies by quantity.
   Returns a formatted multi-line breakdown, or null if the item can't be matched. */
function calcPurchaseCost(category, itemStr, qty) {
  const n = Number(qty) || 0;
  let arr;
  if (category === '🏗 ساختمان') arr = BUILDINGS;
  else if (category === '⚔ ارتش') arr = TROOPS;
  else if (category === '🚢 ناوگان') arr = SHIPS;
  else return null;

  const found = arr.find((it) => `${it.icon} ${it.label}` === itemStr);
  if (!found || !n) return null;

  const c = found.cost;
  const lines = [];
  if (c.coin) lines.push(`💰 ${c.coin * n} سکه`);
  if (c.wood) lines.push(`🪵 ${c.wood * n} چوب`);
  if (c.stone) lines.push(`🪨 ${c.stone * n} سنگ`);
  if (c.fish) lines.push(`🐟 ${c.fish * n} ماهی`);
  if (c.pop) lines.push(`👥 ${c.pop * n} جمعیت`);
  if (c.equip) lines.push(`${c.equip.icon} ${c.equip.amount * n} ${c.equip.label}`);
  return lines.join('\n');
}

function todayFa() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDate(isoDate) {
  if (!isoDate) return '';
  return isoDate.replaceAll('-', '/');
}

/* Turns a { key: count } map into "🚢 2x کشتی تجاری، ⚔ 1x کشتی جنگی" */
function stepperSummary(items, counts) {
  const parts = items
    .filter((it) => (counts[it.key] || 0) > 0)
    .map((it) => `${it.icon} ${counts[it.key]}x ${it.label}`);
  return parts.length ? parts.join('، ') : '—';
}

/* ============================================================
   Form definitions
============================================================ */
const SEA_LORDS_FORMS = [
  {
    key: 'war',
    icon: '⚔️',
    title: 'فرم اعلان جنگ',
    sub: 'ثبت رسمی یک حمله',
    fields: [
      { key: 'attacker', label: 'جزیره مهاجم', type: 'text' },
      { key: 'defender', label: 'جزیره مدافع', type: 'text' },
      { key: 'target', label: 'هدف حمله', type: 'text' },
      { key: 'troops', label: 'نیروهای اعزامی', type: 'stepper', items: TROOPS, hint: 'برای هرکدوم از نیروها، تعداد اعزامی رو با + و - مشخص کن' },
      { key: 'fleet', label: 'ناوگان اعزامی', type: 'stepper', items: SHIPS, hint: 'تعداد هر نوع کشتی اعزامی رو مشخص کن' },
      { key: 'time', label: 'زمان آغاز حمله', type: 'datetime' },
      { key: 'scenario', label: 'رول جنگ', type: 'textarea', hint: 'حداقل ۵ خط و بدون محدودیت در حداکثر تعداد خطوط' },
      { key: 'signature', label: 'امضای فرمانروای مهاجم', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم اعلان جنگ
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره مهاجم : ${v.attacker}
|🔹| - جزیره مدافع : ${v.defender}
|🔹| - هدف حمله : ${v.target}
|🔹| - تعداد نیروهای اعزامی : ${v.troops}
|🔹| - ناوگان اعزامی : ${v.fleet}
|🔹| - زمان آغاز حمله : ${v.time}

📝 رول جنگ:
${v.scenario}

🖋️ امضای فرمانروای مهاجم : ${v.signature}`,
  },
  {
    key: 'trade',
    icon: '🤝',
    title: 'فرم تجارت',
    sub: 'مبادله منابع بین دو جزیره',
    fields: [
      { key: 'from', label: 'جزیره ارسال‌کننده', type: 'text' },
      { key: 'to', label: 'جزیره دریافت‌کننده', type: 'text' },
      { key: 'sent', label: 'منابع ارسالی', type: 'stepper', items: RESOURCES, hint: 'مقدار هر منبعی که ارسال می‌کنی رو مشخص کن' },
      { key: 'received', label: 'منابع دریافتی', type: 'stepper', items: RESOURCES, hint: 'مقدار هر منبعی که دریافت می‌کنی رو مشخص کن' },
      { key: 'merchant_ships', label: 'تعداد کشتی‌های تجاری', type: 'number', min: 0, max: 20 },
      { key: 'escort_ships', label: 'تعداد کشتی‌های محافظ', type: 'number', min: 0, max: 20 },
      { key: 'signature', label: 'امضای فرستنده (امضای شما)', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم تجارت
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره ارسال‌کننده : ${v.from}
|🔹| - جزیره دریافت‌کننده : ${v.to}
|🔹| - منابع ارسالی : ${v.sent}
|🔹| - منابع دریافتی : ${v.received}
|🔹| - تعداد کشتی‌های تجاری : ${v.merchant_ships}
|🔹| - تعداد کشتی‌های محافظ : ${v.escort_ships}
|🔹| - تاریخ ثبت : ${todayFa()}
🖋️ امضای فرستنده : ${v.signature}
🖋️ امضای دریافت‌کننده :`,
  },
  {
    key: 'capture',
    icon: '🏝',
    title: 'فرم درخواست تصرف',
    sub: 'ثبت تصرف جزیره پس از پیروزی',
    fields: [
      { key: 'attacker', label: 'جزیره مهاجم', type: 'text' },
      { key: 'island', label: 'جزیره موردنظر', type: 'text' },
      { key: 'battle_date', label: 'تاریخ نبرد', type: 'date' },
      { key: 'signature', label: 'امضای فرمانروای پیروز', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم درخواست تصرف
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره مهاجم : ${v.attacker}
|🔹| - جزیره موردنظر : ${v.island}
|🔹| - تاریخ نبرد : ${fmtDate(v.battle_date)}
|🔹| - نتیجه اعلام‌شده توسط مدیریت : (توسط مدیریت تکمیل می‌شود)
🖋️ امضای فرمانروای پیروز : ${v.signature}`,
  },
  {
    key: 'alliance',
    icon: '🤝',
    title: 'فرم ساخت اتحاد',
    sub: 'تشکیل یک اتحاد رسمی',
    fields: [
      { key: 'name', label: 'نام اتحاد', type: 'text' },
      { key: 'founder_island', label: 'جزیره بنیان‌گذار', type: 'text' },
      { key: 'founder_lord', label: 'فرمانروای بنیان‌گذار', type: 'text' },
      { key: 'members', label: 'اعضای اولیه', type: 'tag-list', hint: 'اسم هر عضو رو بنویس و بزن +، می‌تونی چندتا اضافه کنی' },
      { key: 'goal', label: 'هدف از تشکیل اتحاد', type: 'text' },
      { key: 'signature', label: 'امضای بنیان‌گذار', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم ساخت اتحاد
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - نام اتحاد : ${v.name}
|🔹| - جزیره بنیان‌گذار : ${v.founder_island}
|🔹| - فرمانروای بنیان‌گذار : ${v.founder_lord}
|🔹| - اعضای اولیه : ${v.members}
|🔹| - هدف از تشکیل اتحاد : ${v.goal}
|🔹| - تاریخ ثبت : ${todayFa()}
🖋️ امضای بنیان‌گذار : ${v.signature}`,
  },
  {
    key: 'peace',
    icon: '🕊',
    title: 'فرم درخواست صلح',
    sub: 'پایان دادن به یک جنگ',
    fields: [
      { key: 'island1', label: 'جزیره اول (جزیره شما)', type: 'text' },
      { key: 'island2', label: 'جزیره دوم', type: 'text' },
      { key: 'duration', label: 'مدت پیمان (تعداد بازده)', type: 'number', min: 1, max: 60, unit: 'بازده' },
      { key: 'terms', label: 'شرایط توافق', type: 'textarea' },
      { key: 'signature', label: 'امضای فرمانروای اول (امضای شما)', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم درخواست صلح
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره اول : ${v.island1}
|🔹| - جزیره دوم : ${v.island2}
|🔹| - مدت پیمان : ${v.duration} بازده
|🔹| - شرایط توافق : ${v.terms}
🖋️ امضای فرمانروای اول : ${v.signature}
🖋️ امضای فرمانروای دوم :`,
  },
  {
    key: 'loot',
    icon: '☠️',
    title: 'فرم غارت',
    sub: 'ثبت غنیمت پس از پیروزی',
    fields: [
      { key: 'winner', label: 'جزیره پیروز', type: 'text' },
      { key: 'loser', label: 'جزیره شکست‌خورده', type: 'text' },
      { key: 'battle_date', label: 'تاریخ نبرد', type: 'date' },
      { key: 'ships', label: 'کشتی‌های حمل غنیمت', type: 'stepper', items: SHIPS, hint: 'تعداد هر کشتی که برای حمل غنیمت اعزام می‌شه' },
      { key: 'signature', label: 'امضای فرمانروای پیروز', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم غارت
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - جزیره پیروز : ${v.winner}
|🔹| - جزیره شکست‌خورده : ${v.loser}
|🔹| - تاریخ نبرد : ${fmtDate(v.battle_date)}
|🔹| - تعداد کشتی‌های حمل غنیمت : ${v.ships}

📝 میزان غنیمت پس از بررسی نبرد، توسط مدیریت تعیین و ثبت خواهد شد.

🖋️ امضای فرمانروای پیروز : ${v.signature}`,
  },
  {
    key: 'purchase',
    icon: '🛒',
    title: 'فرم خرید',
    sub: 'خرید ساختمان، ارتش یا ناوگان',
    fields: [
      { key: 'island', label: 'نام جزیره', type: 'text' },
      { key: 'lord', label: 'نام فرمانروا', type: 'text' },
      { key: 'category', label: 'دسته خرید', type: 'select', options: ['🏗 ساختمان', '⚔ ارتش', '🚢 ناوگان'] },
      {
        key: 'item',
        label: 'نام آیتم',
        type: 'select-dependent',
        dependsOn: 'category',
        optionsMap: {
          '🏗 ساختمان': BUILDINGS.map((b) => `${b.icon} ${b.label}`),
          '⚔ ارتش': TROOPS.map((t) => `${t.icon} ${t.label}`),
          '🚢 ناوگان': SHIPS.map((s) => `${s.icon} ${s.label}`),
        },
      },
      { key: 'qty', label: 'تعداد', type: 'number', min: 1, max: 100 },
      { key: 'signature', label: 'امضای فرمانروا', type: 'text' },
    ],
    compile: (v) =>
`📋 فرم خرید
━━━━━━━━━━━━━━━━━━━━━━

|🔹| - نام جزیره : ${v.island}
|🔹| - نام فرمانروا : ${v.lord}
|🔹| - دسته خرید : ${v.category}
|🔹| - نام آیتم : ${v.item}
|🔹| - تعداد : ${v.qty}
|🔹| - هزینه کل :
${calcPurchaseCost(v.category, v.item, v.qty) || '(توسط مدیریت تکمیل می‌شود)'}
|🔹| - تاریخ ثبت : ${todayFa()}
🖋️ امضای فرمانروا : ${v.signature}`,
  },
];

/* ============================================================
   Wizard engine
============================================================ */
function initFormBuilder(pickerGrid, wizardBox) {
  let state = null; // { form, step, values, stepperCounts, tagItems }

  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  function renderPicker() {
    pickerGrid.innerHTML = SEA_LORDS_FORMS.map((f, i) => `
      <button class="form-pick-card" data-index="${i}">
        <span class="fp-icon">${f.icon}</span>
        <span>
          <span class="fp-title">${f.title}</span>
          <span class="fp-sub">${f.sub}</span>
        </span>
      </button>
    `).join('');

    pickerGrid.querySelectorAll('.form-pick-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const form = SEA_LORDS_FORMS[Number(btn.getAttribute('data-index'))];
        state = { form, step: 0, values: {}, stepperCounts: {}, tagItems: {} };
        pickerGrid.style.display = 'none';
        wizardBox.style.display = 'block';
        renderWizard();
        wizardBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function backToPicker() {
    state = null;
    wizardBox.style.display = 'none';
    wizardBox.innerHTML = '';
    pickerGrid.style.display = 'grid';
    pickerGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function fieldInputHtml(field, currentVal) {
    if (field.type === 'textarea') {
      return `<textarea class="field-textarea" id="fbInput">${currentVal || ''}</textarea>`;
    }
    if (field.type === 'date') {
      return `<input class="field-input" id="fbInput" type="date" value="${currentVal || ''}">`;
    }
    if (field.type === 'datetime') {
      return `<input class="field-input" id="fbInput" type="datetime-local" value="${currentVal || ''}">`;
    }
    if (field.type === 'select') {
      return `
        <div class="custom-select" id="fbCustomSelect" data-value="${currentVal || ''}">
          <button type="button" class="custom-select-btn ${!currentVal ? 'is-placeholder' : ''}" id="fbSelectBtn">
            <span id="fbSelectLabel">${currentVal || 'یکی رو انتخاب کن'}</span>
            <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="custom-select-list" id="fbSelectList" style="display:none;">
            ${field.options.map((o) => `<button type="button" class="custom-select-option ${o === currentVal ? 'is-selected' : ''}" data-value="${o}">${o}</button>`).join('')}
          </div>
        </div>`;
    }
    if (field.type === 'select-dependent') {
      const depVal = state.values[field.dependsOn];
      const opts = (field.optionsMap[depVal] || []);
      return `
        <div class="custom-select" id="fbCustomSelect" data-value="${currentVal || ''}">
          <button type="button" class="custom-select-btn ${!currentVal ? 'is-placeholder' : ''}" id="fbSelectBtn">
            <span id="fbSelectLabel">${currentVal || 'یکی رو انتخاب کن'}</span>
            <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="custom-select-list" id="fbSelectList" style="display:none;">
            ${opts.length
              ? opts.map((o) => `<button type="button" class="custom-select-option ${o === currentVal ? 'is-selected' : ''}" data-value="${o}">${o}</button>`).join('')
              : `<div class="custom-select-empty">اول مرحله قبل رو تکمیل کن</div>`}
          </div>
        </div>`;
    }
    if (field.type === 'number') {
      const min = field.min ?? 0;
      const max = field.max ?? 100;
      const val = currentVal !== undefined && currentVal !== '' ? currentVal : min;
      return `
        <div class="number-field">
          <input type="range" id="fbRange" min="${min}" max="${max}" value="${val}">
          <input type="number" class="number-box" id="fbInput" min="${min}" max="${max}" value="${val}">
        </div>`;
    }
    if (field.type === 'stepper') {
      const counts = state.stepperCounts[field.key] || {};
      return `
        <div class="stepper-list" id="fbStepperList">
          ${field.items.map((it) => `
            <div class="stepper-row" data-key="${it.key}">
              <span class="st-icon">${it.icon}</span>
              <span class="st-label">${it.label}</span>
              <div class="stepper-controls">
                <button type="button" class="stepper-btn" data-action="dec">−</button>
                <span class="stepper-count" data-count>${counts[it.key] || 0}</span>
                <button type="button" class="stepper-btn" data-action="inc">+</button>
              </div>
            </div>
          `).join('')}
        </div>`;
    }
    if (field.type === 'tag-list') {
      const tags = state.tagItems[field.key] || [];
      return `
        <div class="tag-input-row">
          <input class="field-input" id="fbTagInput" type="text" placeholder="اسم عضو را بنویس...">
          <button type="button" class="tag-add-btn" id="fbTagAdd">+</button>
        </div>
        <div class="tag-list" id="fbTagList">
          ${tags.length
            ? tags.map((t, i) => `<span class="tag-chip">${t}<button type="button" data-remove="${i}">×</button></span>`).join('')
            : '<span class="tag-empty-hint">هنوز عضوی اضافه نشده</span>'}
        </div>`;
    }
    // default: text
    return `<input class="field-input" id="fbInput" type="text" value="${(currentVal || '').toString().replace(/"/g, '&quot;')}" placeholder="اینجا بنویس...">`;
  }

  function wireFieldEvents(field) {
    if (field.type === 'number') {
      const range = document.getElementById('fbRange');
      const box = document.getElementById('fbInput');
      range.addEventListener('input', () => { box.value = range.value; });
      box.addEventListener('input', () => { range.value = box.value; });
    }
    if (field.type === 'stepper') {
      if (!state.stepperCounts[field.key]) state.stepperCounts[field.key] = {};
      const counts = state.stepperCounts[field.key];
      document.querySelectorAll('#fbStepperList .stepper-row').forEach((row) => {
        const key = row.getAttribute('data-key');
        row.querySelectorAll('.stepper-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const current = counts[key] || 0;
            const next = btn.getAttribute('data-action') === 'inc' ? current + 1 : Math.max(0, current - 1);
            counts[key] = next;
            row.querySelector('[data-count]').textContent = next;
          });
        });
      });
    }
    if (field.type === 'tag-list') {
      if (!state.tagItems[field.key]) state.tagItems[field.key] = [];
      const tags = state.tagItems[field.key];
      const input = document.getElementById('fbTagInput');
      const listEl = document.getElementById('fbTagList');

      function redrawTags() {
        listEl.innerHTML = tags.length
          ? tags.map((t, i) => `<span class="tag-chip">${t}<button type="button" data-remove="${i}">×</button></span>`).join('')
          : '<span class="tag-empty-hint">هنوز عضوی اضافه نشده</span>';
        listEl.querySelectorAll('[data-remove]').forEach((btn) => {
          btn.addEventListener('click', () => {
            tags.splice(Number(btn.getAttribute('data-remove')), 1);
            redrawTags();
          });
        });
      }

      function addTag() {
        const val = input.value.trim();
        if (!val) return;
        tags.push(val);
        input.value = '';
        redrawTags();
        input.focus();
      }

      document.getElementById('fbTagAdd').addEventListener('click', addTag);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addTag(); }
      });
      redrawTags();
    }
    if (field.type === 'select' || field.type === 'select-dependent') {
      const wrap = document.getElementById('fbCustomSelect');
      const btn = document.getElementById('fbSelectBtn');
      const list = document.getElementById('fbSelectList');
      const label = document.getElementById('fbSelectLabel');

      btn.addEventListener('click', () => {
        const willOpen = list.style.display === 'none';
        list.style.display = willOpen ? 'block' : 'none';
        wrap.classList.toggle('is-open', willOpen);
      });

      list.querySelectorAll('.custom-select-option').forEach((opt) => {
        opt.addEventListener('click', () => {
          const val = opt.getAttribute('data-value');
          wrap.setAttribute('data-value', val);
          label.textContent = val;
          btn.classList.remove('is-placeholder');
          list.querySelectorAll('.custom-select-option').forEach((o) => o.classList.remove('is-selected'));
          opt.classList.add('is-selected');
          list.style.display = 'none';
          wrap.classList.remove('is-open');
        });
      });
    }
  }

  function readFieldValue(field) {
    if (field.type === 'stepper') {
      return stepperSummary(field.items, state.stepperCounts[field.key] || {});
    }
    if (field.type === 'tag-list') {
      return (state.tagItems[field.key] || []).join('، ');
    }
    if (field.type === 'select' || field.type === 'select-dependent') {
      const wrap = document.getElementById('fbCustomSelect');
      return wrap ? wrap.getAttribute('data-value') || '' : '';
    }
    const el = document.getElementById('fbInput');
    return el ? el.value.trim() : '';
  }

  function fieldHasValue(field) {
    if (field.type === 'stepper') {
      const counts = state.stepperCounts[field.key] || {};
      return Object.values(counts).some((c) => c > 0);
    }
    if (field.type === 'tag-list') {
      return (state.tagItems[field.key] || []).length > 0;
    }
    if (field.type === 'select' || field.type === 'select-dependent') {
      const wrap = document.getElementById('fbCustomSelect');
      return !!(wrap && wrap.getAttribute('data-value'));
    }
    const el = document.getElementById('fbInput');
    return el && el.value.trim().length > 0;
  }

  function renderWizard() {
    const { form, step, values } = state;
    const totalSteps = form.fields.length;

    if (step < totalSteps) {
      const field = form.fields[step];
      const pct = Math.round((step / (totalSteps + 1)) * 100);
      const currentVal = values[field.key];

      wizardBox.innerHTML = `
        <button class="wizard-back" id="fbBackToPicker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6l6 6-6 6"/></svg>
          انتخاب فرم دیگر
        </button>
        <div class="wizard-progress">مرحله ${step + 1} از ${totalSteps} — ${form.title}</div>
        <div class="wizard-track"><div class="wizard-track-fill" style="width:${pct}%"></div></div>
        <div class="field-group">
          <label class="field-label">${field.label}</label>
          ${fieldInputHtml(field, currentVal)}
          ${field.hint ? `<span class="field-hint">${field.hint}</span>` : ''}
        </div>
        <div class="wizard-actions">
          ${step > 0 ? `<button class="btn btn-ghost" id="fbPrev">بازگشت</button>` : ''}
          <button class="btn btn-gold" id="fbNext">${step === totalSteps - 1 ? 'تکمیل فرم ✅' : 'بعدی ←'}</button>
        </div>
      `;

      wireFieldEvents(field);

      document.getElementById('fbBackToPicker').addEventListener('click', backToPicker);
      if (step > 0) {
        document.getElementById('fbPrev').addEventListener('click', () => {
          values[field.key] = readFieldValue(field);
          state.step -= 1;
          renderWizard();
        });
      }
      document.getElementById('fbNext').addEventListener('click', () => {
        if (!fieldHasValue(field)) {
          showToast('⚠️ این بخش خالیه، پرش کن');
          return;
        }
        values[field.key] = readFieldValue(field);
        state.step += 1;
        renderWizard();
      });
    } else {
      const text = form.compile(values);
      wizardBox.innerHTML = `
        <button class="wizard-back" id="fbBackToPicker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6l6 6-6 6"/></svg>
          انتخاب فرم دیگر
        </button>
        <div class="wizard-progress">✅ فرم تکمیل شد — ${form.title}</div>
        <div class="compiled-box">${text.replace(/</g, '&lt;')}</div>
        <div class="wizard-actions">
          <button class="btn btn-ghost" id="fbEdit">✏️ ویرایش آخرین بخش</button>
          <button class="btn btn-ghost" id="fbCopy">📋 کپی متن</button>
        </div>
        <div class="wizard-actions">
          <a class="btn btn-gold" id="fbSubmit" href="https://rubika.ir/MeeSHaYaN" target="_blank" rel="noopener">📨 ثبت نهایی و ارسال به پشتیبانی</a>
        </div>
        <div class="wizard-actions">
          <button class="btn btn-ghost" id="fbRestart">🔄 ساخت یک فرم جدید</button>
        </div>
      `;

      document.getElementById('fbBackToPicker').addEventListener('click', backToPicker);
      document.getElementById('fbEdit').addEventListener('click', () => {
        state.step -= 1;
        renderWizard();
      });
      document.getElementById('fbCopy').addEventListener('click', () => {
        copyText(text);
        showToast('📋 متن کپی شد');
      });
      document.getElementById('fbSubmit').addEventListener('click', () => {
        copyText(text);
        showToast('📋 متن کپی شد؛ داخل چت پیست و ارسال کن');
      });
      document.getElementById('fbRestart').addEventListener('click', backToPicker);
    }
  }

  renderPicker();
}
