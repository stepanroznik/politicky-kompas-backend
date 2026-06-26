import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Legacy2021Home from '../views/Legacy2021Home.vue';
import useQuizStore from '@frontend/store';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/2021',
        name: 'Legacy2021Home',
        component: Legacy2021Home,
    },
    {
        path: '/2021/test',
        alias: '/test',
        name: 'Test',
        component: () =>
            import(/* webpackChunkName: "test" */ '../views/Test.vue'),
    },
    {
        path: '/kompas',
        name: 'Compass2026',
        component: () =>
            import(/* webpackChunkName: "compass-2026" */ '../views/Compass2026.vue'),
    },
    {
        path: '/kompas/vysledek',
        name: 'Compass2026Result',
        component: () =>
            import(/* webpackChunkName: "compass-2026" */ '../views/Compass2026Result.vue'),
    },
    {
        path: '/2021/result',
        alias: '/result',
        name: 'Result',
        component: () =>
            import(/* webpackChunkName: "test" */ '../views/Result.vue'),
    },
    {
        path: '/answers-dev',
        name: 'answers-dev',
        component: () =>
            import(/* webpackChunkName: "answers" */ '../views/AnswersDev.vue'),
    },
    {
        path: '/2021/answers',
        alias: '/answers',
        name: 'answers',
        component: () =>
            import(/* webpackChunkName: "answers" */ '../views/Answers.vue'),
    },
    {
        path: '/2021/about',
        alias: '/about',
        name: 'About',
        component: () =>
            import(/* webpackChunkName: "about" */ '../views/About.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const store = useQuizStore();
    if ((to.path === '/answers' || to.path === '/2021/answers') && !store.quizCompleted)
        return next({ path: from.path });
    return next();
});

export default router;
