import { PostManager, BASE_URL } from './postmanager.js';
import FormValidator from './formvalidator.js';

const postId = getQueryParam('postId');
const token = localStorage.getItem('token');
PostManager.getPost(postId).then(() => {
  const commentInput = document.querySelector(
    '#comment-form .form-group input'
  );
  logoutBtn.addEventListener('click', stopComment);
  if (!token) {
    stopComment();
    return;
  }
  FormValidator.validateForm(
    '#comment-form',
    async (inputvalue) => {
      console.log(commentInput);
      if (token) {
        const comment = await createComment(postId, inputvalue);
        const commentList = document.querySelector('.comments-list');
        const userInfoData =
          localStorage.getItem('user') &&
          JSON.parse(localStorage.getItem('user'));
        commentList.classList.remove('d-none');
        commentList.innerHTML += `
          <li class="list-group-item comment-item">
            <div class="ms-2">
              <a href="./profile.html?userid=${
                userInfoData.id
              }" class="fw-bold d-inline-flex text-decoration-none align-items-center gap-2">
                <img src="${
                  comment.author.profile_image instanceof Object
                    ? // default image
                      'https://www.google.com.eg/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png'
                    : comment.author.profile_image
                }" alt="avatar image" class="rounded-circle profile-img border border-2 border-danger" />
                <span>
                  @${comment.author.username}
                </span>
              </a>
              <p class="comment">
                ${comment.body}
              </p>
            </div>
          </li>
          `;
        const commentsCountEl = document.querySelector('.count-comments');
        commentsCountEl.textContent = ++commentsCountEl.textContent;
        commentInput.value = '';
      }
    },
    'comment'
  );
});
async function createComment(postId, commentString) {
  try {
    const {
      data: { data: comment },
    } = await axios.post(
      `${BASE_URL}/posts/${postId}/comments`,
      {
        body: commentString,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return comment;
  } catch (e) {
    console.log(e);
  }
}
function stopComment() {
  const addCommentContainer =
    document.getElementById('comment-form').parentElement;
  addCommentContainer.remove();
}
