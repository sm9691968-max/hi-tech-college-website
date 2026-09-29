const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const themeToggle = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let savedTheme = null;

try {
  savedTheme = localStorage.getItem('hi-tech-theme');
} catch {
  savedTheme = null;
}

document.documentElement.dataset.theme = savedTheme || (systemTheme.matches ? 'dark' : 'light');

function updateThemeToggle() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  if (!themeToggle) return;
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  themeToggle.innerHTML = `<span aria-hidden="true">${isDark ? '☼' : '◐'}</span><span>${isDark ? 'Light' : 'Dark'} mode</span>`;
}

updateThemeToggle();

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  try {
    localStorage.setItem('hi-tech-theme', nextTheme);
  } catch {
  }
  updateThemeToggle();
});

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    siteNav.classList.toggle('is-open', !isOpen);
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      siteNav.classList.remove('is-open');
    }
  });
}

const filterButtons = document.querySelectorAll('.filter-button');
const programCards = document.querySelectorAll('.program-card');
const courseCards = document.querySelectorAll('.course-card');
const courseGrid = document.querySelector('#course-grid');
const programCount = document.querySelector('.program-count');
const emptyState = document.querySelector('#empty-state');
const courseSearch = document.querySelector('#course-search');
const courseSort = document.querySelector('#course-sort');
const favoritesOnlyButton = document.querySelector('#favorites-only');
const favoriteCount = document.querySelector('#favorite-count');
const compareButton = document.querySelector('#compare-courses');
const compareCount = document.querySelector('#compare-count');
const compareDialog = document.querySelector('#compare-dialog');
const compareTableWrap = document.querySelector('#compare-table-wrap');
const toggleOutlinesButton = document.querySelector('#toggle-outlines');
const exportCatalogButton = document.querySelector('#export-catalog');
let activeFilter = 'all';
let favorites = new Set();
let favoritesOnly = false;
let compareSelection = new Set();

try {
  const savedFavorites = JSON.parse(localStorage.getItem('hi-tech-favorite-courses'));
  if (Array.isArray(savedFavorites)) favorites = new Set(savedFavorites);
} catch {
  favorites = new Set();
}

function updateCourseTools() {
  if (favoriteCount) favoriteCount.textContent = String(favorites.size);
  if (favoritesOnlyButton) {
    favoritesOnlyButton.setAttribute('aria-pressed', String(favoritesOnly));
    favoritesOnlyButton.classList.toggle('active', favoritesOnly);
  }
  if (compareCount) compareCount.textContent = String(compareSelection.size);
  if (compareButton) compareButton.disabled = compareSelection.size < 2;

  courseCards.forEach((card) => {
    const favoriteButton = card.querySelector('.course-bookmark');
    const compareToggle = card.querySelector('.course-compare-toggle');
    const isFavorite = favorites.has(card.id);
    const isCompared = compareSelection.has(card.id);
    favoriteButton.setAttribute('aria-pressed', String(isFavorite));
    favoriteButton.setAttribute('aria-label', `${isFavorite ? 'Remove' : 'Save'} ${card.querySelector('h3').textContent} ${isFavorite ? 'from' : 'to'} saved courses`);
    favoriteButton.textContent = isFavorite ? '★' : '☆';
    compareToggle.setAttribute('aria-pressed', String(isCompared));
    compareToggle.textContent = isCompared ? 'Selected' : 'Compare';
    compareToggle.disabled = compareSelection.size >= 3 && !isCompared;
  });
}

function updateProgramList() {
  if (!programCount || !emptyState) return;
  const query = courseSearch?.value.trim().toLowerCase() || '';
  let visibleCount = 0;

  programCards.forEach((card) => {
    const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchesSearch = !query || card.textContent.toLowerCase().includes(query);
    const matchesFavorites = !favoritesOnly || !card.classList.contains('course-card') || favorites.has(card.id);
    const isVisible = matchesCategory && matchesSearch && matchesFavorites;
    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
  });

  if (courseGrid && courseSort) {
    const sortValue = courseSort.value;
    const sortedCards = [...courseCards].sort((left, right) => {
      if (sortValue === 'duration') return Number(left.dataset.durationYears) - Number(right.dataset.durationYears) || left.querySelector('h3').textContent.localeCompare(right.querySelector('h3').textContent);
      if (sortValue === 'category') return left.dataset.category.localeCompare(right.dataset.category) || left.querySelector('h3').textContent.localeCompare(right.querySelector('h3').textContent);
      return left.querySelector('h3').textContent.localeCompare(right.querySelector('h3').textContent);
    });
    sortedCards.forEach((card) => courseGrid.append(card));
  }

  const itemLabel = programCount.dataset.itemLabel || 'program';
  programCount.textContent = `${String(visibleCount).padStart(2, '0')} ${itemLabel}${visibleCount === 1 ? '' : 's'}`;
  emptyState.hidden = visibleCount !== 0;
  updateCourseTools();
}

courseCards.forEach((card) => {
  const controls = document.createElement('div');
  const favoriteButton = document.createElement('button');
  const compareToggle = document.createElement('button');
  controls.className = 'course-card-actions';
  favoriteButton.type = 'button';
  favoriteButton.className = 'course-bookmark';
  favoriteButton.setAttribute('aria-pressed', 'false');
  compareToggle.type = 'button';
  compareToggle.className = 'course-compare-toggle';
  compareToggle.setAttribute('aria-pressed', 'false');
  controls.append(favoriteButton, compareToggle);
  card.insertBefore(controls, card.querySelector('.course-action'));
});

courseGrid?.addEventListener('click', (event) => {
  const card = event.target.closest('.course-card');
  if (!card) return;

  if (event.target.closest('.course-bookmark')) {
    if (favorites.has(card.id)) favorites.delete(card.id);
    else favorites.add(card.id);
    try {
      localStorage.setItem('hi-tech-favorite-courses', JSON.stringify([...favorites]));
    } catch {
    }
    updateProgramList();
  }

  if (event.target.closest('.course-compare-toggle')) {
    if (compareSelection.has(card.id)) compareSelection.delete(card.id);
    else if (compareSelection.size < 3) compareSelection.add(card.id);
    updateCourseTools();
  }
});

favoritesOnlyButton?.addEventListener('click', () => {
  favoritesOnly = !favoritesOnly;
  updateProgramList();
});

courseSort?.addEventListener('change', updateProgramList);
exportCatalogButton?.addEventListener('click', () => {
  const csvCell = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [['Course', 'Subject area', 'Sample duration', 'Topics']];
  courseCards.forEach((card) => rows.push([
    card.querySelector('h3').textContent.trim(),
    card.dataset.category,
    `${card.dataset.durationYears} years`,
    card.querySelector('.course-topics').textContent.trim().replaceAll('\n', ' '),
  ]));
  downloadFile('hi-tech-course-guide.csv', rows.map((row) => row.map(csvCell).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
});

toggleOutlinesButton?.addEventListener('click', () => {
  const shouldExpand = toggleOutlinesButton.getAttribute('aria-pressed') !== 'true';
  document.querySelectorAll('.course-details').forEach((outline) => { outline.open = shouldExpand; });
  toggleOutlinesButton.setAttribute('aria-pressed', String(shouldExpand));
  toggleOutlinesButton.textContent = shouldExpand ? 'Collapse outlines' : 'Expand outlines';
});

function renderComparison() {
  if (!compareTableWrap) return;
  compareTableWrap.replaceChildren();
  const selectedCards = [...courseCards].filter((card) => compareSelection.has(card.id));
  const table = document.createElement('table');
  const header = document.createElement('tr');
  const blankHeader = document.createElement('th');
  blankHeader.scope = 'col';
  header.append(blankHeader);
  selectedCards.forEach((card) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = card.querySelector('h3').textContent;
    header.append(cell);
  });
  const thead = document.createElement('thead');
  thead.append(header);
  const tbody = document.createElement('tbody');
  const comparisonRows = [
    ['Subject area', (card) => card.dataset.category],
    ['Sample length', (card) => `${card.dataset.durationYears} years`],
    ['Topics', (card) => card.querySelector('.course-topics').textContent.trim().replaceAll('\n', ', ')],
    ['Project example', (card) => card.querySelector('.course-details > div').textContent.trim()],
  ];
  comparisonRows.forEach(([label, getValue]) => {
    const row = document.createElement('tr');
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = label;
    row.append(heading);
    selectedCards.forEach((card) => {
      const cell = document.createElement('td');
      cell.textContent = getValue(card);
      row.append(cell);
    });
    tbody.append(row);
  });
  table.append(thead, tbody);
  compareTableWrap.append(table);
}

compareButton?.addEventListener('click', () => {
  if (compareSelection.size < 2) return;
  renderComparison();
  compareDialog.showModal();
});

document.querySelector('#compare-close')?.addEventListener('click', () => compareDialog.close());

function downloadFile(filename, content, contentType) {
  const file = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filter) => {
      const isActive = filter === button;
      filter.classList.toggle('active', isActive);
      filter.setAttribute('aria-pressed', String(isActive));
    });
    updateProgramList();
  });
});

courseSearch?.addEventListener('input', updateProgramList);

const inquiryForm = document.querySelector('#inquiry-form');
const formMessage = document.querySelector('#form-message');

inquiryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!inquiryForm.reportValidity()) return;
  const firstName = new FormData(inquiryForm).get('firstName');
  formMessage.textContent = `Thanks, ${firstName}. Your inquiry is ready. This demo doesn't send it to the college.`;
  inquiryForm.reset();
});

const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('#login-message');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('#password-toggle');

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;
  loginMessage.textContent = 'This is a preview form. Connect a student portal service to enable sign-in.';
});

passwordToggle?.addEventListener('click', () => {
  const isPasswordVisible = passwordInput.type === 'text';
  passwordInput.type = isPasswordVisible ? 'password' : 'text';
  passwordToggle.textContent = isPasswordVisible ? 'Show' : 'Hide';
  passwordToggle.setAttribute('aria-pressed', String(!isPasswordVisible));
});

const applicationChecklist = document.querySelector('#application-checklist');
if (applicationChecklist) {
  const checklistItems = applicationChecklist.querySelectorAll('input[type="checkbox"]');
  const checklistProgress = document.querySelector('#checklist-progress');
  const checklistStatus = document.querySelector('#checklist-status');
  const updateChecklist = () => {
    const completed = applicationChecklist.querySelectorAll('input[type="checkbox"]:checked').length;
    checklistProgress.value = completed;
    checklistStatus.textContent = `${completed} of ${checklistItems.length} steps checked`;
  };
  checklistItems.forEach((item) => item.addEventListener('change', updateChecklist));
  updateChecklist();
}

const revealTargets = document.querySelectorAll('main > section:not(.hero), .program-card, .research-teaser, .space-card, .research-area, .process-grid > article');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroVideo = document.querySelector('#hero-video');
const heroVideoToggle = document.querySelector('#hero-video-toggle');

function updateHeroVideoControl() {
  if (!heroVideo || !heroVideoToggle) return;
  const isPlaying = !heroVideo.paused;
  heroVideoToggle.setAttribute('aria-pressed', String(isPlaying));
  heroVideoToggle.setAttribute('aria-label', `${isPlaying ? 'Pause' : 'Play'} intro video`);
  heroVideoToggle.innerHTML = `<span aria-hidden="true">${isPlaying ? 'Ⅱ' : '▶'}</span><span>${isPlaying ? 'Pause' : 'Play'} video</span>`;
}

if (heroVideo && heroVideoToggle) {
  heroVideo.addEventListener('play', updateHeroVideoControl);
  heroVideo.addEventListener('pause', updateHeroVideoControl);
  heroVideo.addEventListener('ended', updateHeroVideoControl);
  heroVideoToggle.addEventListener('click', () => {
    if (heroVideo.paused) heroVideo.play().catch(() => updateHeroVideoControl());
    else heroVideo.pause();
  });
  heroVideo.pause();
  updateHeroVideoControl();
}

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

  revealTargets.forEach((target, index) => {
    target.classList.add('scroll-reveal');
    target.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`);
    revealObserver.observe(target);
  });
}

const portalTabs = document.querySelectorAll('[data-portal-tab]');
const portalPanels = document.querySelectorAll('[data-portal-panel]');

function showPortalPanel(panelName) {
  portalTabs.forEach((tab) => {
    const isActive = tab.dataset.portalTab === panelName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', String(isActive));
  });
  portalPanels.forEach((panel) => {
    panel.hidden = panel.dataset.portalPanel !== panelName;
  });
}

portalTabs.forEach((tab) => {
  tab.addEventListener('click', () => showPortalPanel(tab.dataset.portalTab));
});

document.querySelectorAll('[data-open-portal-tab]').forEach((link) => {
  link.addEventListener('click', () => showPortalPanel(link.dataset.openPortalTab));
});

const registrationForm = document.querySelector('#registration-form');
const registrationList = document.querySelector('#registration-list');
const registrationCount = document.querySelector('#registration-count');
const registrationMessage = document.querySelector('#registration-message');
const availableCourses = ['Computer Science', 'Digital Design', 'Data & AI', 'Business Innovation', 'Cybersecurity & Digital Trust', 'Software Engineering', 'Information Systems', 'Cloud Systems Engineering', 'Product & Service Design', 'Interaction & Game Design', 'Creative Computing', 'Business Analytics', 'Entrepreneurship & Venture Design', 'Sustainable Technology'];
const defaultPlannedCourses = [
  { name: 'Computer Science', type: 'CORE' },
  { name: 'Digital Design', type: 'ELECTIVE' },
];
let plannedCourses = defaultPlannedCourses;

try {
  const savedCourses = JSON.parse(localStorage.getItem('hi-tech-planned-courses'));
  if (Array.isArray(savedCourses)) {
    plannedCourses = savedCourses.filter((course) => course && availableCourses.includes(course.name));
  }
} catch {
  plannedCourses = defaultPlannedCourses;
}

function savePlannedCourses() {
  try {
    localStorage.setItem('hi-tech-planned-courses', JSON.stringify(plannedCourses));
  } catch {
  }
}

function renderPlannedCourses() {
  if (!registrationList || !registrationCount) return;
  registrationList.replaceChildren();
  plannedCourses.forEach((course) => {
    const item = document.createElement('li');
    const name = document.createElement('span');
    const type = document.createElement('b');
    const removeButton = document.createElement('button');
    item.dataset.course = course.name;
    name.textContent = course.name;
    type.textContent = course.type;
    removeButton.type = 'button';
    removeButton.dataset.removeCourse = course.name;
    removeButton.setAttribute('aria-label', `Remove ${course.name}`);
    removeButton.textContent = '×';
    item.append(name, type, removeButton);
    registrationList.append(item);
  });
  registrationCount.textContent = `${plannedCourses.length} selected`;
}

renderPlannedCourses();

registrationList?.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove-course]');
  if (!removeButton) return;
  const courseName = removeButton.dataset.removeCourse;
  plannedCourses = plannedCourses.filter((course) => course.name !== courseName);
  savePlannedCourses();
  renderPlannedCourses();
  registrationMessage.textContent = `${courseName} was removed from this browser preview.`;
});

registrationForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!registrationForm.reportValidity()) return;
  const courseName = new FormData(registrationForm).get('course');
  const alreadyPlanned = plannedCourses.some((course) => course.name === courseName);

  if (alreadyPlanned) {
    registrationMessage.textContent = `${courseName} is already in this preview schedule.`;
    return;
  }

  plannedCourses.push({ name: courseName, type: 'PREVIEW' });
  savePlannedCourses();
  renderPlannedCourses();
  registrationMessage.textContent = `${courseName} was added to the local preview only.`;
  registrationForm.reset();
});

const taskRows = document.querySelectorAll('[data-task-id]');
const taskFilterButtons = document.querySelectorAll('[data-task-filter]');
let completedTasks = [];
let activeTaskFilter = 'all';

try {
  const savedTasks = JSON.parse(localStorage.getItem('hi-tech-completed-tasks'));
  if (Array.isArray(savedTasks)) completedTasks = savedTasks;
} catch {
  completedTasks = [];
}

taskRows.forEach((row) => {
  const taskId = row.dataset.taskId;
  const completeButton = row.querySelector('[data-task-complete]');

  const setCompleted = (isComplete) => {
    row.classList.toggle('is-complete', isComplete);
    completeButton.setAttribute('aria-pressed', String(isComplete));
    completeButton.textContent = isComplete ? 'Completed' : 'Mark done';
  };

  setCompleted(completedTasks.includes(taskId));
  completeButton.addEventListener('click', () => {
    const isComplete = completeButton.getAttribute('aria-pressed') !== 'true';
    completedTasks = isComplete
      ? [...completedTasks, taskId]
      : completedTasks.filter((completedTask) => completedTask !== taskId);
    setCompleted(isComplete);
    try {
      localStorage.setItem('hi-tech-completed-tasks', JSON.stringify(completedTasks));
    } catch {
    }
    updateTaskFilter(activeTaskFilter);
  });
});

function updateTaskFilter(filter) {
  activeTaskFilter = filter;
  taskFilterButtons.forEach((button) => {
    const isActive = button.dataset.taskFilter === filter;
    button.setAttribute('aria-pressed', String(isActive));
    button.classList.toggle('active', isActive);
  });
  taskRows.forEach((row) => {
    const isComplete = completedTasks.includes(row.dataset.taskId);
    row.hidden = filter === 'done' ? !isComplete : filter === 'open' ? isComplete : false;
  });
}

taskFilterButtons.forEach((button) => {
  button.addEventListener('click', () => updateTaskFilter(button.dataset.taskFilter));
});
updateTaskFilter('all');

const applicantStepInputs = document.querySelectorAll('[data-applicant-step]');
const applicantProgress = document.querySelector('#applicant-progress');
const applicantProgressLabel = document.querySelector('#applicant-progress-label');

try {
  const savedApplicantSteps = JSON.parse(localStorage.getItem('hi-tech-applicant-steps'));
  if (Array.isArray(savedApplicantSteps) && savedApplicantSteps.length === applicantStepInputs.length) {
    applicantStepInputs.forEach((input, index) => { input.checked = Boolean(savedApplicantSteps[index]); });
  }
} catch {
}

function updateApplicantProgress() {
  if (!applicantProgress || !applicantProgressLabel) return;
  const completed = [...applicantStepInputs].filter((input) => input.checked).length;
  applicantProgress.value = completed;
  applicantProgressLabel.textContent = `${completed} of ${applicantStepInputs.length} steps complete`;
  applicantStepInputs.forEach((input) => {
    input.closest('li').classList.toggle('step-complete', input.checked);
    input.closest('li').classList.toggle('step-current', !input.checked && [...applicantStepInputs].slice(0, [...applicantStepInputs].indexOf(input)).every((step) => step.checked));
  });
}

applicantStepInputs.forEach((input) => {
  input.addEventListener('change', () => {
    updateApplicantProgress();
    try {
      localStorage.setItem('hi-tech-applicant-steps', JSON.stringify([...applicantStepInputs].map((step) => step.checked)));
    } catch {
    }
  });
});
updateApplicantProgress();

const scheduleWeekLabel = document.querySelector('#schedule-week-label');
const scheduleRows = document.querySelectorAll('.schedule-row[data-weekday]');
let scheduleWeekOffset = 0;

function renderScheduleWeek() {
  if (!scheduleWeekLabel) return;
  const today = new Date();
  const daysAfterMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAfterMonday + scheduleWeekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const formatLabelDate = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  scheduleWeekLabel.textContent = `${formatLabelDate(monday)} – ${formatLabelDate(sunday)}`;

  scheduleRows.forEach((row) => {
    const classDate = new Date(monday);
    classDate.setDate(monday.getDate() + Number(row.dataset.weekday) - 1);
    const localDate = [classDate.getFullYear(), String(classDate.getMonth() + 1).padStart(2, '0'), String(classDate.getDate()).padStart(2, '0')].join('-');
    row.dataset.date = localDate;
    row.querySelector('.schedule-day').textContent = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(classDate).toUpperCase();
    row.querySelector('.schedule-date').textContent = String(classDate.getDate()).padStart(2, '0');
  });
}

document.querySelectorAll('[data-week-shift]').forEach((button) => {
  button.addEventListener('click', () => {
    scheduleWeekOffset += Number(button.dataset.weekShift);
    renderScheduleWeek();
  });
});

renderScheduleWeek();

document.querySelector('#export-schedule')?.addEventListener('click', () => {
  const escapeCalendarText = (value) => value.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n');
  const formatCalendarDate = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('');
  const events = [...scheduleRows].map((row) => {
    const classDate = new Date(`${row.dataset.date}T00:00:00`);
    const [hours, minutes] = row.querySelector('.schedule-time').textContent.split(':').map(Number);
    classDate.setHours(hours, minutes, 0, 0);
    const start = formatCalendarDate(classDate) + `T${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;
    const duration = Number.parseInt(row.querySelector('.schedule-duration').textContent, 10);
    const endDate = new Date(classDate.getTime() + duration * 60000);
    const end = formatCalendarDate(endDate) + `T${String(endDate.getHours()).padStart(2, '0')}${String(endDate.getMinutes()).padStart(2, '0')}00`;
    const title = row.querySelector('b').textContent;
    const description = row.querySelector('div span').textContent;
    return ['BEGIN:VEVENT', `UID:${row.dataset.weekday}-${row.dataset.date}@hitechcollege.example`, `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${escapeCalendarText(title)}`, `DESCRIPTION:${escapeCalendarText(description)}`, 'END:VEVENT'].join('\r\n');
  });
  const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hi-Tech College//Student Preview//EN', ...events, 'END:VCALENDAR'].join('\r\n');
  downloadFile('hi-tech-weekly-timetable.ics', calendar, 'text/calendar;charset=utf-8');
});

document.querySelector('#reset-portal-preview')?.addEventListener('click', () => {
  ['hi-tech-planned-courses', 'hi-tech-completed-tasks', 'hi-tech-applicant-steps'].forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
    }
  });
  window.location.reload();
});

const photoDialog = document.querySelector('#photo-dialog');
const photoDialogImage = document.querySelector('#photo-dialog-image');
const photoCaption = document.querySelector('#photo-caption');

document.querySelectorAll('[data-gallery-image]').forEach((photoButton) => {
  photoButton.addEventListener('click', () => {
    photoDialogImage.src = photoButton.dataset.galleryImage;
    photoDialogImage.alt = photoButton.dataset.galleryAlt;
    photoCaption.textContent = photoButton.dataset.galleryCaption;
    photoDialog.showModal();
  });
});

photoDialog?.addEventListener('click', (event) => {
  if (event.target === photoDialog) photoDialog.close();
});

const eventCards = [...document.querySelectorAll('.event-row')];
const eventSearch = document.querySelector('#event-search');
const eventCount = document.querySelector('#event-count');
const eventEmpty = document.querySelector('#event-empty');
const myEventsToggle = document.querySelector('#my-events-toggle');
const myEventCount = document.querySelector('#my-event-count');
const exportEventsButton = document.querySelector('#export-events');
const eventFilterButtons = document.querySelectorAll('[data-event-filter]');
let activeEventFilter = 'all';
let myEventsOnly = false;
let registeredEventIds = new Set();

try {
  const savedEvents = JSON.parse(localStorage.getItem('hi-tech-event-rsvps'));
  if (Array.isArray(savedEvents)) registeredEventIds = new Set(savedEvents);
} catch {
  registeredEventIds = new Set();
}

function updateEventsList() {
  if (!eventCount || !eventEmpty) return;
  const query = eventSearch?.value.trim().toLowerCase() || '';
  let visibleCount = 0;
  eventCards.forEach((card) => {
    const matchesCategory = activeEventFilter === 'all' || card.dataset.category === activeEventFilter;
    const matchesSearch = !query || card.textContent.toLowerCase().includes(query);
    const matchesRsvp = !myEventsOnly || registeredEventIds.has(card.dataset.eventId);
    const isVisible = matchesCategory && matchesSearch && matchesRsvp;
    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
    const rsvpButton = card.querySelector('[data-rsvp]');
    const isRegistered = registeredEventIds.has(card.dataset.eventId);
    rsvpButton.setAttribute('aria-pressed', String(isRegistered));
    rsvpButton.classList.toggle('is-registered', isRegistered);
    rsvpButton.innerHTML = isRegistered ? 'Going <span aria-hidden="true">✓</span>' : 'RSVP <span aria-hidden="true">+</span>';
  });
  eventCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'event' : 'events'}`;
  eventEmpty.hidden = visibleCount !== 0;
  myEventCount.textContent = String(registeredEventIds.size);
  myEventsToggle.setAttribute('aria-pressed', String(myEventsOnly));
  myEventsToggle.classList.toggle('active', myEventsOnly);
  exportEventsButton.disabled = registeredEventIds.size === 0;
}

eventFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeEventFilter = button.dataset.eventFilter;
    eventFilterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.setAttribute('aria-pressed', String(isActive));
      filterButton.classList.toggle('active', isActive);
    });
    updateEventsList();
  });
});

eventSearch?.addEventListener('input', updateEventsList);

document.querySelector('#event-list')?.addEventListener('click', (event) => {
  const rsvpButton = event.target.closest('[data-rsvp]');
  if (!rsvpButton) return;
  const eventId = rsvpButton.dataset.rsvp;
  if (registeredEventIds.has(eventId)) registeredEventIds.delete(eventId);
  else registeredEventIds.add(eventId);
  try {
    localStorage.setItem('hi-tech-event-rsvps', JSON.stringify([...registeredEventIds]));
  } catch {
  }
  updateEventsList();
});

myEventsToggle?.addEventListener('click', () => {
  myEventsOnly = !myEventsOnly;
  updateEventsList();
});

exportEventsButton?.addEventListener('click', () => {
  const escapeCalendarText = (value) => value.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n');
  const formatCalendarDate = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('');
  const events = eventCards.filter((card) => registeredEventIds.has(card.dataset.eventId)).map((card) => {
    const startDate = new Date(`${card.dataset.date}T${card.dataset.start}:00`);
    const endDate = new Date(`${card.dataset.date}T${card.dataset.end}:00`);
    const formatDateTime = (date) => formatCalendarDate(date) + `T${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}00`;
    return ['BEGIN:VEVENT', `UID:${card.dataset.eventId}@hitechcollege.example`, `DTSTART:${formatDateTime(startDate)}`, `DTEND:${formatDateTime(endDate)}`, `SUMMARY:${escapeCalendarText(card.querySelector('h3').textContent)}`, `DESCRIPTION:${escapeCalendarText(card.querySelector('.event-info > p').textContent)}`, `LOCATION:${escapeCalendarText(card.querySelector('.event-info > div > span').textContent)}`, 'END:VEVENT'].join('\r\n');
  });
  const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hi-Tech College//Events Preview//EN', ...events, 'END:VCALENDAR'].join('\r\n');
  downloadFile('hi-tech-campus-events.ics', calendar, 'text/calendar;charset=utf-8');
});

updateEventsList();

const updateCards = [...document.querySelectorAll('.update-item')];
const updatesSearch = document.querySelector('#updates-search');
const updatesCount = document.querySelector('#updates-count');
const updatesEmpty = document.querySelector('#updates-empty');
const updateFilterButtons = document.querySelectorAll('[data-update-filter]');
let activeUpdateFilter = 'all';

function updateNewsList() {
  if (!updatesCount || !updatesEmpty) return;
  const query = updatesSearch?.value.trim().toLowerCase() || '';
  let visibleCount = 0;
  updateCards.forEach((card) => {
    const matchesTopic = activeUpdateFilter === 'all' || card.dataset.category === activeUpdateFilter;
    const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
    const isVisible = matchesTopic && matchesQuery;
    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
  });
  updatesCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'update' : 'updates'}`;
  updatesEmpty.hidden = visibleCount !== 0;
}

updateFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeUpdateFilter = button.dataset.updateFilter;
    updateFilterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.setAttribute('aria-pressed', String(isActive));
      filterButton.classList.toggle('active', isActive);
    });
    updateNewsList();
  });
});

updatesSearch?.addEventListener('input', updateNewsList);
updateNewsList();
