import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Checkbox with text on the right side of it
@customElement(MagxPanelConstants.PANEL_CHECKBOX)
export class MagxPanelCheckbox extends MagxPanelBaseElement {
    @property({type: Boolean}) public _checked: boolean = false;

    private _checkbox : HTMLInputElement | null = null;

    // Updates the value to the component itself
    set checked(val: boolean) {
        if (this._checked !== val && this._checkbox !== null) {
            let oldVal = this._checked;
            this._checked = val;
            this.requestUpdate('checked', oldVal);
            this._notifyOnValueChange();
        }        
    }
      
    @property()
    get checked() { return this._checked; }

    // Constructor
    constructor() {
        super();        
    }

    // Value changed due to user interaction, going to update internal state and send notification
    private _valueChanged(): void {
        this._checked = this._checkbox?.checked ?? false;
        this._notifyOnValueChange();
    }

    // These are used to remove "flashing" when button is pressed on the element
    private _mousedown(): void { this.doNotRemoveSelected = true; }
    private _mouseup(): void { this.doNotRemoveSelected = false; }

    // Renders the component
    render() {
        return html`
            <div class="container_base" id="container" @mousedown=${this._mousedown} @mouseup=${this._mouseup}>
                <label class="checkbox_label" for="${this.id}">${this.title}</label>
                <label class="checkbox" for="${this.id}">
                    <input id="${this.id}" type="checkbox" .checked=${this.checked} @change=${this._valueChanged} @blur=${this._removeFocus} @focus=${this._addFocus} />
                    <span></span>
                </label>
            </div>
        `;
    }

    // Called before the component is rendered for the first time
    firstUpdated(): void {
        super.firstUpdated();
        this._checkbox = this.shadowRoot?.getElementById(`${this.id}`) as HTMLInputElement;
        this.checked = this.getAttribute("checked") !== null;        
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .checkbox {
            cursor: pointer;
            display: inline;
        }

        .checkbox input {                
            position: absolute;
            left: -99999px;
        }

        .checkbox span {
            height: 16px;
	        width: 100%;
	        display: block;
	        text-indent: 20px;
	        background: var(--magx-panel-checkbox);
        }

        .checkbox input:checked + span {
            background: var(--magx-panel-checkbox-checked);
        }

        .checkbox_label {                
            position: absolute;
            cursor: pointer;
            top: 5px;
            left: 24px;

            top: var(--magx-panel-checkbox-label-top);
            left: var(--magx-panel-checkbox-label-left);
        }
    `];

    // Returns checked value
    getValue(): any {
        return this.checked;
    }

    // Sets the checked value
    setValue(val: any): void {
        this.checked = val;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'magx-panel-checkbox': MagxPanelCheckbox
    }
}