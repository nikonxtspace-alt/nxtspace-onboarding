// ===== Configuration =====
// Replace this with your Google Apps Script Web App URL after deployment
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby4r9WdSvoFWXG_IPqruRAMNZB7tf251BvH-xlwBy1WnCFEB5cpJDReSpH3j9YbMSK5iQ/exec';

// ===== State =====
let currentStep = 1;
const totalSteps = 4;

// ===== Step Navigation =====
function nextStep(from) {
  if (!validateStep(from)) return;

  if (from === 3) {
    submitRegistration();
    return;
  }

  currentStep = from + 1;
  showStep(currentStep);
}

function prevStep(from) {
  currentStep = from - 1;
  showStep(currentStep);
}

function showStep(step) {
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');

  // Update progress bar
  const fill = document.getElementById('progressFill');
  fill.style.width = `${(step / totalSteps) * 100}%`;

  // Update step indicators
  document.querySelectorAll('.step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    if (s === step) el.classList.add('active');
    if (s < step) el.classList.add('completed');
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Validation =====
function validateStep(step) {
  switch (step) {
    case 1:
      return validatePersonalData();
    case 2:
      return validateCoC();
    case 3:
      return validatePrivacy();
    default:
      return true;
  }
}

function validatePersonalData() {
  let valid = true;

  const vorname = document.getElementById('vorname');
  const nachname = document.getElementById('nachname');
  const email = document.getElementById('email');
  const campusId = document.getElementById('campusId');

  // Vorname
  if (!vorname.value.trim()) {
    setError(vorname, 'vornameError', 'Bitte gib deinen Vornamen ein.');
    valid = false;
  } else {
    setValid(vorname, 'vornameError');
  }

  // Nachname
  if (!nachname.value.trim()) {
    setError(nachname, 'nachnameError', 'Bitte gib deinen Nachnamen ein.');
    valid = false;
  } else {
    setValid(nachname, 'nachnameError');
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    setError(email, 'emailError', 'Bitte gib deine E-Mail-Adresse ein.');
    valid = false;
  } else if (!emailRegex.test(email.value.trim())) {
    setError(email, 'emailError', 'Bitte gib eine gültige E-Mail-Adresse ein.');
    valid = false;
  } else {
    setValid(email, 'emailError');
  }

  // Campus ID
  if (!campusId.value.trim()) {
    setError(campusId, 'campusIdError', 'Bitte gib deine Campus ID ein.');
    valid = false;
  } else {
    setValid(campusId, 'campusIdError');
  }

  return valid;
}

function validateCoC() {
  const checkbox = document.getElementById('cocAccept');
  const error = document.getElementById('cocError');

  if (!checkbox.checked) {
    error.textContent = 'Bitte stimme dem Code of Conduct zu.';
    return false;
  }

  error.textContent = '';
  return true;
}

function validatePrivacy() {
  const checkbox = document.getElementById('privacyAccept');
  const error = document.getElementById('privacyError');

  if (!checkbox.checked) {
    error.textContent = 'Bitte stimme den Datenschutzbestimmungen zu.';
    return false;
  }

  error.textContent = '';
  return true;
}

function setError(input, errorId, message) {
  input.classList.remove('valid');
  input.classList.add('invalid');
  document.getElementById(errorId).textContent = message;
}

function setValid(input, errorId) {
  input.classList.remove('invalid');
  input.classList.add('valid');
  document.getElementById(errorId).textContent = '';
}

// ===== Clear validation on input =====
document.querySelectorAll('.form-group input').forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('invalid');
    const errorEl = input.parentElement.querySelector('.error-message');
    if (errorEl) errorEl.textContent = '';
  });
});

// ===== Submit Registration =====
async function submitRegistration() {
  const btn = document.querySelector('#step3 .btn-primary');
  const originalText = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span>Sende...';
  btn.disabled = true;

  const data = {
    vorname: document.getElementById('vorname').value.trim(),
    nachname: document.getElementById('nachname').value.trim(),
    email: document.getElementById('email').value.trim(),
    campusId: document.getElementById('campusId').value.trim(),
    cocAccepted: true,
    privacyAccepted: true,
    timestamp: new Date().toISOString()
  };

  try {
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
      // Demo mode: simulate success if URL not configured
      console.log('Demo-Modus: Daten würden gesendet werden:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    // Show success
    document.getElementById('confirmEmail').textContent = data.email;
    currentStep = 4;
    showStep(4);
    showToast('Registrierung erfolgreich!', 'success');
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    showToast('Fehler bei der Registrierung. Bitte versuche es erneut.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// ===== Reset Form =====
function resetForm() {
  document.getElementById('vorname').value = '';
  document.getElementById('nachname').value = '';
  document.getElementById('email').value = '';
  document.getElementById('campusId').value = '';
  document.getElementById('cocAccept').checked = false;
  document.getElementById('privacyAccept').checked = false;

  // Clear validation states
  document.querySelectorAll('.form-group input').forEach(input => {
    input.classList.remove('valid', 'invalid');
  });
  document.querySelectorAll('.error-message').forEach(el => {
    el.textContent = '';
  });

  currentStep = 1;
  showStep(1);
}

// ===== Toast Notification =====
function showToast(message, type = 'error') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
