const token = localStorage.getItem('token');
if (token) {
  const userInfoData =
    localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'));
  const profileLink = document.getElementById('user-profile-link');
  if (location.pathname === '/' || location.pathname === '/index.html') {
    profileLink.href = `./pages/profile.html?userid=${userInfoData?.id}`;
  } else {
    profileLink.href = `./profile.html?userid=${userInfoData?.id}`;
  }
}
