const logger = require('./logger');
const { getSetting } = require('./settingsManager');

class WebhookErrorHandler {
    constructor() {
        this.retryAttempts = new Map();
        this.maxRetries = getSetting('webhook.max_retries', 3);
        this.retryDelay = getSetting('webhook.retry_delay_ms', 5000);
        this.idempotencyWindow = getSetting('webhook.idempotency_window_ms', 300000); // 5 minutes
        this.processedWebhooks = new Map();
    }

    /**
     * Validates webhook payload structure and required fields
     * @param {Object} payload - Webhook payload
     * @param {string} gateway - Payment gateway name
     * @returns {Object} - Validation result { valid: boolean, errors: string[] }
     */
    validatePayload(payload, gateway) {
        const errors = [];

        if (!payload) {
            errors.push('Payload is null or undefined');
            return { valid: false, errors };
        }

        // Gateway-specific validation
        switch (gateway.toLowerCase()) {
            case 'midtrans':
                if (!payload.order_id) errors.push('Missing order_id');
                if (!payload.transaction_status) errors.push('Missing transaction_status');
                if (!payload.gross_amount) errors.push('Missing gross_amount');
                break;

            case 'xendit':
                if (!payload.external_id) errors.push('Missing external_id');
                if (!payload.status) errors.push('Missing status');
                if (!payload.amount) errors.push('Missing amount');
                break;

            case 'tripay':
                if (!payload.merchant_ref) errors.push('Missing merchant_ref');
                if (!payload.status) errors.push('Missing status');
                if (!payload.amount) errors.push('Missing amount');
                break;

            default:
                errors.push(`Unknown gateway: ${gateway}`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Checks if webhook has already been processed (idempotency)
     * @param {string} webhookId - Unique webhook identifier
     * @param {string} gateway - Payment gateway name
     * @returns {boolean} - True if already processed
     */
    isAlreadyProcessed(webhookId, gateway) {
        const key = `${gateway}:${webhookId}`;
        const processedAt = this.processedWebhooks.get(key);

        if (processedAt) {
            const now = Date.now();
            const timeDiff = now - processedAt;

            // If within idempotency window, consider it processed
            if (timeDiff < this.idempotencyWindow) {
                logger.warn(`[WEBHOOK_IDEMPOTENCY] Duplicate webhook detected: ${key} (${timeDiff}ms ago)`);
                return true;
            } else {
                // Remove expired entry
                this.processedWebhooks.delete(key);
            }
        }

        // Mark as processed
        this.processedWebhooks.set(key, Date.now());
        return false;
    }

    /**
     * Handles webhook processing with retry logic
     * @param {Function} processor - Webhook processing function
     * @param {Object} payload - Webhook payload
     * @param {Object} headers - Request headers
     * @param {string} gateway - Payment gateway name
     * @returns {Promise<Object>} - Processing result
     */
    async processWithRetry(processor, payload, headers, gateway) {
        const webhookId = this.generateWebhookId(payload, gateway);
        const startTime = Date.now();

        // Validate payload first
        const validation = this.validatePayload(payload, gateway);
        if (!validation.valid) {
            logger.error(`[WEBHOOK_VALIDATION] Invalid payload for ${gateway}:`, {
                errors: validation.errors,
                payload: JSON.stringify(payload).substring(0, 500)
            });
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Check idempotency
        if (this.isAlreadyProcessed(webhookId, gateway)) {
            return {
                success: true,
                message: 'Webhook already processed (idempotent)',
                idempotent: true
            };
        }

        let lastError;
        const retryKey = `${gateway}:${webhookId}`;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                logger.info(`[WEBHOOK_PROCESSING] Processing ${gateway} webhook (attempt ${attempt}/${this.maxRetries}): ${webhookId}`);

                const result = await this.withTimeout(
                    processor(payload, headers),
                    getSetting('webhook.timeout_ms', 30000) // 30 second timeout
                );

                // Clear retry count on success
                this.retryAttempts.delete(retryKey);

                const processingTime = Date.now() - startTime;
                logger.info(`[WEBHOOK_SUCCESS] ${gateway} webhook processed successfully in ${processingTime}ms: ${webhookId}`, {
                    attempt,
                    processingTime,
                    result: typeof result === 'object' ? JSON.stringify(result) : result
                });

                return result;

            } catch (error) {
                lastError = error;
                const processingTime = Date.now() - startTime;

                logger.error(`[WEBHOOK_ERROR] ${gateway} webhook processing failed (attempt ${attempt}/${this.maxRetries}): ${webhookId}`, {
                    error: error.message,
                    stack: error.stack,
                    processingTime,
                    payload: JSON.stringify(payload).substring(0, 500)
                });

                // Track retry attempts
                this.retryAttempts.set(retryKey, attempt);

                // Don't retry on certain errors
                if (this.isNonRetryableError(error)) {
                    logger.warn(`[WEBHOOK_ERROR] Non-retryable error for ${gateway}: ${error.message}`);
                    break;
                }

                // Wait before retry (except on last attempt)
                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay * attempt); // Exponential backoff
                }
            }
        }

        // All retries exhausted
        const totalTime = Date.now() - startTime;
        logger.error(`[WEBHOOK_FAILED] ${gateway} webhook failed after ${this.maxRetries} attempts (${totalTime}ms): ${webhookId}`, {
            finalError: lastError.message,
            payload: JSON.stringify(payload).substring(0, 500)
        });

        // Alert on critical failures
        this.alertCriticalFailure(gateway, webhookId, lastError);

        throw lastError;
    }

    /**
     * Generates unique webhook identifier for idempotency
     * @param {Object} payload - Webhook payload
     * @param {string} gateway - Payment gateway name
     * @returns {string} - Unique identifier
     */
    generateWebhookId(payload, gateway) {
        let id = '';

        switch (gateway.toLowerCase()) {
            case 'midtrans':
                id = `${payload.order_id}:${payload.transaction_status}:${payload.gross_amount}`;
                break;
            case 'xendit':
                id = `${payload.external_id}:${payload.status}:${payload.amount}`;
                break;
            case 'tripay':
                id = `${payload.merchant_ref}:${payload.status}:${payload.amount}`;
                break;
            default:
                id = `${gateway}:${JSON.stringify(payload)}`;
        }

        return id;
    }

    /**
     * Determines if an error should not be retried
     * @param {Error} error - The error to check
     * @returns {boolean} - True if non-retryable
     */
    isNonRetryableError(error) {
        const nonRetryablePatterns = [
            'validation failed',
            'invalid signature',
            'unauthorized',
            'forbidden',
            'not found',
            'bad request'
        ];

        const errorMessage = error.message.toLowerCase();
        return nonRetryablePatterns.some(pattern => errorMessage.includes(pattern));
    }

    /**
     * Wraps a promise with timeout
     * @param {Promise} promise - Promise to wrap
     * @param {number} timeoutMs - Timeout in milliseconds
     * @returns {Promise} - Promise with timeout
     */
    async withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
            )
        ]);
    }

    /**
     * Delays execution for specified milliseconds
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} - Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Alerts on critical webhook processing failures
     * @param {string} gateway - Payment gateway name
     * @param {string} webhookId - Webhook identifier
     * @param {Error} error - The error that occurred
     */
    alertCriticalFailure(gateway, webhookId, error) {
        logger.error(`[WEBHOOK_CRITICAL] Critical webhook failure for ${gateway}: ${webhookId}`, {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Here you could add additional alerting mechanisms:
        // - Send email alerts
        // - Send Slack/Discord notifications
        // - Trigger monitoring alerts
        // - Log to external monitoring service
    }

    /**
     * Gets webhook processing statistics
     * @returns {Object} - Statistics object
     */
    getStats() {
        return {
            processedWebhooks: this.processedWebhooks.size,
            activeRetries: this.retryAttempts.size,
            maxRetries: this.maxRetries,
            retryDelay: this.retryDelay,
            idempotencyWindow: this.idempotencyWindow
        };
    }

    /**
     * Cleans up expired idempotency entries
     */
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, timestamp] of this.processedWebhooks.entries()) {
            if (now - timestamp > this.idempotencyWindow) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.processedWebhooks.delete(key));

        if (expiredKeys.length > 0) {
            logger.info(`[WEBHOOK_CLEANUP] Cleaned up ${expiredKeys.length} expired webhook entries`);
        }
    }
}

module.exports = WebhookErrorHandler;
