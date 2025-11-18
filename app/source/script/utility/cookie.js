/**
 * Accesses the global function associated with the application's cookie management.
 * The function name is determined dynamically using the application configuration's ID
 * converted to lowercase, appended with the string "Cookie".
 *
 * @type {Function|undefined} - Returns the matching global function if it exists, otherwise undefined.
 */
APP_GLOBAL_FUNCTION[`${APP_GLOBAL_CONFIG.ID.toLowerCase()}Cookie`] = {
  import: self => {
    self.cookie = {
      domain: 'localhost',

      /**
       * Sets a cookie with the specified key, value, and expiration time.
       *
       * @function
       * @param {string} key - The name of the cookie to set.
       * @param {string} data - The value to store in the cookie.
       * @param {number} milliseconds - The duration in milliseconds for which the cookie will remain valid.
       *                                If set to 0 or a negative value, the cookie will not have an expiration date.
       * @throws Will log an error to the console if an exception occurs while setting the cookie.
       */
      set: (key, data, milliseconds) => {
        try {
          const date = new Date();

          date.setTime(date.getTime() + milliseconds);

          const expires = `expires=${date.toUTCString()}`;

          document.cookie = `${key}=${encodeURIComponent(data)}; ${milliseconds > 0 ? expires : ''}; domain=${self.cookie.domain};path=/`;
        }
        catch(error) {
          console.error(error);
        }
      },

      /**
       * Retrieves the value of a specific cookie by its key.
       *
       * @param {string} key - The key of the cookie to retrieve.
       * @returns {string} The value of the specified cookie. Returns an empty string if the cookie is not found.
       * Handles and logs any errors that occur during execution.
       */
      get: key => {
        try {
          const rawName = `${key}=`;
          const rawCookies = document.cookie.split(';');

          for(let index = 0; index < rawCookies.length; index++) {
            let rawCookie = rawCookies[index];

            while(rawCookie.charAt(0) === ' ') {
              rawCookie = rawCookie.substring(1);
            }

            if(rawCookie.indexOf(rawName) === 0) {
              return decodeURIComponent(rawCookie.substring(rawName.length, rawCookie.length));
            }
          }

          return '';
        }
        catch(error) {
          console.error(error);
        }
      },

      /**
       * Removes a cookie by its key.
       *
       * This function attempts to delete a specific cookie by setting its value to an
       * empty string and specifying an expiration date in the past.
       *
       * @param {string} key - The name of the cookie to be deleted.
       */
      remove: key => {
        try {
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${self.cookie.domain}; path=/`;
        }
        catch(error) {
          console.error(error);
        }
      }
    }

    return self;
  }
};