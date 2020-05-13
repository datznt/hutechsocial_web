export default function ({store,redirect}) {
    if (store.$auth.loggedIn) {
        // return redirect('/login')
        console.log(`/u/${store.$auth.user.slug}/feed/`);
        return redirect(`/u/${store.$auth.user.slug}/feed/`)
    }
}