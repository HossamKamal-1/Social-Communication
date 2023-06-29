import FormValidator from './formvalidator.js';
import { User } from './user.js';
const formLinks = document.querySelectorAll('.form-link');
formLinks.forEach((formLink) => {
  formLink.addEventListener('click', toggleActiveClass);
});
function toggleActiveClass() {
  const wrapper = document.querySelector('.login-register-section .wrapper');
  wrapper.classList.toggle('active');
}
// register form validation
FormValidator.validateForm('#signupForm', User.register);
FormValidator.validateForm('#signinForm', User.login, 'signin');
