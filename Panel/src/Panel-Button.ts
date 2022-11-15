import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Simple button element
@customElement(MagxPanelConstants.PANEL_BUTTON)
export class MagxPanelButton extends MagxPanelBaseElement {

    // Constructor
    constructor() {
        super();        
    }

    // Notifies button click as a value change
    private _clicked(): void {        
        this._notifyOnValueChange();        
    }

    // Renders the component
    render() {
        return html`
            <div class="container_base" id="container">
                <input id=${this.id} class="button" type="button" value=${this.title} @click=${this._clicked} @blur=${this._removeFocus} @focus=${this._addFocus} />
            </div>
        `;
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .button {
            width: 100%;
            background-color: var(--magx-panel-button-bg);
            color: var(--magx-panel-text-color);
            height: var(--magx-panel-button-height);
            border: var(--magx-panel-button-border);
            font: var(--magx-panel-font);
        }
        
        .button:active {
            background-color: var(--magx-panel-button-bg) !important;
            border: var(--magx-panel-button-border);
        }

        .button:focus {
            border: var(--magx-panel-button-border);
            background-color: var(--magx-panel-button-bg);
            outline: none;
        }

        .button:hover {
            background-color: var(--magx-panel-button-bg-active);
            cursor: pointer;
        }       
    `];

    // Set and get do not make sense for this component
    getValue(): any { return null; }
    setValue(_val: any): void {}
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-button": MagxPanelButton
    }
}