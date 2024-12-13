// global.d.ts
export {}; // Ensures this file is treated as a module.

declare global {
    interface Window {
        cy: any;
        store: any;
    }
}
