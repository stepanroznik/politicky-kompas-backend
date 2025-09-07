declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    // eslint-disable-next-line @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.png' {
    const content: string;
    export default content;
}