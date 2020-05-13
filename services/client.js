import apiClient from './api-client';
import buildUrl from '../plugins/build-url';
const keys = {
    CONTENTTYPES: {
        USER: 12,
        POST: 21,
        COMMENT: 39,
        FILE: 16,
        GROUP: 17,
        COMPANY: 15,
        LINK: 32
    },
    POSTS: "posts"
}

const urls = {
    USER_NEWS_FEED: '/users/news-feed/',
    REACTIONS: '/reactions/',
    COMMENTS: '/comments/',
    POSTS: '/posts/',
    FILES: '/files/',
    GROUPS: '/groups/',
    GROUPS_MEMBERS: '/groups-users/',
    GROUPS_SETTINGS: '/groups-setting/',
    FOLLOWS: '/follows/',
    USER_DEVICES: '/user-devices/',
    USERS: '/users/',
    USER_NOTIFICATIONS: '/user-notifications/',
    COMPANIES: '/companies/',
    LINKS: '/links/',
    JOBS: '/jobs/',
}

const linkTemplates = {
    COMMENT: "<%- domain %>/posts/<%- post_id %>/?comment_id=<%- comment_id %>",
    REPLY_COMMENT: "<%- domain %>/posts/<%- post_id %>/?comment_id=<%- comment_id %>&reply_comment_id=<%- reply_comment_id %>",
}

const client = {
    getNewsFeed: () => apiClient.get(urls.USER_NEWS_FEED, {
        params: {
            expand: 'create_by,create_by.avatar,attaches',
            fields: 'id,my_reaction,content_object,create_at,content,public_code,extra,summary,attaches,create_by,create_by.id,create_by.full_name,create_by.avatar.id,create_by.avatar.thumbnails,attaches.id,attaches.content_object'
        }
    }),
    withType(type) {
        let content_type = 0;
        if (type == "post") {
            content_type = keys.CONTENTTYPES.POST;
        } else if (type == "comment") {
            content_type = keys.CONTENTTYPES.COMMENT;
        } else if (type == "user") {
            content_type = keys.CONTENTTYPES.USER;
        } else if (type == "file") {
            content_type = keys.CONTENTTYPES.FILE;
        } else if (type == "group") {
            content_type = keys.CONTENTTYPES.GROUP;
        } else if (type == "company") {
            content_type = keys.CONTENTTYPES.COMPANY;
        } else if (type == "link") {
            content_type = keys.CONTENTTYPES.LINK;
        }
        return content_type;
    },
    user(action, { url, slug, q, params_filter = {} }) {
        switch (action) {
            case "search":
                return apiClient.get(buildUrl(urls.USERS, {
                    queryParams: {
                        expand: ['avatar'],
                        omit: ['avatar.id', 'avatar.mimetype', 'avatar.create_at', 'avatar.create_by', 'avatar.size', 'avatar.name'],
                        search: q
                    }
                }), { progress: false })
            case "get":
                url = url ? url : buildUrl(urls.USERS, {
                    queryParams: {
                        expand: ['avatar'],
                        omit: ['avatar.id', 'avatar.mimetype', 'avatar.create_at', 'avatar.create_by', 'avatar.size', 'avatar.name'],
                    }
                });
                return apiClient.get(url, { progress: false });
            case "retrieve":
                return apiClient.get(buildUrl(urls.USERS, {
                    path: slug + '/',
                    queryParams: {
                        expand: ['avatar'],
                    }
                }))
            case "Get all files":
                url = url ? url : buildUrl(urls.FILES, {
                    queryParams: params_filter
                });
                return apiClient.get(url, { progress: false });
        }
    },
    react(action, { url, react_id, target_type, object_id, react_type }) {
        let content_type = this.withType(target_type);
        switch (action) {
            case "get":
                url = url ? url : urls.REACTIONS;
                return apiClient.get(url, { params: { content_type: content_type, object_id: object_id } });
            case "create":
                let data = { content_type: content_type, object_id: object_id, react_type: react_type };
                return apiClient.post(urls.REACTIONS, data, { progress: false });
            case "delete":
                return apiClient.delete(urls.REACTIONS + react_id + '/', { progress: false })
            case "update":
                return apiClient.patch(urls.REACTIONS + react_id + '/', { react_type: react_type }, { progress: false });
        }
    },
    comment(action, { comment_id, url, object_id, parent, content }) {
        const content_type = this.withType("post");
        switch (action) {
            case "get":
                let params = {};
                if (parent == null || parent == undefined) { params['parent__isnull'] = true }
                else { params['parent'] = parent }
                params['object_id'] = object_id;
                params['content_type'] = content_type;
                url = url ? url : buildUrl(urls.COMMENTS, {
                    queryParams: {
                        ...params,
                        expand: ['create_by', 'create_by.avatar'],
                        fields: ['id', 'my_reaction', 'create_at', 'content', 'summary', 'parent', 'create_by.id', 'create_by.full_name', 'create_by.avatar', 'create_by.avatar.raw', 'create_by.avatar.thumbnails']
                    }
                });
                return apiClient.get(url, { progress: false });
            case "retrieve":
                return apiClient.get(buildUrl(urls.COMMENTS, {
                    path: comment_id,
                    queryParams: {
                        expand: ['create_by', 'create_by.avatar'],
                        fields: ['id', 'my_reaction', 'create_at', 'content', 'summary', 'parent', 'create_by.id', 'create_by.full_name', 'create_by.avatar', 'create_by.avatar.raw', 'create_by.avatar.thumbnails']
                    }
                }), { progress: false });
            case "create":
                let data = { content_type: content_type, object_id: object_id, content: content };
                if (parent) { data["parent"] = parent }
                return apiClient.post(urls.COMMENTS, data)
            case "delete":
                return apiClient.delete(urls.COMMENTS + comment_id + '/')
            case "update":
                data = { content: content }
                return apiClient.patch(urls.COMMENTS + comment_id + '/', data)
        }
    },
    post(action, { post_id, url, content_type, object_id, content, attaches, public_code, data_update = {} }) {
        content_type = this.withType(content_type);
        switch (action) {
            case "retrieve":
                return apiClient.get(buildUrl(urls.POSTS, {
                    path: post_id,
                    queryParams: {
                        expand: ['create_by', 'create_by.avatar', 'attaches'],
                        fields: ['id', 'my_reaction', 'content_object', 'create_at', 'content', 'public_code', 'extra', 'summary', 'attaches', 'create_by', 'create_by.id', 'create_by.full_name', 'create_by.avatar.id', 'create_by.avatar.thumbnails', 'attaches.id', 'attaches.content_object']
                    }
                }), { progress: false });
            case "create":
                let data = { content_type: content_type, object_id: object_id, content: content, public_code: public_code, attaches: attaches };
                console.log(data);
                return apiClient.post(urls.POSTS, data)
            case "get":
                url = url ? url : buildUrl(urls.POSTS, {
                    queryParams: {
                        content_type: content_type,
                        object_id: object_id,
                        expand: ['create_by', 'create_by.avatar', 'attaches'],
                        fields: ['id', 'my_reaction', 'content_object', 'create_at', 'content', 'public_code', 'extra', 'summary', 'attaches', 'create_by', 'create_by.id', 'create_by.full_name', 'create_by.avatar.id', 'create_by.avatar.thumbnails', 'attaches.id', 'attaches.content_object']
                    }
                });
                return apiClient.get(url, { progress: false });
            case "new feed":
                url = url ? url : buildUrl(urls.USER_NEWS_FEED, {
                    queryParams: {
                        expand: ['create_by', 'create_by.avatar', 'attaches'],
                        fields: ['id', 'my_reaction', 'content_object', 'create_at', 'content', 'public_code', 'extra', 'summary', 'attaches', 'create_by', 'create_by.id', 'create_by.full_name', 'create_by.avatar.id', 'create_by.avatar.thumbnails', 'attaches.id', 'attaches.content_object']
                    }
                });
                return apiClient.get(url, { progress: false });
            case "update":
                return apiClient.patch(buildUrl(urls.POSTS, {
                    path: post_id + '/'
                }), { ...data_update }, { progress: false })
            default:
                break;
        }
    },
    file(action, { file_id, file, url, params_filter = {} }) {
        switch (action) {
            case "create":
                let formData = new FormData();
                formData.append('raw', file);
                return apiClient.post(urls.FILES, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
            case "delete":
                return apiClient.delete(buildUrl(urls.FILES, { path: file_id }))
            case "get":
                url = url ? url : buildUrl(urls.FILES, {
                    queryParams: params_filter
                });
                return apiClient.get(url, { progress: false });
        }
    },
    group(action, { url, name, slug, description, group_id, group_setting_id, user_id, group_user_id, inviter_id, admin_accepted, q, is_admin, params_filter = {}, data_update = {} }) {
        switch (action) {
            case "create":
                let data = { name: name, description: description };
                return apiClient.post(urls.GROUPS, data, { progress: false });
            case "update":
                return apiClient.patch(urls.GROUPS + slug + '/', data_update, { progress: false });
            case "update setting":
                return apiClient.patch(urls.GROUPS_SETTINGS + group_setting_id + '/', data_update, { progress: false });
            case "retrieve":
                return apiClient.get(buildUrl(urls.GROUPS, {
                    path: slug,
                    queryParams: {
                        expand: ["create_by", "create_by.avatar", "setting", 'tags', 'banner', 'parent'],
                        omit: ["create_by.last_login", "create_by.is_staff", "create_by.is_active", "create_by.date_joined", "create_by.tags", "create_by.first_name", "create_by.last_name", "create_by.avatar.id", "create_by.avatar.create_at", "create_by.avatar.name", "create_by.avatar.size", "create_by.avatar.mimetype", "create_by.avatar.create_by", 'setting.group', 'banner.size', 'banner.create_by', 'banner.create_at',],
                    }
                }))
            case "Find groups for which I am a member":
                url = url ? url : buildUrl(urls.GROUPS_MEMBERS, { queryParams: { user: user_id, expand: "group", omit: ["user"] } });
                return apiClient.get(url, { progress: false });
            case "Get the posts in the group":
                url = url ? url : buildUrl(urls.GROUPS, {
                    path: slug + "/" + keys.POSTS,
                    queryParams: {
                        ...params_filter,
                        expand: ['create_by', 'create_by.avatar', 'attaches'],
                        fields: ['id', 'my_reaction', 'content_object', 'create_at', 'content', 'public_code', 'extra', 'summary', 'attaches', 'create_by', 'create_by.id', 'create_by.full_name', 'create_by.avatar.id', 'create_by.avatar.thumbnails', 'attaches.id', 'attaches.content_object']
                    }
                });
                return apiClient.get(url, { progress: false });
            case "Filter members":
                params_filter["expand"] = ["user", "user.avatar"]
                params_filter["omit"] = ["user.last_login", "user.is_staff", "user.is_active", "user.date_joined", "user.tags", "user.first_name", "user.last_name", "user.avatar.id", "user.avatar.create_at", "user.avatar.name", "user.avatar.size", "user.avatar.mimetype", "user.avatar.create_by"]
                url = url ? url : buildUrl(urls.GROUPS_MEMBERS, {
                    queryParams: params_filter
                });
                return apiClient.get(url, { progress: false });
            case "Filter files":
                url = url ? url : buildUrl(urls.GROUPS, {
                    path: slug + urls.FILES,
                    queryParams: params_filter
                });
                return apiClient.get(url, { progress: false });
            case "Leave group":
                return apiClient.delete(urls.GROUPS_MEMBERS + group_user_id + "/", { progress: false })
            case "Join the group":
                return apiClient.post(urls.GROUPS_MEMBERS, { group: group_id, user: user_id, user_accepted: true }, { progress: false })
            case "Invite user to the group":
                return apiClient.post(urls.GROUPS_MEMBERS, { group: group_id, user: user_id, inviter: inviter_id, admin_accepted: admin_accepted }, { progress: false });
            case "Accept the invitation":
                return apiClient.patch(urls.GROUPS_MEMBERS + group_user_id + "/", { user_accepted: true }, { progress: false });
            case "Accept membership":
                return apiClient.patch(urls.GROUPS_MEMBERS + group_user_id + "/", { admin_accepted: true }, { progress: false });
            case "Get member information":
                return apiClient.get(urls.GROUPS_MEMBERS + group_user_id + "/", { progress: false })
            case "Change permissions":
                return apiClient.patch(urls.GROUPS_MEMBERS + group_user_id + "/", { is_admin: is_admin }, { progress: false });
        }
    },
    follow(action, { follow_id, content_type, object_id, create_by }) {
        content_type = this.withType(content_type);
        switch (action) {
            case "create":
                let data = { content_type: content_type, object_id: object_id, create_by: create_by };
                return apiClient.post(urls.FOLLOWS, data, { progress: false });
            case "delete":
                return apiClient.delete(buildUrl(urls.FOLLOWS, { path: follow_id }), { progress: false });
        }
    },
    company(action, { slug, url, params_filter = {} }) {
        switch (action) {
            case "retrieve":
                return apiClient.get(buildUrl(urls.COMPANIES, {
                    path: slug,
                    queryParams: {
                        expand: ['create_by', 'logo', 'banner', 'industry', 'create_by.avatar', 'address'],
                        omit: ['create_by.is_staff', 'create_by.is_staff', 'create_by.date_joined', 'create_by.last_login', 'create_by.first_name', 'create_by.last_name', 'logo.id', 'logo.thumbnails', 'logo.create_at', 'logo.size', 'logo.create_by', 'banner.id', 'banner.thumbnails', 'banner.create_at', 'banner.size', 'banner.create_by'],
                    }
                }))
            case "Get the posts in the company":
                url = url ? url : buildUrl(urls.COMPANIES, {
                    path: slug + "/" + keys.POSTS,
                    queryParams: {
                        ...params_filter,
                        expand: ['create_by', 'create_by.avatar', 'attaches'],
                        fields: ['id', 'my_reaction', 'content_object', 'create_at', 'content', 'public_code', 'extra', 'summary', 'attaches', 'create_by', 'create_by.id', 'create_by.full_name', 'create_by.avatar.id', 'create_by.avatar.thumbnails', 'attaches.id', 'attaches.content_object']
                    }
                });
                return apiClient.get(url, { progress: false });
            case "Filter files":
                url = url ? url : buildUrl(urls.COMPANIES, {
                    path: slug + urls.FILES,
                    queryParams: params_filter
                });
                return apiClient.get(url, { progress: false });
            case "Get the entire video post attached to this company":
                url = url ? url : buildUrl(urls.COMPANIES, {
                    path: slug + urls.FILES,
                    queryParams: {
                        mimetype__istartswith: 'video/',
                        expand: ['attach_posts', 'attach_posts.post'],
                        fields: ['id', 'lazy_thumbnail_url', 'raw', 'create_at', 'mimetype', 'attach_posts.id', 'attach_posts.post', 'attach_posts.post.content', 'attach_posts.post.create_at', 'attach_posts.post.id'],
                        order_by: "-create_at"
                    }
                });
                return apiClient.get(url, { progress: false });
        }
    },
    job(action, { id, url, params_filter = {} }) {
        switch (action) {
            case "get":
                url = url ? url : buildUrl(urls.JOBS, {
                    queryParams: {
                        ...params_filter,
                        expand: ['company', 'company.logo', 'company.banner', 'industries', 'job_skills.skill', 'location_description', 'create_by'],
                        fields: ['id', 'create_at', 'title', 'experience_level', 'employment_type', 'company.name', 'company.slug', 'company.logo.lazy_thumbnail_url', 'company.banner.lazy_thumbnail_url', 'location_description.label', 'create_by.slug', 'create_by.full_name', 'create_by.email', 'industries.name', 'job_skills.id', 'job_skills.skill.name', 'job_skills.skill.description']
                    }
                });
                return apiClient.get(url, { progress: false });
            case "retrieve":
                return apiClient.get(buildUrl(urls.JOBS, {
                    path: id,
                    queryParams: {
                        expand: ['company', 'company.logo', 'company.banner', 'company.address', 'industries', 'job_skills.skill', 'location_description', 'create_by.avatar', 'create_by']
                    }
                }))
        }
    },
    socket(action, { socket_instance, object_type, object_id, authorization_token }) {
        let data = {};
        if (!socket_instance || (socket_instance && socket_instance.CONNECTING)) {
            return
        }
        switch (action) {
            case "login":
                data = {
                    type: "join",
                    payload: {
                        object: object_type,
                        node: object_id
                    }
                };
                if (object_type == 'user')
                    data.payload["authorization"] = authorization_token;
                socket_instance.sendObj(data)
                break;
            case "logout":
                data = {
                    type: "out",
                    payload: {
                        object: object_type,
                        node: object_id
                    }
                };
                socket_instance.sendObj(data);
                break;
        }
    },
    device(action, { device_id, language_code, country_code, user_id, is_active, device_name, player_id }) {
        let data = {};
        switch (action) {
            case "registration":
                data = {
                    device: device_name,
                    player_id: player_id,
                    language_code: language_code,
                    country_code: country_code,
                    active: true,
                    user: user_id
                }
                return apiClient.post(urls.USER_DEVICES, data, { progress: false });
        }
    },
    notification(action, { notification_id, url, params_filter = {} }) {
        switch (action) {
            case "retrieve":
                return apiClient.get(urls.USER_NOTIFICATIONS + notification_id + '/', { progress: false });
            case "get":
                params_filter['expand'] = ["notification"];
                params_filter['omit'] = ["notification.payload", "notification.template", "notification.recipients"];
                url = url ? url : buildUrl(urls.USER_NOTIFICATIONS, {
                    queryParams: params_filter,
                });
                return apiClient.get(url, { progress: false });
        }
    },
    links(action, { link_id, data = {} }) {
        switch (action) {
            case "extract":
                return apiClient.post(urls.LINKS, data, { progress: false });
            case "delete":
                return apiClient.delete(urls.LINKS + link_id + '/', { progress: false });
        }
    },
    copyToClipboard(str) {
        const el = document.createElement('textarea');  // Create a <textarea> element
        el.value = str;                                 // Set its value to the string that you want copied
        el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
        el.style.position = 'absolute';
        el.style.left = '-9999px';                      // Move outside the screen to make it invisible
        document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
        const selected =
            document.getSelection().rangeCount > 0        // Check if there is any content selected previously
                ? document.getSelection().getRangeAt(0)     // Store selection if found
                : false;                                    // Mark as false to know no selection existed before
        el.select();                                    // Select the <textarea> content
        document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
        document.body.removeChild(el);                  // Remove the <textarea> element
        if (selected) {                                 // If a selection existed before copying
            document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
            document.getSelection().addRange(selected);   // Restore the original selection
        }
    },
}
export { keys, urls, linkTemplates };
export default client;