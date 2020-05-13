import postManager from '../services/posts-services';

const types = {
    // ADD_POST: 'addPost',
    // SET_POSTS: 'setPosts',
    // SET_ERROR: 'setError',
    // SET_NEXT_URL: 'setNextUrl',
    // CREATE_POST_SUCCESS: 'createPostSuccess',
    // CREATE_POST_FAIL: 'createPostFail',
    // UPDATE_POST_CONTENT : 'updatePostContent',
    SET_POST : 'setPost'
}

export const state = () => ({
    // results: [],
    // next: 'posts/',
    // error: null,
    instance: {}
})

export const mutations = {
    [types.SET_POST](state,data){
        state.instance = data;
    }
}

export const actions = {
    // async tryNext({ commit, state }) {
    //     postManager.loadData(state.next, {
    //         success: function (resq) {
    //             console.log(resq);
    //             commit(types.SET_POSTS, resq.results);
    //             commit(types.SET_NEXT_URL, resq.next);
    //         },
    //         error: function (err) {
    //             commit(types.SET_ERROR, err);
    //         }
    //     })
    // },
}

export const getters = {
    // getPosts(state) {
    //     return state.results
    // },
    // getError(state) {
    //     return state.error
    // }
    getPost(state){
        return state.instance;
    }
} 