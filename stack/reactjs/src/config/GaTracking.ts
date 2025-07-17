// Environment detection
const isProduction = () => {
    return process.env.NODE_ENV === 'production';
};

// GA Event Categories - Standardized for better reporting
export const GA_CATEGORIES = {
    // User Actions
    USER_ACTION: 'user_action',
    NAVIGATION: 'navigation',
    SEARCH: 'search',
    
    // E-commerce
    CART: 'ecommerce_cart',
    PURCHASE: 'ecommerce_purchase',
    PRODUCT: 'ecommerce_product',
    
    // Content Interaction
    CONTENT: 'content_interaction',
    FAVORITE: 'content_favorite',
    GALLERY: 'content_gallery',
    
    // Form Interactions
    FORM: 'form_interaction',
    GIFT_CARD: 'gift_card',
    
    // System Events
    SYSTEM: 'system_event',
    ERROR: 'error_event',
    PERFORMANCE: 'performance'
} as const;

// GA Event Actions - Standardized action types
export const GA_ACTIONS = {
    // Cart Actions
    ADD: 'add',
    REMOVE: 'remove',
    UPDATE: 'update',
    CLEAR: 'clear',
    
    // Content Actions
    VIEW: 'view',
    CLICK: 'click',
    TOGGLE: 'toggle',
    OPEN: 'open',
    CLOSE: 'close',
    
    // Form Actions
    SUBMIT: 'submit',
    VALIDATE: 'validate',
    ERROR: 'error',
    
    // Search Actions
    SEARCH: 'search',
    FILTER: 'filter',
    SORT: 'sort',
    
    // Navigation Actions
    NAVIGATE: 'navigate',
    SCROLL: 'scroll',
    PAGINATE: 'paginate'
} as const;

// GA Event Labels - Standardized label patterns
export const GA_LABELS = {
    // Item Types
    MEAL: 'meal',
    PLAN: 'plan',
    PACKAGING: 'packaging',
    GIFT_CARD: 'gift_card',
    
    // Premium Options
    PREMIUM_OILS: 'premium_oils',
    ORGANIC: 'organic',
    NON_GMO: 'non_gmo',
    VEGAN: 'vegan',
    
    // Actions
    ADDED: 'added',
    REMOVED: 'removed',
    UPDATED: 'updated',
    ENABLED: 'enabled',
    DISABLED: 'disabled'
} as const;

// Helper function for Google Analytics event tracking
export const trackGAEvent = (eventName: string, parameters: Record<string, any>) => {
    // Only track in production environment
    if (!isProduction()) {
        console.log('🔍 GA Event (Development):', eventName, parameters);
        return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, parameters);
    } else {
        console.warn('GA object missing!:', eventName, parameters);
    }
};

// Enhanced tracking function with standardized parameters
export const trackGAEventEnhanced = (
    eventName: string,
    category: string,
    action: string,
    label?: string,
    additionalParams: Record<string, any> = {}
) => {
    const baseParams = {
        event_category: category,
        event_action: action,
        ...(label && { event_label: label }),
        environment: isProduction() ? 'production' : 'development',
        ...additionalParams
    };
    
    trackGAEvent(eventName, baseParams);
};

// Specialized tracking functions for common use cases
export const trackCartEvent = (
    action: string,
    itemType: string,
    itemId: number | string,
    itemName: string,
    quantity: number,
    value: number,
    additionalParams: Record<string, any> = {}
) => {
    trackGAEventEnhanced(
        'cart_interaction',
        GA_CATEGORIES.CART,
        action,
        `${action}_${itemType}`,
        {
            item_id: itemId,
            item_name: itemName,
            item_category: itemType,
            quantity: quantity,
            value: value,
            currency: 'USD',
            ...additionalParams
        }
    );
};

export const trackProductEvent = (
    action: string,
    itemType: string,
    itemId: number | string,
    itemName: string,
    value?: number,
    additionalParams: Record<string, any> = {}
) => {
    trackGAEventEnhanced(
        'product_interaction',
        GA_CATEGORIES.PRODUCT,
        action,
        `${action}_${itemType}`,
        {
            item_id: itemId,
            item_name: itemName,
            item_category: itemType,
            ...(value && { value: value, currency: 'USD' }),
            ...additionalParams
        }
    );
};

export const trackContentEvent = (
    action: string,
    contentType: string,
    contentId: number | string,
    contentName?: string,
    additionalParams: Record<string, any> = {}
) => {
    trackGAEventEnhanced(
        'content_interaction',
        GA_CATEGORIES.CONTENT,
        action,
        `${action}_${contentType}`,
        {
            content_id: contentId,
            content_type: contentType,
            ...(contentName && { content_name: contentName }),
            ...additionalParams
        }
    );
};

export const trackFormEvent = (
    action: string,
    formType: string,
    success: boolean,
    additionalParams: Record<string, any> = {}
) => {
    trackGAEventEnhanced(
        'form_interaction',
        GA_CATEGORIES.FORM,
        action,
        `${action}_${formType}`,
        {
            form_type: formType,
            success: success,
            ...additionalParams
        }
    );
};
