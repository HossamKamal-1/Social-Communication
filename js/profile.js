import { PostManager } from './postmanager.js';
const userId = getQueryParam('userid');
PostManager.getUserDetails(userId);
PostManager.getPosts(null, null, userId);
