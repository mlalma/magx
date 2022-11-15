import { css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Text area element. Difference between text area and text input is that 
// text area is multi-line compnent whereas TextInput is single-line
@customElement(MagxPanelConstants.PANEL_TEXTAREA)
export class MagxPanelTextArea extends MagxPanelBaseElement {
    private _inputField: HTMLTextAreaElement | null = null;
    
    @property({type: Number}) public maxLength: number = 524288;
    @property({type: String}) public placeholder: string = "";

    @state() private _text: string = "";

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
        try {
            this.maxLength = parseInt(this.getAttribute("maxlength") ?? "524288");            
        } catch {}                
    }

    // Called everytime user does a modification (single keytap) and changes the contents of the textarea
    private _valueChanged(): void {
        if (!this._inputField) { return; }
        this._text = this._inputField.value;
        this._notifyOnValueChange();
    }

    // Renders the element
    render() {
        return html`
            <div class="container_base" id="container">
                <div class="label"><b>${this.title}</b></div>                
                <textarea id=${this.id} class="textarea" @input=${this._valueChanged} .value=${this.text} @blur=${this._removeFocus} @focus=${this._addFocus} .placeholder=${this.placeholder} maxlength="${this.maxLength}" />
            </div>
        `;
    }

    // Called before the component is rendered for the first time
    firstUpdated(): void {
        super.firstUpdated();
        this._inputField = this.shadowRoot?.getElementById(`${this.id}`) as HTMLTextAreaElement;

        try {
            this._inputField.rows = parseInt(this.getAttribute("rows") ?? "5");
        } catch {
            this._inputField.rows = 5;
        }
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .textarea {
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            resize: none;
            width: 100%;
            padding: 3px 5px;
            border: var(--magx-panel-text-border);
            background-color: var(--magx-panel-text-bg);
            color: var(--magx-panel-text-color);
            font: var(--magx-panel-input-font);
            scrollbar-color: var(--magx-panel-scrollbar-color);
            scrollbar-width: thin;
            cursor: auto;
        }

        .textarea:focus {
            outline: none;
            background: var(--magx-panel-text-bg-focused);
            border: var(--magx-panel-text-border-focused);
        }
        
        .textarea::-webkit-scrollbar {
            width: 5px;
        }

        .textarea::-webkit-scrollbar-track {
            border-radius: 1px;
        }

        .textarea::-webkit-scrollbar-thumb {
            background: var(--magx-panel-scrollbar-thumb); 
            border-radius: 1px;
        }

        .textarea::-webkit-scrollbar-thumb:hover {
            background: var(--magx-panel-scrollbar-active);
        }    
    `];

    // Returns the current text
    getValue(): any {
        if (!this._inputField) { return ""; }
        return this._inputField.value;
    }

    // Sets the current text on the text area
    setValue(val: any): void {
        if (!this._inputField) { return; }

        if (typeof val === "string") {
            this._inputField.value = val;
            this._text = val;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-textarea": MagxPanelBaseElement
    }
}