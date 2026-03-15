import { createRouter, createWebHistory } from 'vue-router';
import SearchView from '../views/SearchView.vue';
import CollectionsView from '../views/CollectionsView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: SearchView,
        },
        {
            path: '/library',
            name: 'library',
            component: CollectionsView,
        },
    ],
});

export default router;
