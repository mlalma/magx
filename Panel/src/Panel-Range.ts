import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Range element, shows slider user can interact with
@customElement(MagxPanelConstants.PANEL_RANGE)
export class MagxPanelRange extends MagxPanelBaseElement {
    private _inputField: HTMLInputElement | null = null;
    private _value: number = 0;

    // Properties are minimum value, maximum value and size of a single increment
    @property({type: Number}) public min: number = 0;
    @property({type: Number}) public max: number = 10;
    @property({type: Number}) public step: number = 1;

    set value(val: number) {
        if (this._value !== val) {
            let oldVal = this._value;
            this._value = Math.max(this.min, Math.min(Math.round(val), this.max));
            this.requestUpdate("value", oldVal);
            this._notifyOnValueChange();
        }        
    }
      
    @property()
    get value(): number { return this._value; }

    // Constructor
    constructor() {
        super();
        try {
            this.min = parseInt(this.getAttribute("min") ?? "0");
        } catch {}
        try {
            this.max = parseInt(this.getAttribute("max") ?? "10");
        } catch {}
        try {
            this.step = parseInt(this.getAttribute("step") ?? "1");
        } catch {}
        try {
            this._value = parseInt(this.getAttribute("value") ?? "0");
            this._value = Math.max(this.min, Math.min(Math.round(this._value), this.max));
        } catch {}
    }

    // Whenever user moves the slider, event is sent
    private _valueChanged(): void {
        if (!this._inputField) { return; }
        const oldVal = this._value;
        this._value = parseInt(this._inputField.value);
        this.requestUpdate("value", oldVal);
        this._notifyOnValueChange();
    }

    // Renders the element
    render() {
        return html`
            <div class="container_base" id="container">
                <div class="label"><b>${this.title}:</b> ${this.value}</div>                                
                <input id="${this.id}" type="range" class="range" .value="${this.value}" @input=${this._valueChanged} @blur=${this._removeFocus} @focus=${this._addFocus} min="${this.min}" max="${this.max}" step="${this.step}" />
            </div>`;
    }

    // Called before the component is rendered for the first time
    firstUpdated(): void {
        super.firstUpdated();
        this._inputField = this.shadowRoot?.getElementById(`${this.id}`) as HTMLInputElement;
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`    
        .range {
            -webkit-appearance: none;
            -moz-appearance: none;
            width: 100%;
            height: var(--magx-panel-range-size-outer);
            padding: 0px;
            margin: 0px;
            background-color: transparent;
            border: none;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }

        .range:focus {
            outline: none;
            border: none;
        }

        .range::-webkit-slider-runnable-track {
            width: 100%;
            height: var(--magx-panel-range-size);
            cursor: pointer;
            background: var(--magx-panel-range-track);
            -webkit-border-radius: 0;
            -moz-border-radius: 0;
            border-radius: 0;
        }
        
        .range:focus::-webkit-slider-runnable-track {
            background: var(--magx-panel-range-track);
        }

        .range::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: var(--magx-panel-range-size);
            width: var(--magx-panel-range-size);
            -webkit-border-radius: 0;
            -moz-border-radius: 0;
            border-radius: 0;
            background: var(--magx-panel-range-thumb);
            cursor: pointer;
            margin-top: 0px;
        }
    
        .range::-moz-range-track {
            width: 100%;
            height: var(--magx-panel-range-size);
            cursor: pointer;
            background: var(--magx-panel-range-track);
            -webkit-border-radius: 0;
            -moz-border-radius: 0;
            border-radius: 0;
        }

        .range::-moz-range-thumb {
            height: var(--magx-panel-range-size);
            width: var(--magx-panel-range-size);
            border: none;
            -webkit-border-radius: 0;
            -moz-border-radius: 0;
            border-radius: 0;
            background: var(--magx-panel-range-thumb);
            cursor: pointer;
        }
        
        .range::-ms-track {
            width: 100%;
            height: var(--magx-panel-range-size);
            cursor: pointer;
            visibility: hidden;
            background: transparent;
        }
        
        .range::-ms-thumb {
            height: var(--magx-panel-range-size);
            width: var(--magx-panel-range-size);
            -webkit-border-radius: 0;
            -moz-border-radius: 0;
            border-radius: 0;
            background: var(--magx-panel-range-thumb);
            cursor: pointer;
            border: none;
        }
        
        .range::-ms-fill-lower {
            background: var(--magx-panel-range-track);
            -webkit-border-radius: 0;
            -moz-border-radius: 0;
            border-radius: 0;
        }

        .range:focus::-ms-fill-lower {
            background: var(--magx-panel-range-track);
        }

        .range::-ms-fill-upper {
            background: var(--magx-panel-range-track);
            -webkit-border-radius: 0;
            -moz-border-radius: 0;
            border-radius: 0;
        }

        .range:focus::-ms-fill-upper {
            background: var(--magx-panel-range-track);
        }

        .number {
            height: var(--magx-panel-common-height);
        }
    `];

    // Returns current slider value
    getValue(): any {
        return this.value;
    }

    // Sets current slider value
    setValue(val: any): void {        
        if (typeof val === "number") {
            this.value = Math.max(this.min, Math.min(Math.round(val), this.max));
        }        
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-range": MagxPanelRange
    }
}