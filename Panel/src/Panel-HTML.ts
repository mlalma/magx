import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Element that provides chance to add arbitrary HTML to a panel event
@customElement(MagxPanelConstants.PANEL_HTML)
export class MagxPanelHTML extends MagxPanelBaseElement {

    // Constructor
    constructor() {
        super();
    }

    // Renders the element
    render() {
        return html`
            <div class="container_base" id="container">
                <div class="label"><b>${this.title}</b></div>
                <div id="${this.id}">
                    <slot></slot>
                </div>                
            </div>
        `;
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css``];

    // Returns the current HTML rendered on screen
    getValue(): any {
        return this.innerHTML;
    }

    // Updates the HTML markup on the element
    setValue(val: any): void {
        if (typeof val === "string") {
            this.innerHTML = val;
        }        
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-html": MagxPanelHTML
    }
}