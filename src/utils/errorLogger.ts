import { reactive } from 'vue';

interface ErrorLog {
    message: string;
    source?: string;
    stack?: string;
    timestamp: number;
}

export const errorState = reactive({
    errors: [] as ErrorLog[],
    addError(message: string, source?: string, stack?: string) {
        this.errors.unshift({
            message,
            source,
            stack,
            timestamp: Date.now(),
        });
        // Keep only last 50 errors
        if (this.errors.length > 50) {
            this.errors.length = 50;
        }
    },
    clearErrors() {
        this.errors = [];
    }
});
