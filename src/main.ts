import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import "./styles/main.scss";
import App from "./App.vue";

import { errorState } from "./utils/errorLogger";

// Global error handlers
window.onerror = (message, source, _lineno, _colno, error) => {
    errorState.addError(String(message), typeof source === 'string' ? source : 'window.onerror', error?.stack);
    return false;
};

window.onunhandledrejection = (event) => {
    errorState.addError(`Unhandled Promise: ${event.reason}`, 'Promise', event.reason?.stack);
};

const app = createApp(App);

app.config.errorHandler = (err, _instance, info) => {
    console.error("Vue Error:", err, info);
    errorState.addError(String(err), `Vue: ${info}`, (err as Error)?.stack);
};

app.use(createPinia());
app.use(router);
app.mount("#app");
