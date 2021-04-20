function SVG(name) {
    SVGS = {
        get dropdown_key() {
            let root = createSVGElement({ width: 18, height: 18, class: 'button-1w5pas' });
            root.innerHTML = '<g fill="none" fill-rule="evenodd"><path d="M0 0h18v18H0"></path><path stroke="currentColor" d="M4.5 4.5l9 9" stroke-linecap="round"></path><path stroke="currentColor" d="M13.5 4.5l-9 9" stroke-linecap="round"></path></g>';
            return root;
        },
        get add_plus() {
            let root = createSVGElement({ width: 24, height: 24, viewBox: '0 0 18 18' }, '<polygon fill-rule="nonzero" fill="currentColor" points="15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8"></polygon>');
            return root;
        },
        get settings_gear() {
            let root = createSVGElement({ width: 20, height: 20, viewBox: '0 0 24 24' }, '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"></path>');
            return root;
        }
    }
    switch (name) {
        case 'dropdown-key':
            return this.SVGS.dropdown_key;
            break;
        case 'add-plus':
            return this.SVGS.add_plus;
            break;
        case 'settings-gear':
            return this.SVGS.settings_gear;
            break;
    
        default:
            break;
    }
}