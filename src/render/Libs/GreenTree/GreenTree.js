/**
 * GreenTree.js Library
 *
 * Copyright (c) TJMC-Company, Inc. and its affiliates. All Rights Reserved.
 *
 * Created for TJMC-Company, Inc. by MakAndJo
 */


(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
		typeof define === 'function' && define.amd ? define(['exports'], factory) :
			(global = global || self, factory(global.GreenTree = {}));
}(this, ((exports) => {
	/**
	 * Abstract element implementation
	 */
	class Component {

		/**
		 * Root content of the element
		 * @type {Element}
		 */
		#root = null;

		/**
		 * Props of the element
		 */
		#props = {};

		/**
		 * State storage for element
		 */
		state = {};

		/**
		 * Type of element
		 */
		type = null;

		/**
		 * Set status of the element
		 */
		#initialized = false;

		_mountCallback = null;

		/**
		 * Element constructor
		 * @param {*} props - Properties for the element
		 */
		constructor(props = {}) {
			this.#props = props;
		}

		/**
		 * Create Element method
		 */
		create(props = {}) {
			return document.createElement('div');
		}

		/**
		 * Set state of the element
		 * @param {*} state
		 */
		setState(state = {}) {
			//console.debug('[ELX] Set state: ', state);
			this._updateElement(null, this.#props, state);
		}

		/**
		 * Update Element method
		 */
		_updateElement(element = null, props = {}, state = {}, force = false) {
			props = props || this.#props;
			state = state || this.state;

			if (!this.#initialized) return;

			if (this.shouldComponentUpdate(props, state) || force) {
				//console.debug('[ELX] Update element (->) : ', this.#root);
				this.state = state;
				window.requestAnimationFrame(() => {
					const new_element = element || this.create.call(this, props);
					if (new_element instanceof HTMLElement) {
						if (this.#root.childNodes.length > 0) {
							this.#root.childNodes.forEach((node) => {
								if (!new_element.contains(node)) node._gtr._unmount();
							});
						}
						this.#root && this.#root.replaceWith(new_element);
					}
					this.#root = (new_element);
				});
				return true;
			}
			//console.debug('[ELX] Update element (<-) : ', this.#root);
			return false;
		}

		_mountElement() {
			if (this.#root = this.create.call(this, this.props)) {
				this.#initialized = true;
				if (this.#root instanceof HTMLElement) {
					this.#root._gtr = this;
				}
				this._updateElement(this.#root, this.props, null, true);
				//console.log("Mount:", this.#root);
				this._mountCallback = this.componentDidMount.call(this);
			}
		}

		shouldComponentUpdate(nextProps, nextState) {
			//console.debug('shouldComponentUpdate:', JSON.stringify(this.#props) != JSON.stringify(nextProps), '+', JSON.stringify(this.state) != JSON.stringify(nextState), '->', (JSON.stringify(this.#props) != JSON.stringify(nextProps) || JSON.stringify(this.state) != JSON.stringify(nextState)))
			//console.debug('shouldComponentUpdate:', '\nProps:', this.#props, '\nNextProps:', nextProps, '\nState:', this.state, '\nNextState:', nextState,)
			return (
				(JSON.stringify(this.#props) != JSON.stringify(nextProps)) ||
				(JSON.stringify(this.state) != JSON.stringify(nextState))
			);
		}

		_unmount() {
			this.#root = null;
			this.componentWillUnmount();
			if (typeof this._mountCallback === 'function') {
				this._mountCallback.call(this);
			}
		}

		componentDidMount() { }

		componentWillUnmount() { }

		/**
		 * Get element props (Object)
		 * @type {Object}
		 */
		get props() {
			return this.#props;
		}

		/**
		 * Get element content (HTMLObject)
		 * @return {HTMLObject}
		 */
		get content() {
			if (!this.#initialized || !this.#root) this._mountElement.call(this);
			return this.#root;
		}

		/**
		 * Remove element method
		 */
		remove() {
			this.#root.remove();
		}

	}

	/**
	 * Creates new element with given attributes
	 * @param {String} tag - The element tag
	 * @param {Object} attrs - The attributes for this element
	 * @param  {Element} children - Children for element
	 * @returns {Element} instance of element
	 */
	function createElement(type = "div", attributes = null, children = null) {
		let propName;
		let props = {};
		let key = null;
		let ref = null;
		let self = null;
		let source = null;
		let unsafeHTML = false;
		let namespaceURI = null;

		if (attributes != null) {
			if (hasValidRef(attributes)) {
				ref = attributes.ref;
			}
			unsafeHTML = attributes.unsafeHTML === true;
			namespaceURI = attributes.ns;
			for (propName in attributes) {
				if (attributes.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
					props[propName] = attributes[propName];
				}
			}
		}

		let childrenLength = arguments.length - 2;

		if (childrenLength === 1) {
			props.children = children;
		} else if (childrenLength > 1) {
			let childArray = Array(childrenLength);
			for (let i = 0; i < childArray.length; i++) {
				childArray[i] = arguments[i + 2];
			}
			{
				Object.freeze && Object.freeze(childArray);
			}
			props.children = childArray;
		}

		let element_instance = null;

		if (typeof type === 'string') {

			element_instance = new Component(props);
			//element_instance.type = type;
			element_instance.create = function () {

				let dom_element;

				if (namespaceURI) {
					dom_element = document.createElementNS(namespaceURI, type);
				} else {
					dom_element = document.createElement(type);
				}

				if (this.props) for (const prop in this.props) {
					if (prop && this.props.hasOwnProperty(prop) && !RESERVED_PROPS.hasOwnProperty(prop)) {
						let value = this.props[prop];
						if (value instanceof Object) {
							if (value instanceof Array) // if array
								dom_element.setAttribute(prop, value.filter(e => e).join(' '));
							else if (typeof value === 'function' && value != null) // if function
								dom_element[prop] = value;
							else Object.assign(dom_element[prop], value);
						} else {
							if (value === true) // if simple true
								dom_element.setAttribute(prop, prop);
							else if (typeof value === 'string' && value != null) // if string
								dom_element.setAttribute(prop, value);
							else if (value !== false && value != null) // something else
								dom_element.setAttribute(prop, value.toString());
						}
					}
				}

				if (this.props.children) {
					Array.of(this.props.children)
						.flat(Infinity)
						.filter(e => e)
						.forEach(child => {
							if (!unsafeHTML) dom_element.append(child);
							else dom_element.innerHTML += child;
						});
				}

				return dom_element;
			};
			//console.debug('StringEl:', element_instance);
		} else if (type.__proto__ === Component) {
			element_instance = new type(props);
			//console.debug('AbstractEl:', element_instance);
		} else if (typeof type === 'function') {
			element_instance = new Component(props);
			element_instance.create = type;
			//console.debug('FunctionEl:', element_instance);
		}

		if (element_instance.content) {
			if (ref) {
				if (typeof ref === 'function') ref.call(this, element_instance.content);
				else if (typeof ref === 'object') ref.current = element_instance.content;
				//else if (typeof attributes.ref === 'string') this.refs[attributes.ref] = element_instance.content
			}
			return element_instance.content;
		} else {
			console.warn('[GreenTree]', 'Your element is not generated!');
		}
		return null;

	}

	let hasOwnProperty$1 = Object.prototype.hasOwnProperty;
	const RESERVED_PROPS = { children: true, ref: true, unsafeHTML: true, ns: true };
	const GREEN_ELEMENT_TYPE = Symbol('green.element');

	function hasValidRef(config) {
		{
			if (hasOwnProperty$1.call(config, 'ref')) {
				let getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
				if (getter && getter.isGreenWarning) {
					return false;
				}
			}
		}
		return config.ref !== undefined;
	}



	function createRef() {
		let refObject = { current: null };
		Object.seal(refObject);
		return refObject;
	}

	function Render(element, target) {
		if (!element instanceof Component) throw new Error('Element is not instance of Component');
		if (!target instanceof HTMLElement) throw new Error('Target is not instance of HTMLElement');
		target.removeAllChildNodes();
		if (element instanceof Array) {
			element = element.filter(e => Boolean(e?.nodeType));
			target.append(...element);
		} else {
			target.append(...[element]);
		}
	}

	exports.Component = Component;
	exports.createElement = createElement;
	exports.createRef = createRef;
	exports.Render = Render;
})));