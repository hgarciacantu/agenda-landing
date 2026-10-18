/**
 * Appointment Booking Web Widget
 *
 * Embeddable chat widget for booking appointments.
 * Usage:
 *   <script src="https://your-domain.com/widget.js" data-api-url="https://your-api.com"></script>
 *   <div id="appointment-widget"></div>
 *
 * Or as ES module:
 *   import { initWidget } from 'https://your-domain.com/widget.js';
 *   initWidget({ container: '#appointment-widget', apiUrl: 'https://your-api.com' });
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports)
        : typeof define === 'function' && define.amd
        ? define(['exports'], factory)
        : (global = typeof globalThis !== 'undefined' ? globalThis : global || self,
           factory(global.AppointmentWidget = {}));
})(this, function (exports) {
    'use strict';

    // ========================================================================
    // Configuration & Constants
    // ========================================================================

    const DEFAULT_API_URL = '/api';  // Relative to current origin
    const WIDGET_VERSION = '1.0.0';

    // Action types from API
    const ActionType = {
        GREETING: 'greeting',
        REQUEST_INFO: 'request_info',
        AVAILABLE: 'available',
        UNAVAILABLE: 'unavailable',
        BOOKED: 'booked',
        CANCELLED: 'cancelled',
        ERROR: 'error',
        DAY_SUMMARY: 'day_summary',
    };

    // CSS Classes
    const CSS = {
        WIDGET: 'appt-widget',
        CONTAINER: 'appt-widget__container',
        HEADER: 'appt-widget__header',
        TITLE: 'appt-widget__title',
        SUBTITLE: 'appt-widget__subtitle',
        CLOSE: 'appt-widget__close',
        MINIMIZE: 'appt-widget__minimize',
        MESSAGES: 'appt-widget__messages',
        MESSAGE: 'appt-widget__message',
        MESSAGE_USER: 'appt-widget__message--user',
        MESSAGE_ASSISTANT: 'appt-widget__message--assistant',
        MESSAGE_TEXT: 'appt-widget__message-text',
        MESSAGE_TIME: 'appt-widget__message-time',
        INPUT_AREA: 'appt-widget__input-area',
        INPUT: 'appt-widget__input',
        SEND: 'appt-widget__send',
        SENDING: 'appt-widget__send--sending',
        TYPING: 'appt-widget__typing',
        TYPING_DOT: 'appt-widget__typing-dot',
        BUTTON: 'appt-widget__button',
        BUTTON_PRIMARY: 'appt-widget__button--primary',
        TOAST: 'appt-widget__toast',
        HIDDEN: 'appt-widget--hidden',
        OPEN: 'appt-widget--open',
        MINIMIZED: 'appt-widget--minimized',
        ERROR: 'appt-widget--error',
    };

    // ========================================================================
    // Utility Functions
    // ========================================================================

    function createElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function generateId() {
        return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // ========================================================================
    // Main Widget Class
    // ========================================================================

    class AppointmentWidget {
        constructor(options = {}) {
            this.options = {
                apiUrl: options.apiUrl || this.getApiUrlFromScript() || DEFAULT_API_URL,
                container: options.container || '#appointment-widget',
                theme: options.theme || 'light',
                language: options.language || 'es',
                autoOpen: options.autoOpen !== false,
                position: options.position || 'bottom-right',
                primaryColor: options.primaryColor || '#2563eb',
                businessName: options.businessName || '',
                assistantName: options.assistantName || '',
                welcomeMessage: options.welcomeMessage || '',
                onSessionCreate: options.onSessionCreate || null,
                onMessageSend: options.onMessageSend || null,
                onMessageReceive: options.onMessageReceive || null,
                onBookingComplete: options.onBookingComplete || null,
                onError: options.onError || null,
            };

            this.sessionId = null;
            this.isOpen = false;
            this.isMinimized = false;
            this.isLoading = false;
            this.elements = {};
            this.messageQueue = [];
            this.pollingInterval = null;

            // Bind methods
            this.handleSend = this.handleSend.bind(this);
            this.handleKeydown = this.handleKeydown.bind(this);
            this.toggleWidget = this.toggleWidget.bind(this);
            this.minimizeWidget = this.minimizeWidget.bind(this);
            this.closeWidget = this.closeWidget.bind(this);

            this.init();
        }

        getApiUrlFromScript() {
            const scripts = document.querySelectorAll('script[src*="widget.js"]');
            if (scripts.length > 0) {
                return scripts[0].getAttribute('data-api-url') || null;
            }
            return null;
        }

        init() {
            // Check if container exists
            const container = typeof this.options.container === 'string'
                ? document.querySelector(this.options.container)
                : this.options.container;

            if (!container) {
                console.error('[AppointmentWidget] Container not found:', this.options.container);
                return;
            }

            this.container = container;
            this.injectStyles();
            this.render();
            this.bindEvents();
            this.createSession();

            if (this.options.autoOpen) {
                this.open();
            }
        }

        injectStyles() {
            // Inject CSS variables for theming
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --appt-primary: ${this.options.primaryColor};
                    --appt-primary-hover: ${this.adjustColor(this.options.primaryColor, -20)};
                    --appt-primary-light: ${this.adjustColor(this.options.primaryColor, 40)};
                }
            `;
            document.head.appendChild(style);
        }

        adjustColor(color, amount) {
            // Simple color adjustment for hover/light variants
            const num = parseInt(color.replace('#', ''), 16);
            const r = Math.max(0, Math.min(255, (num >> 16) + amount));
            const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
            const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        render() {
            // Main widget container
            this.elements.wrapper = createElement(`
                <div class="${CSS.WIDGET} ${CSS.MINIMIZED} ${this.options.theme === 'dark' ? 'appt-widget--dark' : ''}"
                     data-position="${this.options.position}">
                    <div class="${CSS.CONTAINER}">
                        <!-- Header -->
                        <header class="${CSS.HEADER}">
                            <div>
                                <div class="${CSS.TITLE}">${this.escapeHtml(this.options.businessName || 'Asistente de Citas')}</div>
                                <div class="${CSS.SUBTITLE}">${this.escapeHtml(this.options.assistantName || 'Tu asistente virtual')}</div>
                            </div>
                            <div class="appt-widget__header-actions">
                                <button class="${CSS.MINIMIZE} appt-widget__icon-btn" aria-label="Minimizar" title="Minimizar">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                                <button class="${CSS.CLOSE} appt-widget__icon-btn" aria-label="Cerrar" title="Cerrar">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        </header>

                        <!-- Messages Area -->
                        <div class="${CSS.MESSAGES}" role="log" aria-live="polite" aria-label="Conversación">
                            <!-- Messages will be inserted here -->
                        </div>

                        <!-- Typing Indicator -->
                        <div class="${CSS.TYPING} ${CSS.HIDDEN}" aria-hidden="true">
                            <span class="${CSS.TYPING_DOT}"></span>
                            <span class="${CSS.TYPING_DOT}"></span>
                            <span class="${CSS.TYPING_DOT}"></span>
                        </div>

                        <!-- Input Area -->
                        <div class="${CSS.INPUT_AREA}">
                            <input type="text"
                                   class="${CSS.INPUT}"
                                   placeholder="Escribe tu mensaje..."
                                   aria-label="Tu mensaje"
                                   autocomplete="off" />
                            <button class="${CSS.SEND} ${CSS.BUTTON} ${CSS.BUTTON_PRIMARY} appt-widget__icon-btn"
                                    aria-label="Enviar"
                                    disabled>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Floating button (when minimized) -->
                    <button class="${CSS.BUTTON} ${CSS.BUTTON_PRIMARY} appt-widget__float-btn"
                            aria-label="Abrir chat"
                            title="Abrir chat">
                        <svg class="appt-widget__float-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span class="appt-widget__notification-badge ${CSS.HIDDEN}">1</span>
                    </button>
                </div>
            `);

            this.container.appendChild(this.elements.wrapper);

            // Cache element references
            this.elements.header = this.elements.wrapper.querySelector(`.${CSS.HEADER}`);
            this.elements.messages = this.elements.wrapper.querySelector(`.${CSS.MESSAGES}`);
            this.elements.typing = this.elements.wrapper.querySelector(`.${CSS.TYPING}`);
            this.elements.input = this.elements.wrapper.querySelector(`.${CSS.INPUT}`);
            this.elements.sendBtn = this.elements.wrapper.querySelector(`.${CSS.SEND}`);
            this.elements.minimizeBtn = this.elements.wrapper.querySelector(`.${CSS.MINIMIZE}`);
            this.elements.closeBtn = this.elements.wrapper.querySelector(`.${CSS.CLOSE}`);
            this.elements.floatBtn = this.elements.wrapper.querySelector(`.appt-widget__float-btn`);
            this.elements.notificationBadge = this.elements.wrapper.querySelector(`.appt-widget__notification-badge`);
        }

        bindEvents() {
            // Send button
            this.elements.sendBtn.addEventListener('click', this.handleSend);

            // Enter key in input
            this.elements.input.addEventListener('keydown', this.handleKeydown);

            // Input change to enable/disable send
            this.elements.input.addEventListener('input', () => {
                this.elements.sendBtn.disabled = !this.elements.input.value.trim();
            });

            // Minimize button
            this.elements.minimizeBtn.addEventListener('click', this.minimizeWidget);

            // Close button
            this.elements.closeBtn.addEventListener('click', this.closeWidget);

            // Float button (when minimized)
            this.elements.floatBtn.addEventListener('click', () => this.open());

            // Click outside to close (optional)
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.elements.wrapper.contains(e.target)) {
                    // Don't auto-close on outside click for better UX
                }
            });

            // Handle visibility change to pause/resume polling
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopPolling();
                } else if (this.isOpen && !this.isMinimized) {
                    this.startPolling();
                }
            });
        }

        // ========================================================================
        // Session Management
        // ========================================================================

        async createSession() {
            try {
                this.setLoading(true);
                const response = await this.apiRequest('/session', 'POST', {
                    session_id: this.sessionId  // Will be null on first call
                });

                this.sessionId = response.session_id;
                this.addMessage('assistant', response.welcome_message);

                if (this.options.onSessionCreate) {
                    this.options.onSessionCreate(this.sessionId);
                }
            } catch (error) {
                this.handleError('No se pudo iniciar la sesión. Por favor recarga la página.', error);
            } finally {
                this.setLoading(false);
            }
        }

        async sendMessage(message) {
            if (!this.sessionId) {
                await this.createSession();
                if (!this.sessionId) return;
            }

            try {
                this.setLoading(true);
                const response = await this.apiRequest('/chat', 'POST', {
                    message: message,
                    session_id: this.sessionId
                });

                this.sessionId = response.session_id;
                this.addMessage('assistant', response.message);

                // Handle special actions
                this.handleActionResponse(response);

                if (this.options.onMessageReceive) {
                    this.options.onMessageReceive(response);
                }

                return response;
            } catch (error) {
                this.handleError('Error al enviar el mensaje. Por favor intenta de nuevo.', error);
            } finally {
                this.setLoading(false);
            }
        }

        handleActionResponse(response) {
            switch (response.action) {
                case ActionType.BOOKED:
                    this.showToast('¡Cita confirmada! ✅', 'success');
                    if (this.options.onBookingComplete) {
                        this.options.onBookingComplete(response.data);
                    }
                    break;
                case ActionType.CANCELLED:
                    this.showToast('Cita cancelada', 'info');
                    break;
                case ActionType.ERROR:
                    this.showToast('Ha ocurrido un error', 'error');
                    break;
                case ActionType.DAY_SUMMARY:
                    // Day summary shown as regular message
                    break;
            }
        }

        // ========================================================================
        // API Communication
        // ========================================================================

        async apiRequest(endpoint, method = 'GET', body = null) {
            const url = this.options.apiUrl.replace(/\/+$/, '') + endpoint;
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'omit',  // No cookies needed
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            return response.json();
        }

        // ========================================================================
        // UI Methods
        // ========================================================================

        addMessage(role, text) {
            const messageEl = createElement(`
                <div class="${CSS.MESSAGE} ${role === 'user' ? CSS.MESSAGE_USER : CSS.MESSAGE_ASSISTANT}" data-message-id="${generateId()}">
                    <div class="${CSS.MESSAGE_TEXT}">${this.formatMessage(text)}</div>
                    <div class="${CSS.MESSAGE_TIME}">${formatTime(new Date())}</div>
                </div>
            `);

            this.elements.messages.appendChild(messageEl);
            this.scrollToBottom();

            // Limit message history to prevent memory issues
            this.limitMessages();
        }

        formatMessage(text) {
            // Convert URLs to links
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            text = escapeHtml(text).replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

            // Convert line breaks
            text = text.replace(/\n/g, '<br>');

            return text;
        }

        scrollToBottom() {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }

        limitMessages(maxMessages = 100) {
            const messages = this.elements.messages.querySelectorAll(`.${CSS.MESSAGE}`);
            if (messages.length > maxMessages) {
                for (let i = 0; i < messages.length - maxMessages; i++) {
                    messages[i].remove();
                }
            }
        }

        showTyping(show) {
            this.elements.typing.classList.toggle(CSS.HIDDEN, !show);
            if (show) {
                this.scrollToBottom();
            }
        }

        setLoading(loading) {
            this.isLoading = loading;
            this.elements.sendBtn.disabled = loading || !this.elements.input.value.trim();
            this.elements.sendBtn.classList.toggle(CSS.SENDING, loading);
            this.elements.input.disabled = loading;
        }

        open() {
            this.isOpen = true;
            this.isMinimized = false;
            this.elements.wrapper.classList.remove(CSS.HIDDEN, CSS.MINIMIZED);
            this.elements.wrapper.classList.add(CSS.OPEN);
            this.elements.floatBtn.classList.add(CSS.HIDDEN);
            this.elements.input.focus();
            this.startPolling();
        }

        close() {
            this.isOpen = false;
            // Colapsar al bubble flotante en vez de ocultar el wrapper:
            // el botón flotante vive dentro del wrapper, así que --hidden
            // lo escondía también y el chat quedaba inaccesible.
            this.elements.wrapper.classList.add(CSS.MINIMIZED);
            this.elements.wrapper.classList.remove(CSS.OPEN, CSS.HIDDEN);
            this.elements.floatBtn.classList.remove(CSS.HIDDEN);
            this.stopPolling();
        }

        minimizeWidget() {
            this.isMinimized = true;
            this.isOpen = false;
            this.elements.wrapper.classList.add(CSS.MINIMIZED);
            this.elements.wrapper.classList.remove(CSS.OPEN);
            this.elements.floatBtn.classList.remove(CSS.HIDDEN);
            this.stopPolling();
        }

        closeWidget() {
            this.close();
        }

        toggleWidget() {
            if (this.isOpen && !this.isMinimized) {
                this.minimizeWidget();
            } else {
                this.open();
            }
        }

        showToast(message, type = 'info') {
            // Remove existing toast
            const existing = this.elements.wrapper.querySelector(`.${CSS.TOAST}`);
            if (existing) existing.remove();

            const toast = createElement(`
                <div class="${CSS.TOAST} appt-widget__toast--${type}">
                    ${this.escapeHtml(message)}
                </div>
            `);

            this.elements.wrapper.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        handleSend() {
            const message = this.elements.input.value.trim();
            if (!message || this.isLoading) return;

            this.addMessage('user', message);
            this.elements.input.value = '';
            this.elements.sendBtn.disabled = true;

            if (this.options.onMessageSend) {
                this.options.onMessageSend(message);
            }

            this.showTyping(true);
            this.sendMessage(message).finally(() => {
                this.showTyping(false);
            });
        }

        handleKeydown(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        }

        handleError(message, error) {
            console.error('[AppointmentWidget]', message, error);
            this.addMessage('assistant', 'Lo siento, hubo un problema. Por favor intenta de nuevo más tarde.');

            if (this.options.onError) {
                this.options.onError(error);
            }
        }

        escapeHtml(text) {
            return escapeHtml(text);
        }

        // ========================================================================
        // Polling for real-time updates (optional)
        // ========================================================================

        startPolling() {
            this.stopPolling();
            // Poll every 30 seconds for new messages (if server supports it)
            this.pollingInterval = setInterval(() => {
                // Could implement server-sent events or long polling here
            }, 30000);
        }

        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        }

        // ========================================================================
        // Public API
        // ========================================================================

        destroy() {
            this.stopPolling();
            if (this.elements.wrapper && this.elements.wrapper.parentNode) {
                this.elements.wrapper.parentNode.removeChild(this.elements.wrapper);
            }
        }

        getSessionId() {
            return this.sessionId;
        }
    }

    // ========================================================================
    // Auto-initialization from script tag
    // ========================================================================

    function autoInit() {
        const scripts = document.querySelectorAll('script[data-auto-init="true"][src*="widget.js"]');
        scripts.forEach(script => {
            const container = script.getAttribute('data-container') || '#appointment-widget';
            const apiUrl = script.getAttribute('data-api-url');
            const theme = script.getAttribute('data-theme') || 'light';
            const position = script.getAttribute('data-position') || 'bottom-right';
            const primaryColor = script.getAttribute('data-primary-color') || '#2563eb';

            const widgetContainer = document.querySelector(container);
            if (widgetContainer && !widgetContainer.hasAttribute('data-widget-initialized')) {
                widgetContainer.setAttribute('data-widget-initialized', 'true');
                new AppointmentWidget({
                    container: widgetContainer,
                    apiUrl: apiUrl,
                    theme: theme,
                    position: position,
                    primaryColor: primaryColor,
                });
            }
        });
    }

    // Run auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // ========================================================================
    // Exports
    // ========================================================================

    exports.AppointmentWidget = AppointmentWidget;
    exports.initWidget = function (options) {
        return new AppointmentWidget(options);
    };
    exports.version = WIDGET_VERSION;
});