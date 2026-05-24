const authShell = document.getElementById("auth-shell");
const loginView = document.getElementById("login-view");
const signupView = document.getElementById("signup-view");
const dashboardView = document.getElementById("dashboard-view");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const rememberInput = loginForm.elements.remember;

const loginMessage = document.getElementById("login-message");
const signupMessage = document.getElementById("signup-message");

const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("toggle-password");
const iconShow = togglePasswordBtn.querySelector(".icon-show");
const iconHide = togglePasswordBtn.querySelector(".icon-hide");

let currentUser = null;
const rememberedUserKey = "jarvis.rememberedUser";

function showMessage(element, text, isError = false) {
  element.textContent = text;
  element.hidden = false;
  element.classList.toggle("error", isError);
  element.classList.toggle("success", !isError);
}

function clearMessage(element) {
  element.hidden = true;
  element.textContent = "";
}

function showView(view) {
  const isDashboard = view === "dashboard";

  authShell.hidden = isDashboard;
  dashboardView.hidden = !isDashboard;
  loginView.hidden = view !== "login";
  signupView.hidden = view !== "signup";
}

function ensureApi() {
  if (!window.jarvis?.api) {
    throw new Error("API bridge unavailable. Restart the app.");
  }

  return window.jarvis.api;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function readFormField(formData, fieldName) {
  return String(formData.get(fieldName) ?? "").trim();
}

function validateUserPayload({ name, email, password }) {
  if (!name) return "Name is required.";
  if (!email) return "Email is required.";
  if (!isValidEmail(email)) return "Enter a valid email address.";
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";

  return null;
}

async function openDashboard(user) {
  currentUser = user;
  showView("dashboard");

  if (typeof window.initDashboard === "function") {
    window.initDashboard(user);
  }
}

function rememberUser(user) {
  localStorage.setItem(rememberedUserKey, JSON.stringify(user));
}

function forgetUser() {
  localStorage.removeItem(rememberedUserKey);
}

function getRememberedUser() {
  try {
    const rawUser = localStorage.getItem(rememberedUserKey);
    if (!rawUser) return null;

    const user = JSON.parse(rawUser);
    if (!user || typeof user !== "object" || !user.email) return null;

    return user;
  } catch {
    forgetUser();
    return null;
  }
}

function handleTogglePassword() {
  const isHidden = passwordInput.type === "password";

  passwordInput.type = isHidden ? "text" : "password";
  iconShow.hidden = isHidden;
  iconHide.hidden = !isHidden;
  togglePasswordBtn.setAttribute(
    "aria-label",
    isHidden ? "Hide password" : "Show password"
  );
}

function showSignup(event) {
  event.preventDefault();
  clearMessage(loginMessage);
  clearMessage(signupMessage);
  showView("signup");
}

function showLogin(event) {
  event.preventDefault();
  clearMessage(loginMessage);
  clearMessage(signupMessage);
  showView("login");
}

function logout() {
  currentUser = null;
  forgetUser();
  loginForm.reset();
  showView("login");
}

async function submitLogin(event) {
  event.preventDefault();
  clearMessage(loginMessage);

  const formData = new FormData(loginForm);

  try {
    const api = ensureApi();
    const user = await api.login({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (rememberInput.checked) {
      rememberUser(user);
    } else {
      forgetUser();
    }

    await openDashboard(user);
  } catch (error) {
    showMessage(loginMessage, error.message, true);
  }
}

async function submitSignup(event) {
  event.preventDefault();
  clearMessage(signupMessage);

  if (!signupForm.reportValidity()) return;

  const formData = new FormData(signupForm);
  const payload = {
    name: readFormField(formData, "name"),
    email: readFormField(formData, "email"),
    password: readFormField(formData, "password"),
  };

  const validationError = validateUserPayload(payload);

  if (validationError) {
    showMessage(signupMessage, validationError, true);
    return;
  }

  try {
    const api = ensureApi();

    await api.createUser(payload);
    showMessage(signupMessage, "Account created. You can log in now.", false);
    signupForm.reset();
    setTimeout(() => showView("login"), 1200);
  } catch (error) {
    showMessage(signupMessage, error.message, true);
  }
}

function preventPlaceholderLinks() {
  document
    .querySelectorAll('#auth-shell a[href="#"]:not(#show-signup):not(#show-login)')
    .forEach((link) => {
      link.addEventListener("click", (event) => event.preventDefault());
    });
}

togglePasswordBtn.addEventListener("click", handleTogglePassword);
document.getElementById("show-signup").addEventListener("click", showSignup);
document.getElementById("show-login").addEventListener("click", showLogin);
document.getElementById("logout-btn").addEventListener("click", logout);
loginForm.addEventListener("submit", submitLogin);
signupForm.addEventListener("submit", submitSignup);

preventPlaceholderLinks();

const rememberedUser = getRememberedUser();

if (rememberedUser) {
  rememberInput.checked = true;
  openDashboard(rememberedUser);
} else {
  showView("login");
}
