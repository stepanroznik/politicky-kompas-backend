import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import useQuizStore from '@/store';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/test',
        name: 'Test',
        component: () =>
            import(/* webpackChunkName: "test" */ '../views/Test.vue'),
    },
    {
        path: '/result',
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
        path: '/answers',
        name: 'answers',
        component: () =>
            import(/* webpackChunkName: "answers" */ '../views/Answers.vue'),
    },
    {
        path: '/about',
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
    if (to.path === '/answers' && !store.quizCompleted)
        return next({ path: from.path });
    return next();
});

export default router;
