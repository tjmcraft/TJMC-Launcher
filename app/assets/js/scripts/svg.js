function SVG(name) {
    SVGS = {
        get dropdown_key() {
            let root = createSVGElement({ width: 18, height: 18, class: 'button-1w5pas' });
            root.innerHTML = '<g fill="none" fill-rule="evenodd"><path d="M0 0h18v18H0"></path><path stroke="currentColor" d="M4.5 4.5l9 9" stroke-linecap="round"></path><path stroke="currentColor" d="M13.5 4.5l-9 9" stroke-linecap="round"></path></g>';
            return root;
            
        }
    }
    switch (name) {
        case 'dropdown-key':
            return this.SVGS.dropdown_key;
            break;
    
        default:
            break;
    }
}