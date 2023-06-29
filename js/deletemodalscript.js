import { PostManager } from './postmanager.js';
import FormValidator from './formvalidator.js';
const postImageBoxEl = document.querySelector('.post-image-box');
const postImageEl = postImageBoxEl.querySelector('#post-img');
const postImageBoxCloseBtn = postImageBoxEl.querySelector(
  '#post-img-close-btn'
);
// Add Post Modal
const addPostModal = document.getElementById('addPostModal');
const addPostModalLabel = addPostModal.querySelector('#addPostModalLabel');
const createPostBtn = addPostModal.querySelector('#add-post-btn');
const PostTitleInput = document.getElementById('postTitleInput');
const postInputFile = document.getElementById('postImageInput');
const postDescriptionTextArea = document.getElementById(
  'postDescriptionTextArea'
);
const token = localStorage.getItem('token');
if (token) {
  FormValidator.validateForm(
    '#new-post-form',
    PostManager.addPost.bind(PostManager),
    // or use (formdata) => PostManager.addpost(formdata)  // to stop binding this inside add post to window||undefinned
    undefined,
    displayPostImage
  );
  const removePostBtn = document.getElementById('remove-post-btn');
  postImageBoxCloseBtn.addEventListener('click', () => closeImageBox());
  // delete modal behavior
  document.addEventListener('click', (e) => {
    if (e.target.matches('.delete-post-btn')) {
      removePostBtn.dataset.postid = e.target.dataset.postid;
    }
    if (e.target.matches('.edit-post-btn')) {
      const postInfo = JSON.parse(
        decodeURIComponent(e.target.dataset.postinfo)
      );
      console.log('postInfo', postInfo);
      changeModalContent(postInfo);
    }
  });
  removePostBtn.addEventListener('click', (e) =>
    PostManager.removePost(e.currentTarget.dataset.postid)
  );
}
// Functions
function displayPostImage(file) {
  postImageEl.src = URL.createObjectURL(file);
  postImageBoxEl.classList.remove('visually-hidden');
}
function closeImageBox() {
  URL.revokeObjectURL(postImageEl.src);
  postImageEl.src = '';
  postImageBoxEl.classList.add('visually-hidden');
  const { files } = new DataTransfer();
  console.log('files before', postInputFile.files);
  postInputFile.files = files;
  postInputFile.dispatchEvent(new Event('change'));
  console.log('files after', postInputFile.files);
}
function changeModalContent(postInfo) {
  console.log(
    postInfo.postTitle,
    postInfo.postImage,
    postInfo.postParagraph,
    postInfo.postId
  );
  addPostModalLabel.textContent = 'Edit Post';
  createPostBtn.textContent = 'Update Post';
  addPostModal.dataset.postid = postInfo.postId;
  PostTitleInput.value = postInfo.postTitle;
  postDescriptionTextArea.value = postInfo.postParagraph;
  postImageEl.src =
    postInfo.postImage instanceof Object || postInfo.postImage === ''
      ? (postImageEl.src = '')
      : (postImageEl.src = postInfo.postImage);
  postImageBoxEl.classList.toggle(
    'visually-hidden',
    postInfo.postImage instanceof Object || postInfo.postImage === ''
  );
}
