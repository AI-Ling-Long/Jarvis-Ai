const EMPTY_STATES = {
  "git-activity-empty": {
    label: "No repository connected",
    text: "Git activity will appear here after you connect a project folder.",
    action: "Connect Git",
  },
  "goals-empty": {
    label: "No goals yet",
    text: "Create a daily goal to start tracking what you want to finish.",
    action: "Add Goal",
  },
  "feedback-empty": {
    label: "Waiting for real activity",
    text: "AI feedback will be generated after Jarvis has commits, goals, or task history to review.",
    action: "Configure AI",
  },
  "projects-empty": {
    label: "No projects tracked",
    text: "Projects you connect will appear here with real status and recent activity.",
    action: "Add Project",
  },
};

function getInitials(name, email) {
  if (name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  return String(email || "?").slice(0, 2).toUpperCase();
}

function getFirstName(name, email) {
  if (name) return name.split(/\s+/)[0];
  return String(email || "there").split("@")[0];
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

function formatHeaderDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function renderEmptyState(element, state) {
  element.innerHTML = `
    <div class="empty-state-icon" aria-hidden="true"></div>
    <div>
      <h4>${state.label}</h4>
      <p>${state.text}</p>
      <button type="button" class="empty-state-action">${state.action}</button>
    </div>
  `;
}

function renderEmptyStates() {
  Object.entries(EMPTY_STATES).forEach(([id, state]) => {
    const element = document.getElementById(id);

    if (element) {
      renderEmptyState(element, state);
    }
  });
}

function bindDashboardNavigation() {
  document.querySelectorAll(".dash-nav-item").forEach((item) => {
    if (item.dataset.bound === "true") return;

    item.dataset.bound = "true";
    item.addEventListener("click", () => {
      document
        .querySelectorAll(".dash-nav-item")
        .forEach((nav) => nav.classList.remove("active"));

      item.classList.add("active");
    });
  });
}

function preventPlaceholderActions() {
  document.querySelectorAll("#dashboard-view a[href='#']").forEach((link) => {
    if (link.dataset.bound === "true") return;

    link.dataset.bound = "true";
    link.addEventListener("click", (event) => event.preventDefault());
  });

  document
    .querySelectorAll(".btn-outline, .btn-add-task, .empty-state-action")
    .forEach((button) => {
      if (button.dataset.bound === "true") return;

      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        button.blur();
      });
    });
}

function initDashboard(user) {
  const initials = getInitials(user.name, user.email);
  const firstName = getFirstName(user.name, user.email);
  const displayName = user.name || user.email;

  document.getElementById("sidebar-avatar").textContent = initials;
  document.getElementById("sidebar-name").textContent = displayName;
  document.getElementById("sidebar-email").textContent = user.email;
  document.getElementById("welcome-avatar").textContent = initials;
  document.getElementById("welcome-greeting").textContent = `${getGreeting()}, ${firstName}!`;
  document.getElementById("dash-date").textContent = formatHeaderDate(new Date());

  renderEmptyStates();
  bindDashboardNavigation();
  preventPlaceholderActions();
}

window.initDashboard = initDashboard;
