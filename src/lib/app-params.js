/**
 * Application Parameters
 * 
 * Manages application configuration parameters from URL query strings,
 * localStorage, and environment variables. Provides a unified interface
 * for accessing app configuration.
 * 
 * @module lib/app-params
 */

const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

/**
 * Convert camelCase to snake_case
 * 
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 * @private
 */
const toSnakeCase = (str) => {
return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Get application parameter value
 * 
 * Priority order:
 * 1. URL query parameter
 * 2. localStorage value
 * 3. Default value
 * 
 * @param {string} paramName - Parameter name
 * @param {Object} [options] - Configuration options
 * @param {*} [options.defaultValue] - Default value if not found
 * @param {boolean} [options.removeFromUrl] - Remove from URL after reading
 * @returns {string|null} Parameter value or null if not found
 * @private
 */
const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
if (isNode) {
return defaultValue;
}
const storageKey = `base44_${toSnakeCase(paramName)}`;
const urlParams = new URLSearchParams(window.location.search);
const searchParam = urlParams.get(paramName);
if (removeFromUrl) {
urlParams.delete(paramName);
const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
}${window.location.hash}`;
window.history.replaceState({}, document.title, newUrl);
}
if (searchParam) {
storage.setItem(storageKey, searchParam);
return searchParam;
}
if (defaultValue) {
storage.setItem(storageKey, defaultValue);
return defaultValue;
}
const storedValue = storage.getItem(storageKey);
if (storedValue) {
return storedValue;
}
return null;
}

/**
 * Get all application parameters
 * 
 * @returns {Object} Application parameters
 * @private
 */
const getAppParams = () => {
return {
appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
serverUrl: getAppParamValue("server_url", { defaultValue: import.meta.env.VITE_BASE44_BACKEND_URL }),
token: getAppParamValue("access_token", { removeFromUrl: true }),
fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
functionsVersion: getAppParamValue("functions_version"),
}
}

/**
 * Application Parameters Object
 * 
 * Contains configuration parameters for the Base44 application.
 * 
 * @type {Object}
 * @property {string} appId - Base44 application ID
 * @property {string} serverUrl - Base44 backend server URL
 * @property {string|null} token - Authentication access token
 * @property {string} fromUrl - Original URL of the application
 * @property {string|null} functionsVersion - Backend functions version
 * 
 * @example
 * import { appParams } from '@/lib/app-params';
 * 
 * console.log(appParams.appId);
 * console.log(appParams.serverUrl);
 */
export const appParams = {
...getAppParams()
}
