import { updateAppUI, User } from './user.js';

updateAppUI(); // update app  UI when user login/register for the first time
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', User.logout);
