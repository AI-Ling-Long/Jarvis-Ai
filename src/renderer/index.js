const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("toggle-password");
const iconShow = togglePasswordBtn.querySelector(".icon-show");
const iconHide = togglePasswordBtn.querySelector(".icon-hide");

togglePasswordBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  iconShow.hidden = isHidden;
  iconHide.hidden = !isHidden;
  togglePasswordBtn.setAttribute(
    "aria-label",
    isHidden ? "Hide password" : "Show password"
  );
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});
