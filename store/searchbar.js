export const state = () => ({
    q: ""
})

export const mutations = {
    setQ(state, value) {
        state.q = value
    }
}

export const getters = {
    getQ(state){
        return state.q
    }
}