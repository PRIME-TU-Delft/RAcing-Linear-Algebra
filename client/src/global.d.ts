export {}
// Needed for Typescript to recognize MathQuill as a global variable
declare global {
    interface Window {
        MathQuill: any
    }
}
