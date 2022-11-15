import { css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Single-line text input component. Text input style can be numbers, password or arbitrary text
@customElement(MagxPanelConstants.PANEL_TEXTINPUT)
export class MagxPanelTextInput extends MagxPanelBaseElement {
    private _inputField: HTMLInputElement | null = null;
    
    @property({type: Number}) public maxLength: number = 524288;
    @property({type: String}) public placeholder: string = "";

    // Min and max are only used if text input is number style
    @property({type: Number}) public min: number = Number.MIN_VALUE;
    @property({type: Number}) public max: number = Number.MAX_VALUE;

    @state() private _text: string = "";
    @state() private _type: string = "";

    set text(val: string) {
        if (this._text !== val && this._inputField !== null) {
            let oldVal = this._text;
            this._text = val;
            this.requestUpdate("text", oldVal);
            this._notifyOnValueChange();
        }        
    }
      
    @property()
    get text(): string { return this._text; }
    
    // Constructor
    constructor() {
        super();

        this.placeholder = this.getAttribute("placeholder") ?? "";
        this._text = this.getAttribute("value") ?? "";
        const typeAttr = this.getAttribute("type") ?? "";
        if (typeAttr === "password" || typeAttr === "number") {
            this._type = typeAttr;
        } else {
            this._type = "text";
        }

        try {
            this.maxLength = parseInt(this.getAttribute("maxlength") ?? "524288");            
        } catch {}

        try {
            const val = this.getAttribute("min");
            if (val !== null) {
                this.min = parseInt(val);
                if (parseInt(this._text) < this.min) {
                    this._text = this.min.toString();
                }
            }
        } catch {}
        
        try {
            const val = this.getAttribute("max");
            if (val !== null) {
                this.max = parseInt(val);
                if (parseInt(this._text) > this.max) {
                    this._text = this.max.toString();
                }
            }            
        } catch {} 
        
    }

    // Checks number value to see if the number would go over/under the limits
    private _checkValue(): void {
        if (!this._inputField) { return; }

        if (this._type === "number") {
            try {
                const val = parseInt(this._inputField.value);
                if (val < this.min) {                    
                    this._inputField.value = this._text;
                } else if (val > this.max) {                    
                    this._inputField.value = this._text;                    
                } else {
                    this._text = this._inputField.value;
                }
             } catch {
                this._text = this._inputField.value;
             }
        }         
    }

    // Every time user changes anything on the input field, event is sent (practically after each key press)
    private _valueChanged(): void { 
        this._checkValue(); 
        this._notifyOnValueChange();
    }

    // Renders the element
    render() {
        return html`
            <div class="container_base" id="container">
                <div class="label"><b>${this.title}</b></div>                
                <input id=${this.id} class="text_input" type="${this._type}" @input=${this._valueChanged} .value=${this.text} @blur=${this._removeFocus} @focus=${this._addFocus} .placeholder=${this.placeholder} maxlength="${this.maxLength}" />
            </div>
        `;
    }

    // Called before the component is rendered for the first time
    firstUpdated(): void {
        super.firstUpdated();
        this._inputField = this.shadowRoot?.getElementById(`${this.id}`) as HTMLInputElement;        
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`         
    `];

    // Returns input field value
    getValue(): any {
        if (!this._inputField) { return ""; }
        return this._inputField.value;
    }

    // Sets the input field value
    setValue(val: any): void {
        if (!this._inputField) { return; }

        if (typeof val === "string" || typeof val === "number") {
            this._inputField.value = val.toString();
            this._text = val.toString();
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-textinput": MagxPanelTextInput
    }
}