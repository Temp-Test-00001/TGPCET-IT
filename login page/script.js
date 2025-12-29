// Toggle password visibility for login page

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('login-pass');
  const iconEye = document.getElementById('login-eye');

  if (!input || !iconEye) return;

  iconEye.addEventListener('click', () => {
    const isPassword = input.type === 'password';

    input.type = isPassword ? 'text' : 'password';

    iconEye.classList.toggle('ri-eye-off-line', !isPassword);
    iconEye.classList.toggle('ri-eye-line', isPassword);
  });
});
