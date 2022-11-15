import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Element for choosing time. There is a separate element for choosing a date
@customElement(MagxPanelConstants.PANEL_TIME)
export class MagxPanelTime extends MagxPanelBaseElement {
    private _timeInput: HTMLInputElement | null = null;
    private _timeValue: string = "";

    set timeValue(val: string | Date) {
        const valStr = this._createTimeString(val);
        if (this._timeValue !== valStr && this._timeValue !== null) {
            let oldVal = this._timeValue;
            this._timeValue = valStr;
            this.requestUpdate("timeValue", oldVal);
            this._notifyOnValueChange();
        }        
    }
      
    @property()
    get timeValue() { return this._timeValue; }

    // Constructor. Note that the correct time format is "hh:mm:ss" or just "hh:mm"
    constructor() {
        super();
        this._timeValue = this.getAttribute("time")?.trim() ?? this._createTimeString(new Date());
    }   

    // Parses time string from Date or if the argument is string just leaves it as it is
    private _createTimeString = (time: string | Date) => {
        let timeStr: string;
        if (time instanceof Date) {
          const hours = time.getHours();
          const hoursStr = (hours < 10) ? "0" + hours.toString() : hours.toString();
          const minutes = time.getMinutes();
          const minutesStr = (minutes < 10) ? "0" + minutes.toString() : minutes.toString();
          const seconds = time.getSeconds();
          const secondsStr = (seconds < 10) ? "0" + seconds.toString() : seconds.toString();
          timeStr = hoursStr + ":" + minutesStr + ":" + secondsStr;
        } else {
            timeStr = time;
        }
        return timeStr;
    }

    // Called when time value is changed
    private _valueChanged(): void {
        this._timeValue = this._timeInput?.value ?? this._createTimeString(new Date());
        this._notifyOnValueChange();           
    }
        
    // Renders the element
    render() {
        return html`
        <div class="container_base" id="container">
            <div class="label"><b>${this.title}</b></div>
            <input id=${this.id} class="text_input" type="time" .value=${this.timeValue} @input=${this._valueChanged} @blur=${this._removeFocus} @focus=${this._addFocus}/>
        </div>
        `;
    }

    // Called before the component is rendered for the first time
    firstUpdated(): void {
        super.firstUpdated();
        this._timeInput = this.shadowRoot?.getElementById(`${this.id}`) as HTMLInputElement;
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        input::-webkit-calendar-picker-indicator {
            cursor: pointer;
        }     
    `];

    // Returns the currently chosen time
    getValue(): any {
        return this.timeValue;
    }

    // Sets new time. Date object preferred
    setValue(val: any): void {
        this.timeValue = this._createTimeString(val);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-time": MagxPanelTime
    }
}