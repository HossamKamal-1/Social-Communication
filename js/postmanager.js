import { showAlert } from './user.js';
const BASE_URL = 'https://tarmeezacademy.com/api/v1';
class PostManager {
  static #render = PostManager.#renderPosts();
  static async getPosts(
    postsPerPageLimit = 10,
    currentPage = 1,
    userId = null
  ) {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/${
          !userId
            ? `posts?page=${currentPage}&limit=${postsPerPageLimit}`
            : `users/${userId}/posts`
        }`
      );
      console.log('from api', data);
      const posts = data.data;
      // console.log(data);
      if (!userId) {
        PostManager.#render(posts);
      } else {
        PostManager.#renderPosts()(posts, !!userId);
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }
  static async getUserDetails(userId) {
    try {
      const {
        data: { data: userDetails },
      } = await axios.get(`${BASE_URL}/users/${userId}`);
      console.log(userDetails);
      this.#renderUserDetails(userDetails);
    } catch (e) {
      console.log(e);
    }
  }
  static #renderUserDetails(userDetailsObj) {
    const postOwnerEl = document.getElementById('postsOwnerName');
    const profileStat = document.getElementById('profileStat');
    const profileInfoEl = document.getElementById('profileInfo');
    postOwnerEl.innerHTML = `
    <span id="postsOwnerName">${userDetailsObj.username}</span>'s Posts
    `;
    profileInfoEl.innerHTML = `
    <img src="${
      userDetailsObj.profile_image instanceof Object ||
      userDetailsObj.profile_image === ''
        ? '../assets/images/user.png'
        : userDetailsObj.profile_image
    }" id="profileImg" alt="" class="rounded-circle  border border-2 border-danger"
                  style="height:60px;width:60px" />
    <div class="user-profile-info flex-grow-1">
      <div class="profile-email  my-3" id="profileEmail">
        ${userDetailsObj.email ? userDetailsObj.email : ''}
      </div>
      <div class="profile-name  my-3" id="profileName">
        ${userDetailsObj.name}
      </div>
      <div class="profile-user-name my-3" id="profileUsername">
        ${userDetailsObj.username}
      </div>
    </div>
    `;
    profileStat.innerHTML = `
      <div>
          <span class="fs-3 fw-bold me-2" id="postsCount">${userDetailsObj.posts_count}</span>Posts
      </div>
      <div>
          <span class="fs-3 fw-bold me-2" id="commentsCount">${userDetailsObj.comments_count}</span>Comments
      </div>
    `;
  }
  static #renderPosts() {
    let isFirstTime = false;
    return function render(posts, isUserPosts = false) {
      const userData =
        localStorage.getItem('user') &&
        JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const postsContainer = document.getElementById('posts');
      let loader;
      if (!isUserPosts) {
        loader = document
          .querySelector('[data-loader]')
          .content.children[0].cloneNode(true);
      }
      if (!isFirstTime) {
        isFirstTime = true;
        postsContainer.innerHTML = '';
      }
      if (!posts.length) {
        postsContainer.innerHTML =
          '<div class="no-posts display-6 text-danger fw-light text-center position-relative" style="top:100px">No posts to show</div>';
      }
      if (!isUserPosts) {
        removePaginationLoader();
      }
      for (const {
        id: postId,
        title: postTitle,
        image: postImage,
        tags,
        created_at: createdPostDuration,
        author: { username, profile_image: userProfileImage, id: postAuthorId },
        body: postParagraph,
        comments_count: commentsCount,
      } of posts) {
        postsContainer.innerHTML += `
          <div class="post card mb-4 shadow">
          <div class="card-header d-flex">
            <a href="${getCurrentRelativeRoute()}pages/profile.html?userid=${postAuthorId}" class="text-dark text-decoration-none">
              <img src="${
                userProfileImage instanceof Object
                  ? // default image
                    `${getCurrentRelativeRoute()}assets/images/user.png`
                  : userProfileImage
              }" alt="profile image"
                class="profile-img rounded-circle border border-2 border-danger me-2" />
              <span class="username fw-bold">
                @${username}
              </span>
            </a>
            ${
              !token || (token && userData?.id !== postAuthorId)
                ? ''
                : `
                <div class="controls ms-auto d-flex gap-2">
                  <button class="btn btn-primary edit-post-btn" type="button" data-bs-target="#addPostModal" data-bs-toggle="modal" data-postInfo = "${encodeURIComponent(
                    JSON.stringify({
                      postTitle,
                      postImage,
                      postParagraph,
                      postId,
                    })
                  )}">Edit</button>
                  <button class="btn btn-danger delete-post-btn" type="button" data-bs-target="#removePostModal" data-bs-toggle="modal" data-postid='${postId}'>Remove</button>
                </div>
                `
            }
            
          </div>
          <div class="card-body">
              ${
                postImage instanceof Object || postImage === ''
                  ? ''
                  : `<img
                    src="${postImage}"
                    alt=""
                    class="post-img img-fluid rounded object-fit-cover w-100"
                    />`
              }
            <div class="post-duration text-secondary my-2">
              ${createdPostDuration}
            </div>
            ${
              postTitle
                ? `
                  <div class="h3 post-title mb-2">
                    ${postTitle}
                  </div>`
                : ''
            }
            <p class="card-text lead fw-normal">
            ${postParagraph}
            </p>
          </div>
          <div class="card-footer text-body-secondary">
          <ul class="tags-list list-unstyled d-flex align-items-center justify-content-center flex-wrap gap-2">
          ${
            tags.length
              ? tags
                  .map((tag) => {
                    return `
                        <li class="tag-item">
                          <a href="#" class="tag-link">
                              <span class="badge text-bg-secondary py-2 px-3">${tag.name}</span>
                          </a>
                        </li>`;
                  })
                  .join('')
              : ''
          }
          </ul>
            <a href="${getCurrentRelativeRoute()}pages/post.html?postId=${postId}" class="comments text-decoration-none d-inline-flex align-items-center gap-1">
              <i class="fa-solid fa-user-pen"></i>
              <span class="count-comments d-flex align-items-center">
                ${commentsCount}
              </span>
              comments
            </a>
          </div>
        </div>
      `;
      }
      if (!isUserPosts) {
        // adding loader after posts
        postsContainer.append(loader);
      }
    };
  }
  static #renderPost({
    id: postId,
    title: postTitle,
    image: postImage,
    tags,
    created_at: createdPostDuration,
    author: { username, profile_image: userProfileImage, id: postAuthorId },
    body: postParagraph,
    comments_count: commentsCount,
    comments,
  }) {
    const userData =
      localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = `
    <div class="post card mb-4 shadow">
    <div class="card-header d-flex ">
      <a href="./profile.html?userid=${postAuthorId}" class="text-dark text-decoration-none">
        <img src="${
          userProfileImage instanceof Object
            ? // default image
              '../assets/images/user.png'
            : userProfileImage
        }" alt="profile image"
          class="profile-img rounded-circle border border-2 border-danger me-2" />
        <span class="username fw-bold">
          @${username}
        </span>
      </a>
      ${
        !token || (token && userData?.id !== postAuthorId)
          ? ''
          : `
          <div class="controls ms-auto d-flex gap-2">
            <button class="btn btn-primary edit-post-btn" type="button" data-bs-target="#addPostModal" data-bs-toggle="modal" data-postInfo="${encodeURIComponent(
              JSON.stringify({
                postTitle,
                postImage,
                postParagraph,
                postId,
              })
            )}">Edit</button>
            <button class="btn btn-danger delete-post-btn" type="button" data-bs-target="#removePostModal" data-bs-toggle="modal" data-postid='${postId}'>Remove</button>
          </div>
          `
      }
    </div>
    <div class="card-body">
        ${
          postImage instanceof Object || postImage === ''
            ? ''
            : `<img
              src="${postImage}"
              alt=""
              class="post-img img-fluid rounded object-fit-cover w-100"
              />`
        }
      <div class="post-duration text-secondary my-2">
        ${createdPostDuration}
      </div>
      ${
        postTitle
          ? `
            <div class="h3 post-title mb-2">
              ${postTitle}
            </div>`
          : ''
      }
      <p class="card-text lead fw-normal">
      ${postParagraph}
      </p>
    </div>
    <div class="card-footer text-body-secondary">
    <ul class="tags-list list-unstyled d-flex align-items-center justify-content-center flex-wrap gap-2">
    ${
      tags.length
        ? tags
            .map((tag) => {
              return `
                  <li class="tag-item">
                    <a href="#" class="tag-link">
                        <span class="badge text-bg-secondary py-2 px-3">${tag.name}</span>
                    </a>
                  </li>`;
            })
            .join('')
        : ''
    }
    </ul>
      <div class="comments text-decoration-none d-inline-flex align-items-center gap-1">
        <i class="fa-solid fa-user-pen"></i>
        <span class="count-comments d-flex align-items-center">
          ${commentsCount}
        </span>
        comments
      </div>
    </div>
    <ul class="list-group list-group-flush comments-list ${
      commentsCount == 0 ? 'd-none' : ''
    }">
    ${comments
      .map(({ body, author, id: userid }) => {
        return `
          <li class="list-group-item comment-item">
            <div class="ms-2">
              <a href="./profile.html?userid=${
                author.id
              }" class="fw-bold d-inline-flex text-decoration-none align-items-center gap-2">
                <img src="${
                  author.profile_image instanceof Object
                    ? // default image
                      '../assets/images/user.png'
                    : author.profile_image
                }" alt="avatar image" class="rounded-circle profile-img border border-2 border-danger" />
                <span>
                  @${author.username}
                </span>
              </a>
              <p class="comment">
                ${body}
              </p>
            </div>
          </li>
      `;
      })
      .join('')}
    </ul>
    <div class="add-comment p-2">
      <form id="comment-form">
        <div class="hstack gap-3">
          <div class="form-group w-100">
            <input class="form-control me-auto" type="text" placeholder="Type comment..."
              aria-label="Write Comment.." required>
          </div>
          <button type="submit" class="btn btn-primary">Send</button>
        </div>
      </form>
    </div>
  </div>
`;
  }
  static async getPost(postId) {
    try {
      const {
        data: { data: post },
      } = await axios.get(`${BASE_URL}/posts/${postId}`);
      console.log(post);
      this.#renderPost(post);
    } catch (e) {
      console.log(e);
    }
  }
  static async removePost(postId) {
    const token = localStorage.getItem('token');
    console.log('postid', postId);
    if (token) {
      try {
        const data = await axios.delete(`${BASE_URL}/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('remove', data);
        showAlert('Post Successfully deleted', 'success');
        const deleteModal = document.getElementById('removePostModal');
        const deleteModalInstance = bootstrap.Modal.getInstance(deleteModal);
        deleteModalInstance.hide();
        if (location.pathname === '' || location.pathname === '/index.html') {
          const { data: posts } = await this.getPosts();
          this.#renderPosts()(posts);
        } else if (location.pathname === '/pages/post.html') {
          location.href = '/index.html';
        } else {
          const userInfoData =
            localStorage.getItem('user') &&
            JSON.parse(localStorage.getItem('user'));
          this.getUserDetails(userInfoData.id);
          await this.getPosts(null, null, userInfoData.id);
        }
      } catch (e) {
        console.log(e);
        showAlert(e.response.data.message, 'danger');
      }
    }
  }
  static async addPost(formData) {
    const token = localStorage.getItem('token');
    const postId = document.getElementById('addPostModal').dataset.postid;
    const isEditPost = !!postId;
    if (isEditPost) {
      formData.append('_method', 'put');
    }
    console.log('from add post', [...formData]);
    if (token) {
      const newPostModalCloseBtn = document.getElementById('postModalCloseBtn');
      const PostTitleInput = document.getElementById('postTitleInput');
      const postDescriptionTextArea = document.getElementById(
        'postDescriptionTextArea'
      );
      const postImgCloseBtn = document.getElementById('post-img-close-btn');
      try {
        const {
          data: { data: post },
        } = await axios.post(
          `${BASE_URL}/posts${isEditPost ? `/${postId}` : ''}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('post', post);
        showAlert(
          `Post ${isEditPost ? 'Edited' : 'Added'} Successfully`,
          'success'
        );
        if (location.pathname === '/pages/post.html') {
          location.reload();
        } else if (
          location.pathname === '/' ||
          location.pathname === '/index.html'
        ) {
          const { data: posts } = await this.getPosts();
          this.#renderPosts()(posts);
        } else {
          const userInfoData =
            localStorage.getItem('user') &&
            JSON.parse(localStorage.getItem('user'));
          await this.getPosts(null, null, userInfoData.id);
        }
        postDescriptionTextArea.value = '';
        PostTitleInput.value = '';
        postImgCloseBtn.click();
        newPostModalCloseBtn.click();
      } catch (e) {
        console.log(e);
        showAlert(e.response.data.message, 'danger');
      }
    }
  }
}
function removePaginationLoader() {
  const loader = document.getElementById('paginationLoader');
  if (loader) {
    loader.remove();
  }
}
function getCurrentRelativeRoute() {
  return location.pathname === '/' || location.pathname === '/index.html'
    ? './'
    : '../';
}
export { removePaginationLoader, PostManager, BASE_URL };
