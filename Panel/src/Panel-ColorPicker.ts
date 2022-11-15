import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Color picker element for the panel
@customElement(MagxPanelConstants.PANEL_COLORPICKER)
export class MagxPanelColorPicker extends MagxPanelBaseElement {
    @property({type: String}) private _color: string = "#00000";

    private _colorInput: HTMLInputElement | null = null;    
    
    set color(val: string) {
        if (this._color !== val && this._color !== null) {
            let oldVal = this._color;
            this._color = val;            
            this.requestUpdate("color", oldVal);
            this._notifyOnValueChange();
        }        
    }
      
    @property()
    get color(): string { return this._color; }

    // Constructor
    constructor() {
        super();        
        this._color = this.getAttribute("value")?.trim() ?? "#000000";
    }

    // Called when user changes the color *while* the color picker is shown
    private _valueChanged(): void {
        this._color = this._colorInput?.value ?? "Unknown";
        this._notifyOnValueChange();        
    }

    // Renders the component
    render() {
        return html`
            <div tabIndex="0" class="container_base" id="container" @blur=${this._removeFocus} >
                <div class="label"><b>${this.title}:</b> ${this.color}</div>
                <input id="${this.id}" class="color" type="color" .value=${this.color} @input=${this._valueChanged} @click=${this._addFocus}/>
                <label id="color_label" class="color_label" for="${this.id}" style="background-color: ${this.color};"></label>
            </div>
        `;
    }

    // Called before the component is rendered for the first time
    firstUpdated(): void {
        super.firstUpdated();
        this._colorInput = this.shadowRoot?.getElementById(`${this.id}`) as HTMLInputElement;
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .color {
            position: absolute;
            left: 5px; 
            visibility: hidden; 
        }

        .color_label {
            width: 100%;
            height: 20px;
            display: block;
            border: var(--magx-panel-button-border);
            cursor: pointer;
            padding: 0 0 0 5px;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }
    `];

    // Returns current color value
    getValue(): any {
        return this.color;
    }

    // Sets color value, no check that the color is formatted correctly
    setValue(val: any): void {
        if (typeof val === "string") {
            this.color = val;            
        }        
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-colorpicker": MagxPanelColorPicker
    }
}