/**
 * 웹 컴포넌트 등록
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define
 */
customElements.define(`${APP_GLOBAL_CONFIG.ID}-boilerplate`,
  /**
   * 웹 컴포넌트 익명 클래스
   * @class
   * @extends HTMLElement
   * @see https://developer.mozilla.org/ko/docs/Web/Web_Components
   * @see https://developer.mozilla.org/ko/docs/Web/API/HTMLElement
   */
  class extends HTMLElement {
    constructor() {
      super();

      const { wcBase } = APP_GLOBAL_FUNCTION;

      wcBase.import(this);

      this.render();
    }

    /**
     * Returns an array of attribute names to be observed. These attributes
     * will trigger the attributeChangedCallback when changed.
     *
     * @return {string[]} An array of attribute names to be observed.
     */
    static get observedAttributes() {
      return [];
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
        this.innerHTML = '';

        this.dispatchEvent(new CustomEvent('disconnected'));
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
    render() {
      try {
        this.innerHTML = `<div>${this.uuid}</div>`;

        this.dispatchEvent(new CustomEvent('rendered'));
      }
      catch(error) {
        this.error(error);
      }
    }
  }
);