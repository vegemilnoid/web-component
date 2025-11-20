/**
 * 웹 컴포넌트 등록
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define
 */
customElements.define(`${APP_GLOBAL_CONFIG.ID}-index`,
  /**
   *
   * @class
   * @extends HTMLElement
   * @see https://developer.mozilla.org/ko/docs/Web/Web_Components
   * @see https://developer.mozilla.org/ko/docs/Web/API/HTMLElement
   */
  class extends HTMLElement {
    constructor() {
      super();

      const { wcBase, wcCookie, wcNet } = APP_GLOBAL_FUNCTION;

      wcBase.import(this);
      wcCookie.import(this);
      wcNet.import(this);
    }

    /**
     * HTML 속성 등록
     * @return {string[]}
     */
    static get observedAttributes() {
      return ['subject', 'object'];
    }

    /**
     * Invoked each time one of the custom element's attributes is added, removed, or changed.
     * Which attributes to notice change for is specified in a static get observedAttributes method
     * @param name string  속성 이름
     * @param oldValue string 기존 속성 값
     * @param newValue string 신규 속성 값
     */
    attributeChangedCallback(name, oldValue, newValue) {
      try {
        this.bindAttribute(name, newValue);

        this.dispatchEvent(new CustomEvent('attributeChanged'));
      }
      catch(error) {
        this.error(error);
      }
    }

    /**
     * Invoked each time the custom element is appended into a document-connected element.
     * This will happen each time the node is moved, and may happen before the element's contents have been fully parsed.
     * @async
     * @return {Promise<void>}
     */
    async connectedCallback() {
      try {
        this.dispatchEvent(new CustomEvent('connected'));

        const fetched = await this.net.get('/api/sample.json');

        this.debug(fetched);

        this.property.title = fetched.title;
        this.property.description = 'desc';
        this.property.items = fetched.items;

        this.render();
      }
      catch(error) {
        this.error(error);
      }
    }

    /**
     * Invoked each time the custom element is disconnected from the document's DOM.
     */
    disconnectedCallback() {
      try {
        this.dispatchEvent(new CustomEvent('disconnected'));

        this.innerHTML = '';
      }
      catch(error) {
        this.error(error);
      }
    }

    /**
     * Invoked each time the custom element is moved to a new document.
     */
    adoptedCallback() {
      try {
        // TODO
      }
      catch(error) {
        this.error(error);
      }
    }

    /**
     * HTML 렌더링
     * @fires rendered
     */
    render = () => {
      try {
        this.debug('render');

        const { subject, object } = this.attribute;
        const { title, description, items } = this.property;

        this.innerHTML = `<div>
          <h1>${title}</h1>
          <p>
            <span>${subject}</span>는요
            <span>${object}</span>가 좋은 걸 어떡해
          </p>
          <p>${description}</p>
          <ul></ul>
        </div>`;

        this.dispatchEvent(new CustomEvent('rendered'));
      }
      catch(error) {
        this.error(error);
      }
    }
  }
);