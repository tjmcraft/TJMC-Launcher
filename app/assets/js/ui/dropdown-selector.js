class DropdownSelector {
    /**
     * Current selected item
     */
    selected;
    /**
     * Event when select
     */
    onselect;
    constructor(props) {

    }
    createSelector(elements) {
        this.headerText = createElement('h1', null, 'Версии');
        this.svg_element = SVG('dropdown-key');
        const header = createElement('div', { class: 'header' },
            this.headerText,
            this.svg_element
        )
        this.main_dropdown = createElement('div', { class: 'dropdown hidden' });
        const root_dropdown = createElement('div', { class: 'container-f' },
            header,
            this.main_dropdown
        );
        root_dropdown.onclick = (e) => {
            this.svg_element.classList.toggle('open')
            this.main_dropdown.toggle()
        };
        for (const element of elements) {
            this.addItem(element);
        }
        return root_dropdown;
    }
    /**
     * Add new item to the dropdown
     * @param {Object} item - Item to add to dropdown
     * @param {Object} item.name - Name of the item
     * @param {Object} item.value - Type of selected item
     */
    addItem(item) {
        const root_item = createElement('a', null, item.name);
        root_item.onclick = () => {
            this.selectItem(item);
        }
        this.main_dropdown.append(root_item);
    }
    /**
     * Initialy select item
     * @param {Object} item - Item to select
     */
    selectItem(item) {
        this.selected = item;
        this.headerText.innerHTML = item.name;
        if (typeof this.onselect === 'function')
            this.onselect.call(this, item)
    }
}