/**
 * Retrieves the base configuration or function from the APP_GLOBAL_FUNCTION object
 * using a dynamically generated key. The key is formed by converting the global
 * configuration's `ID` property to lowercase and appending the string 'Base'.
 *
 * @type {any} The resulting base configuration or function from APP_GLOBAL_FUNCTION.
 */
APP_GLOBAL_FUNCTION[`${APP_GLOBAL_CONFIG.ID.toLowerCase()}Base`] = {
  import: self => {
    /**
     * A property that typically stores a universally unique identifier (UUID) for the instance.
     * This is often used to uniquely identify specific objects, ensuring no collisions occur even across distributed systems.
     */
    self.uuid = `${APP_GLOBAL_CONFIG.ID}-${crypto.randomUUID()}`;

    /**
     * Represents an attribute belonging to the current instance of the object.
     * This property is used to store or access specific data associated with the instance.
     */
    self.attribute = new Proxy({}, {
      get: (target, property) => {
        return Reflect.get(target, property);
      },
      set: (target, property, value) => {
        target[property] = value;

        self.render();

        return true;
      }
    });

    /**
     * Represents a property of the object instance.
     * Used to store and manage data within the object scope.
     *
     * @type {*}
     */
    self.property = new Proxy({}, {
      get: (target, property) => {
        return Reflect.get(target, property);
      },
      set: (target, property, value) => {
        target[property] = value;

        self.render();

        return true;
      }
    });

    /**
     * A logging utility typically used to output debug, informational,
     * warning, or error messages. The specific implementation and behavior
     * of this function may depend on its definition within the provided context.
     *
     * This property or method is often defined and utilized within a class or
     * object for standardized logging purposes across an application.
     */
    self.log = message => {
      console.log(`${self.tagName || ''}> ${message}`);
    };

    /**
     * A debug property used to enable or disable debugging functionality.
     * Typically used to control the logging or debugging behavior of the application.
     * Set to `true` to enable debugging, or `false` to disable it.
     *
     * @type {boolean}
     */
    self.debug = message => {
      if(APP_GLOBAL_VARIABLE.ENV.PRODUCTION) {
        return;
      }

      if(_.isString(message)) {
        console.trace(`${self.tagName || self.constructor.name}> debug: ${message}`);
      }
      else if(_.isObject(message)) {
        console.trace(`${self.tagName || self.constructor.name}> debug↓`);
        console.table(message);
      }
      else {
        return '';
      }
    };

    /**
     * Represents an object or value that contains error information.
     * Commonly used for error handling and providing details about errors that occur during execution.
     */
    self.error = error => {
      console.error(`${self.tagName || ''}> error: ${error.message}`);
    };

    /**
     * Await the resolution of a promise associated with the `self` object.
     *
     * This method allows the user to asynchronously wait for a promise to resolve.
     * Typically, it is used when operations depend on the results of asynchronous actions
     * tied to the context in which `self` is referenced.
     *
     * @returns {Promise<any>} A promise that resolves with the value of the awaited asynchronous operation.
     */
    self.await = async time => {
      return new Promise(resolve => setTimeout(resolve, time));
    };

    self.bindAttribute = (key, value) => {
      /**
       * Converts a kebab-case string to camelCase.
       *
       * This function takes a string formatted in kebab-case (words separated by hyphens)
       * and transforms it into camelCase notation. Each hyphen followed by a letter is
       * replaced with the uppercase version of that letter, while all other characters
       * remain unchanged.
       *
       * @param {string} key - The kebab-case string to convert.
       * @returns {string} The string converted to camelCase.
       */
      const toCamelCase = key => {
        return key.replace(/-([a-z])/g, g => {
          return g[1].toUpperCase();
        });
      };

      /**
       * Converts a dot-separated string key into a nested object structure, where each segment of the key
       * represents a nested property. The final value is set at the deepest nested property.
       *
       * @param {string} key - A dot-separated string representing the nested object structure.
       * @param {*} value - The value to assign to the deepest nested property.
       * @returns {Object} - A nested object structure created based on the key.
       */
      const toNestedObject = (key, value) => {
        return key.split('.').reduceRight((previous, current) => ({ [toCamelCase(current)]: previous }), value);
      };

      /**
       * Converts the provided value to a specific output based on its type and content.
       *
       * If the value is `null`, an empty string is returned. If the value matches a
       * numeric pattern, it will be escaped using `_.escape`. If the value can be
       * parsed as JSON, the parsed output will be returned. If the value cannot be
       * parsed or does not match the numeric pattern, it will be escaped.
       *
       * @param {any} value - The input value to be converted.
       * @returns {string|object} The converted value as a string, JSON object, or an empty string.
       */
      const toValue = value => {
        if(value === null) {
          return '';
        }

        try {
          if(/^-?\d+(\.\d+)?$/.test(value)) {
            return _.escape(value);
          }

          return JSON.parse(value);
        }
        catch(error) {
          return _.escape(value);
        }
      };

      if(/\./.test(key)) {
        Object.assign(self.attribute, toNestedObject(key, toValue(value)));
      }
      else {
        self.attribute[toCamelCase(key)] = _.isBoolean(self.attribute[toCamelCase(key)]) ? value === '' : toValue(value);
      }
    };

    /**
     * Converts the provided input into a string suitable for use as an attribute.
     *
     * This method is typically used to ensure that a value is properly serialized
     * when converting or assigning it to an HTML attribute.
     *
     * @param {*} value - The input value to be converted to an attribute-safe string.
     * @returns {string} The string representation of the input value, suitable for attribute assignment.
     */
    self.toAttribute = (attribute, value) => {
      if(value === null || value === undefined) {
        return '';
      }

      if(_.isBoolean(value)) {
        if(value) {
          return attribute;
        }
        else {
          return '';
        }
      }

      if(value.length === 0) {
        return '';
      }

      if(_.isObject(value)) {
        return `${attribute}="${_.escape(JSON.stringify(value))}"`;
      }
      else {
        return `${attribute}="${_.escape(value).replace(/(\r\n|\n|\r)/g, '<br>')}"`;
      }
    };

    /**
     * Detects whether an element is fully visible within the viewport.
     *
     * This method checks if the entire element is visible within the current
     * viewport boundaries without being partially clipped by the edges of the viewport.
     *
     * @method detectFullyVisible
     * @memberof self
     * @returns {boolean} Returns true if the element is fully visible within the
     *          viewport; otherwise, false.
     */
    self.detectFullyVisible = () => {
      const rectangle = self.getBoundingClientRect();
      const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
      const viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);

      if(rectangle.width === 0 || rectangle.height === 0) {
        return false;
      }
      else {
        return (rectangle.top >= 0 && rectangle.left >= 0 && Math.floor(rectangle.bottom) <= viewHeight && Math.floor(rectangle.right) <= viewWidth);
      }
    };

    /**
     * Dispatches a click event programmatically to the target element.
     *
     * This method can be used to simulate a user clicking on an element.
     * It performs actions such as firing the click event for the element
     * it is invoked on. Useful for triggering click-related functionality
     * without requiring user interaction.
     *
     * Ensure proper context and event conditions when using this method
     * to avoid unexpected behavior.
     *
     * @param {Event} event - The event object associated with the click action.
     *                        This provides details about the click event
     *                        including target element, coordinates, etc.
     */
    self.dispatchClick = () => {
      document.dispatchEvent(new CustomEvent('component-clicked', {
        detail: {
          id: self.uuid
        }
      }));
    };

    /**
     * Retrieves the body content of the current instance.
     *
     * @function
     * @returns {string} The body content as a string.
     */
    self.getBody = () => {
      return document.querySelector('body');
    }

    return self;
  }
};