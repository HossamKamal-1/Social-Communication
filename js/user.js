import { BASE_URL } from './postmanager.js';
const feedbackMsg = document.getElementById('feedback-msg');
class User {
  static async login(username, password) {
    console.log('login ');
    console.log(username, password);
    const body = {
      username: username,
      password: password,
    };
    // const body = { signinUsername, signinPassword };
    try {
      const {
        data: { token, user },
      } = await axios.post(`${BASE_URL}/login`, body);
      feedbackMsg.classList.replace('text-danger', 'text-success');
      console.log(user, token);
      feedbackMsg.textContent = 'Redirecting to home page ... ';
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      location.href = '../index.html';
    } catch (e) {
      console.log(e);
      feedbackMsg.textContent = 'username or password is incorrect';
      feedbackMsg.classList.add('text-danger');
    }
  }
  static async logout() {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        // to ensure that you are the correct user
        const { data } = await axios.post(`${BASE_URL}/logout`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(data);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      updateAppUI();
      showAlert('Signed out successfully !', 'success');
    } catch (e) {
      console.log(e);
    }
  }
  static async register(formData) {
    console.log('register');
    const progressWrapper = document.querySelector('.upload-progress-wrapper');
    try {
      const config = {
        onUploadProgress: function (progressEvent) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          progressWrapper.classList.remove('visually-hidden');
          const progress = progressWrapper.querySelector('.progress');
          const uploadMsg = progressWrapper.querySelector('.upload-msg');
          progress.classList.toggle('bg-danger', percentCompleted !== 100);
          progress.classList.toggle('bg-success', percentCompleted === 100);
          progress.textContent = `${percentCompleted}%`;
          progress.style.width = `${percentCompleted}%`;
          uploadMsg.textContent =
            percentCompleted === 100 ? 'Uploaded Successfully' : '';
        },
      };
      const {
        data: { token, user },
      } = await axios.post(`${BASE_URL}/register`, formData, config);
      console.log('registered');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      location.href = '../index.html';
    } catch (e) {
      if (e.response.status === 422) {
        progressWrapper.classList.add('visually-hidden');
        const emailElement = document.getElementById('emailInput');
        const usernameElement = document.getElementById('usernameInput');
        console.log(e.response.data.errors);
        if ('email' in e.response.data.errors) {
          addServerErrorAttribute(emailElement);
        }
        if ('username' in e.response.data.errors) {
          addServerErrorAttribute(usernameElement);
        }
        console.log(e.response.data.errors);
      }
    }
  }
}
function addServerErrorAttribute(element) {
  element.setAttribute('server-error', '');
  element.dispatchEvent(new Event('input'));
}
function updateAppUI() {
  const userToken = localStorage.getItem('token');
  const userInfo = localStorage.getItem('user');
  const userAvatarWrapper = document.getElementById('userAvatarWrapper');
  const loginRegisterWrapper = document.getElementById('loginRegisterWrapper');
  const createPostBtn = document.getElementById('create-post-btn');
  const postControls = document.querySelectorAll('.controls');
  const userProfileLinkEl = document.getElementById('user-profile-link');
  userProfileLinkEl.href = '#';
  // Remove Edit Posts Btns when User Logout
  if (postControls.length) {
    if (!userToken && !userInfo) {
      postControls.forEach((postControl) => postControl.remove());
    }
  }
  // Hide create post btn when User Logout
  if (createPostBtn) {
    createPostBtn.classList.toggle('visually-hidden', !(userToken && userInfo));
  }
  // Show User Avatar And Name when Login
  if (userToken && userInfo) {
    const userInfoData = JSON.parse(userInfo);
    if (
      !userInfoData?.profile_image instanceof Object ||
      userInfoData?.profile_image !== ''
    ) {
      const profileImageEl = document.getElementById('profile-image');
      profileImageEl.src = userInfoData.profile_image;
      console.log(userInfoData.profile_image);
    }
    const profileUsernameElement = document.getElementById('profile-username');
    profileUsernameElement.textContent = userInfoData.username;
  }
  userAvatarWrapper.classList.toggle('d-none', !userToken);
  userAvatarWrapper.classList.toggle('pe-none', !userToken);
  loginRegisterWrapper.classList.toggle('d-none', userToken);
}
function showAlert(message, type) {
  const alertPlaceholder = document.getElementById('alert-box');
  alertPlaceholder.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>',
  ].join('');
  const alertBt = bootstrap.Alert.getOrCreateInstance('#alert-box .alert');
  console.log(alertBt);
  let setTimeoutId = setTimeout(() => {
    alertBt.close();
  }, 2000);
  alertBt._element.addEventListener('closed.bs.alert', (event) => {
    clearTimeout(setTimeoutId);
  });
}
export { updateAppUI, User, showAlert };
