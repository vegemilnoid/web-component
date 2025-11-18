/**
 * Accesses a global function dynamically based on the configuration ID.
 *
 * This expression dynamically constructs the property name by converting
 * the `ID` property of the `APP_GLOBAL_CONFIG` object to lowercase and appending `Net`,
 * which is then used to reference a function within the `APP_GLOBAL_FUNCTION` object.
 *
 * Use this to retrieve or call a specific global function that is associated
 * with the current configuration's identifier.
 */
APP_GLOBAL_FUNCTION[`${APP_GLOBAL_CONFIG.ID.toLowerCase()}Net`] = {
  import: self => {
    self.net = {
      /**
       * Sends a GET request to the specified URL and retrieves the JSON response.
       *
       * @param {string} target - The URL to which the GET request is sent.
       * @returns {Promise<Object>} A promise that resolves to the JSON-parsed response.
       * @throws {TypeError} If the response cannot be parsed as JSON.
       */
      get: async target => {
        const fetched = await fetch(target, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Authorization: ''
          }
        });

        return await fetched.json();;
      },

      /**
       * Makes an HTTP POST request to the specified target URL with the given body.
       *
       * @function
       * @async
       * @param {string} target - The URL to which the POST request will be sent.
       * @param {Object} body - The data to be sent as the request body. It will be serialized to JSON.
       * @returns {Promise<Object>} A promise that resolves to the JSON response from the server.
       */
      post: async (target, body) => {
        const fetched = await fetch(target, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Authorization: ''
          },
          body: JSON.stringify(body)
        });

        return await fetched.json();
      },

      /**
       * Sends an HTTP PUT request to the specified target URL with the provided body as JSON payload.
       *
       * @param {string} target - The URL to send the HTTP PUT request to.
       * @param {Object} body - The data object to be sent as the request payload.
       * @returns {Promise<Object>} A promise that resolves to the JSON-parsed response of the request.
       * @throws Will throw an error if the fetch request fails or the response can't be parsed as JSON.
       */
      put: async (target, body) => {
        const fetched = await fetch(target, {
          method: 'PUT',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer pfj3RPNGPf7NyMPxiAV5RP99SdSbetLxBWFvau8bdU8SkMpg`
          },
          body: JSON.stringify(body)
        });

        return await fetched.json();
      },

      /**
       * Sends a DELETE request to the specified target URL.
       *
       * The request is made with CORS mode, no cache, and credentials set to 'same-origin'.
       * The 'Content-Type' of the request is set to 'application/json', and an Authorization header is included but must be provided by the caller.
       *
       * @param {string} target - The endpoint to which the DELETE request is made.
       * @returns {Promise<Object>} - A promise that resolves to the parsed JSON response from the server.
       */
      delete: async target => {
        const fetched = await fetch(target, {
          method: 'DELETE',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Authorization: ''
          }
        });

        return await fetched.json();
      },
    }

    return self;
  }
}