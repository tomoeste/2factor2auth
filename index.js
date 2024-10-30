const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const PASSWORD_CHAR = '*';
const PASSWORD_BACK = '-';

const form = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const passwordGhost = document.getElementById('password-ghost');
const remember = document.getElementById('remember');
const message = document.getElementById('message');
const heading = document.getElementById('heading');
const submit = document.getElementById('login-btn');
const helpText = document.getElementById('help-text');
const congratsCard = document.getElementById('congrats-card');
const congratsMessage = document.getElementById('congrats');
const logout = document.getElementById('logout');
const clearData = document.getElementById('clear-data');

let startTime;
let interval;
let inProgress = false;
let passwordTimes = [];

reset();

function toggleView() {
  if (form.classList.contains('hidden')) {
    heading.textContent = 'Welcome back!';
    helpText.textContent = 'Beat your fastest login time to proceed.';
  }
  form.classList.toggle('hidden');
  congratsCard.classList.toggle('hidden');
}

function reset() {
  clearInterval(interval);
  startTime = null;
  interval = null;
  inProgress = false;
  heading.textContent = 'Welcome back!';
  message.textContent = '';
  email.disabled = false;
  remember.disabled = false;
  passwordGhost.value = '';
  password.value = '';
  form.reset();
  email.focus();
  requestAnimationFrame(() => {
    if (localStorage.getItem('lastLogin'))
      email.value = localStorage.getItem('lastLogin');
    submit.textContent = 'Login';
    submit.style.fontSize = '1em';
  });
}

function startTimer() {
  if (!interval) {
    let max = 10;
    password.disabled = false;
    password.focus();
    passwordTimes = [];
    startTime = Date.now();
    const hasItem = localStorage.getItem(email.value);
    message.textContent = 'Time limit: 10 seconds';
    if (hasItem) {
      const existingUser = JSON.parse(hasItem);
      message.textContent = `Personal best: ${(
        existingUser.time / 1000
      ).toFixed(3)} seconds`;
      existingUser.passwordTimes.forEach((t) => {
        setTimeout(() => {
          if (inProgress) {
            if (t.key === '*') passwordGhost.value += t.key;
            if (t.key === '-')
              passwordGhost.value = passwordGhost.value.slice(0, -1);
          }
        }, t.time);
      });
      max = existingUser.time / 1000;
    }
    interval = setInterval(() => {
      const diff = ((Date.now() - startTime) / 1000).toFixed(3);
      submit.textContent = `🕒 0:0${diff.padStart(6, '0')}`;
      if (diff > max) {
        reset();
        heading.textContent = 'Better luck next time!';
        message.textContent = 'Just a little bit 2slow';
      }
    }, 10);
  }
}

function disableInputs(disable) {
  email.disabled = disable;
  password.disabled = disable;
}

password.addEventListener('focus', () => {
  if (!inProgress) {
    if (!email.checkValidity()) {
      email.reportValidity();
      email.focus();
      return;
    }
    inProgress = true;
    email.disabled = true;
    password.disabled = true;
    remember.disabled = true;
    submit.style.fontSize = '2em';
    submit.textContent = '🔴 ⚪ ⚪';
    message.textContent = '';
    heading.textContent = '3…';
    setTimeout(() => {
      submit.textContent = '🔴 🔴 ⚪';
      heading.textContent = '2…';
    }, 1.5e3);
    setTimeout(() => {
      submit.textContent = '🔴 🔴 🔴';
      heading.textContent = '1…';
    }, 3e3);
    setTimeout(() => {
      submit.textContent = '🟢 🟢 🟢';
      heading.textContent = 'Go!';
      setTimeout(startTimer, 200);
    }, 4.5e3);
  }
});

password.addEventListener('keydown', (event) => {
  const key = event.key;
  const time = Date.now() - startTime;
  switch (key) {
    case 'Backspace':
      passwordTimes.push({ key: PASSWORD_BACK, time });
      break;
    default:
      passwordTimes.push({ key: PASSWORD_CHAR, time });
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent default form submission

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const hasItem = localStorage.getItem(email);
  const time = Date.now() - startTime;

  if (hasItem) {
    const existingUser = JSON.parse(hasItem);
    if (existingUser.password !== password) {
      message.textContent = "Email and password don't go 2gether";
      return;
    }
    if (time < password.length * 100) {
      reset();
      message.textContent = '2fast! Try again.';
      return;
    }
    localStorage.setItem(
      email,
      JSON.stringify({
        password,
        passwordTimes,
        time,
      })
    );
    if (remember.value) localStorage.setItem('lastLogin', email);
    toggleView();
    reset();
    requestAnimationFrame(() => {
      congratsMessage.textContent = `Your new personal best is ${(
        time / 1000
      ).toFixed(3)} seconds!`;
      heading.textContent = 'A new record!';
      helpText.textContent = 'Remember 2practice…';
    });
  } else {
    localStorage.setItem(
      email,
      JSON.stringify({
        password,
        passwordTimes,
        time,
      })
    );
    if (remember.value) localStorage.setItem('lastLogin', email);
    toggleView();
    reset();
    requestAnimationFrame(() => {
      congratsMessage.textContent = `Your new personal best is ${(
        time / 1000
      ).toFixed(3)} seconds!`;
      heading.textContent = `Weclome ${email}!`;
      helpText.textContent = 'Not 2bad…';
    });
  }
});

logout.addEventListener('click', () => {
  toggleView();
});

clearData.addEventListener('click', () => {
  localStorage.clear();
  reset();
});
