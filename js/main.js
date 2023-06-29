import { PostManager, removePaginationLoader } from './postmanager.js';
// import { updateAppUI, User } from './user.js';
import FormValidator from './formvalidator.js';

const postImageBoxEl = document.querySelector('.post-image-box');
const postImageEl = postImageBoxEl.querySelector('#post-img');
// Add Post Modal
const addPostModal = document.getElementById('addPostModal');
const addPostModalLabel = addPostModal.querySelector('#addPostModalLabel');
const createPostBtn = addPostModal.querySelector('#add-post-btn');
const PostTitleInput = document.getElementById('postTitleInput');
const postDescriptionTextArea = document.getElementById(
  'postDescriptionTextArea'
);
const token = localStorage.getItem('token');
/* 
  as this script is module it runs always in strict mode 
  that's why this keyword inside function that is declared and 
  run in the GEC always undefined instead of window Obj
*/
PostManager.getPosts(); // return 10 posts for page first time && page 1
// Add Post Modal
const postsAsyncGenObj = paginatePosts(5);
const debouncedPaginateOnScrollHandler = debounce(
  paginateOnScrollHandler,
  500,
  true
);
if (token) {
  const addPostBtn = document.getElementById('create-post-btn');
  addPostBtn.addEventListener('click', () => {
    addPostModal.dataset.postid = '';
    addPostModalLabel.textContent = 'Create Post';
    createPostBtn.textContent = 'Add Post';
    postDescriptionTextArea.value = '';
    PostTitleInput.value = '';
    const postImgCloseBtn = document.getElementById('post-img-close-btn');
    postImgCloseBtn.click();
  });
}
// Event Listeners
window.addEventListener('scroll', scrollHandler);
// Functions
function debounce(originalFunction, delay, executeImmediately) {
  let timeoutId = null;
  return function debouncedFunction() {
    // Capture the execution context and arguments of the debounced function
    const executionContext = this;
    const argumentsArray = arguments;
    // Determine whether the original function should be executed immediately
    const shouldExecuteImmediately = executeImmediately && !timeoutId;
    // Define a function that will be called after the delay has passed
    const executeLater = function () {
      // If executeImmediately is false, execute the original function
      if (!shouldExecuteImmediately) {
        originalFunction.apply(executionContext, argumentsArray);
      }
    };
    // Clear any existing timeout and create a new one to execute the function after the delay
    clearTimeout(timeoutId);
    timeoutId = setTimeout(executeLater, delay);
    // If shouldExecuteImmediately is true, execute the original function immediately
    if (shouldExecuteImmediately) {
      originalFunction.apply(executionContext, argumentsArray);
    }
  };
}
async function* paginatePosts(postsPerPageLimit = 5) {
  // let limit = 10 + pageSize;
  let currentPage = 1;
  let isFirstTime = true;
  let data;
  while (true) {
    try {
      if (isFirstTime) {
        data = await PostManager.getPosts(postsPerPageLimit, ++currentPage);
        isFirstTime = false;
        yield data?.data;
      } else {
        if (currentPage < data.meta.last_page) {
          data = await PostManager.getPosts(postsPerPageLimit, ++currentPage);
          yield data?.data;
        } else {
          // stop
          console.log('stop due to finish data');
          removePaginationLoader();
          return null;
        }
      }
      // if (isFirstTime) {
      //   data = await PostManager.getPosts(limit);
      //   isFirstTime = false;
      //   yield data?.data;
      // } else {
      //   limit += pageSize;
      //   if (limit >= data?.meta.total) {
      //     limit = data?.meta.total;
      //     data = await PostManager.getPosts(limit);
      //     yield data?.data;
      //     return null; // stop generator
      //   }
      //   // less than total
      //   data = await PostManager.getPosts(limit);
      //   yield data?.data;
      // }
    } catch (e) {
      return null; // stop generator ( network error connection fails / server down)
    }
  }
}
function paginateOnScrollHandler() {
  console.log('start request');
  postsAsyncGenObj.next().then((data) => {
    console.log(data);
    console.log('end request');
    if (data.done) {
      console.log('im done');
      window.removeEventListener('scroll', scrollHandler);
    }
  });
}
function scrollHandler() {
  const scrollPosition = window.scrollY;
  const documentHeight = Math.max(
    document.documentElement.scrollHeight,
    document.documentElement.clientHeight
  );
  const scrollThreshold = 0.98; // to stop zoom in/out scrolling unexpected behaviour
  if (
    scrollPosition >=
    (documentHeight - window.innerHeight) * scrollThreshold
  ) {
    debouncedPaginateOnScrollHandler();
  }
}
// unsued
function throttle(originalFunction, delay) {
  let shouldWait = false;
  let waitingArgs;
  return function throttledFunction() {
    const setTimeoutHandler = () => {
      if (waitingArgs == null) {
        shouldWait = false;
      } else {
        originalFunction.apply(executionContext, waitingArgs);
        waitingArgs = null;
        setTimeout(setTimeoutHandler, delay);
      }
    };
    // Capture the execution context and arguments of the throttled function
    const executionContext = this;
    const argumentsArray = arguments;
    if (shouldWait) {
      waitingArgs = argumentsArray;
      return;
    }
    originalFunction.apply(executionContext, argumentsArray);
    shouldWait = true;
    setTimeout(setTimeoutHandler, delay);
  };
}
