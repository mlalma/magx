import { css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Progress bar element
// Note that you can't set minimum value, only maximum value. The minimum is always 0
@customElement(MagxPanelConstants.PANEL_PROGRESSBAR)
export class MagxPanelProgressBar extends MagxPanelBaseElement {

    @state() private restOfTitle: string = "";
    @state() private _curValuePercentage: number = 0;

    private _maxValue: number = 100;
    private _curValue: number = 0;
    private _type: string = "numbers";

    set currentValue(val: number) {
        const boundedVal = Math.max(0, Math.min(val, this._maxValue));
        this._curValue = boundedVal;
        this._curValuePercentage = this._maxValue == 0 ? 0 : Math.round((this._curValue / this._maxValue) * 100);
        this._setRestOfTitle();
    }

    @property()
    get currentValue(): number {
        return this._curValue;
    }

    set maxValue(val: number) {
        this._maxValue = Math.max(1, val);
        this.currentValue = this._curValue;
    }

    get maxValue(): number {
        return this._maxValue;
    }
    
    // Constructor
    constructor() {
        super();

        try {
            this._maxValue = parseInt(this.getAttribute("max") ?? "100");            
        } catch {
            this._maxValue = 100;
        }

        try {
            this._curValue = parseInt(this.getAttribute("value") ?? "0");
        } catch {
            this._curValue = 0;
        }

        this._maxValue = Math.max(0, this._maxValue);
        this._curValue = Math.max(0, Math.min(this._curValue, this._maxValue));
        this._type = this.getAttribute("type")?.toLowerCase().trim() ?? "numbers";
    }

    // Setting type shows information about the state of the progress after element's title
    private _setRestOfTitle() {
        if (this._type === "numbers") {
            this.restOfTitle = "<b>:</b> " + this._curValue + " / " + this._maxValue;
        } else if (this._type === "percent") {
            this.restOfTitle = "<b>:</b> " + (this._maxValue == 0 ? 0 : Math.round((this._curValue / this._maxValue) * 100)) + "%";
        } else {
            this.restOfTitle = "";
        }
    }
    
    // Renders the element
    render() {
        return html`
            <div class="container_base" id="container">
                <div class="label"><b>${this.title}</b>${unsafeHTML(this.restOfTitle)}</div>
                <div class="progress">
                    <div class="progress_value" style="width: ${this._curValuePercentage}%"></div>
                </div>
            </div>
        `;
    }

    // Called before the component is rendered for the first time
    firstUpdated(): void {
        super.firstUpdated();
        this.currentValue = this._curValue;
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .progress {
            width: 100%;
            height: var(--magx-panel-progress-height);
            background-color: var(--magx-panel-progress-bg);
            border: 1px solid #666666;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }

        .progress_value {
            height: 100%;
            background-color: var(--magx-panel-progress-value);
        }
    `];
    
    // Returns the current value
    getValue(): any {
        return this._curValue;
    }

    // Sets the new progress value and triggers re-rendering of the progress bar
    // Note that updating value doesn't lead to sending an event because the update is triggered
    setValue(val: any): void {
        if (typeof val === "number") {
            this.currentValue = val;
        }        
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-progressbar": MagxPanelProgressBar
    }
}