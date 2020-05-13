import apiClient from './api-client';

const postManager = {
    async loadData(url, { success, error }) {
        try {
            await apiClient.get(url)
                .then((resq) => success && success(resq.data))
                .catch((err) => error && error(err));
        } catch (err) {
            error && error(err.toString());
        }
    },
    async createPost(url ,data, {
        success, //function callback on create post success
        error   // function callback on create post fail
    }) {
        try {
            // users/nguyendat/posts/
            await apiClient.post(url, data)
                .then((resq) => success && success(resq.data))
                .catch((err) => error && error(err));
            // await apiClient.post('users/nguyendat/posts/', data)
            //     .then((resq) => success && success(resq.data))
            //     .catch((err) => error && error(err));
        } catch (err) {
            error && error(err.toString());
        }
    },
    checkFields(obj) {
        return true;
    },
    async getPosts(url, { success, error }) {
        try {
            await apiClient.get(url, { progress: false })
                .then((resq) => success && success(resq.data))
                .catch((err) => error && error(err));
        } catch (err) {
            error && error(err.toString());
        }
    },
}

// module.exports = postManager;
export default postManager;