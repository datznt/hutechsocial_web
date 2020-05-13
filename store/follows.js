
const types = {
    SET_REPORT: 'setReport',
    SET_ERROR: 'setError',
    SET_FOLLOWERS: 'setFollowers',
    SET_FOLLOWING: 'setFollowing'
}

export const state = () => ({
    followers: 0,
    following: 0,
    error: null
})

export const getters = {
    countFollowing(state) {
        return state.following;
    },
    countFollowers(state) {
        return state.followers;
    }
}

export const mutations = {
    [types.SET_FOLLOWERS](state, followers) {
        state.followers = followers;
    },
    [types.SET_FOLLOWING](state, following) {
        state.following = following;
    },
    [types.SET_ERROR](state, error) {
        state.error = error;
    },
}

export const actions = {
    async updateReport({ commit, state }) {
        const userId = this.$auth.user.slug;
        // followManager.getFollowingFollowers(`users/${userId}/follow-report/`, {
        //     success: function (resp) {
        //         commit(types.SET_FOLLOWERS, resp.followers);
        //         commit(types.SET_FOLLOWING, resp.following);
        //     },
        //     error: function (err) {
        //         commit(types.SET_ERROR, err);
        //     }
        // })
    }
}