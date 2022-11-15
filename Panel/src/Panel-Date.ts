import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Date picker element
@customElement(MagxPanelConstants.PANEL_DATE)
export class MagxPanelDate extends MagxPanelBaseElement {
    private _dateInput: HTMLInputElement | null = null;
    private _dateValue: string = this._createDateString(new Date()); 
    private _minDate: string | null = null;
    private _maxDate: string | null = null;

    set dateValue(val: string | Date) {
        const valStr = this._createDateString(val);
        if (this._dateValue !== valStr && this._dateValue !== null) {
            let oldVal = this._dateValue;
            this._dateValue = valStr;
            this.requestUpdate('dateValue', oldVal);
            this._notifyOnValueChange();
        }        
    }
      
    @property()
    get dateValue() { return this._dateValue; }

    // Constructor
    // Note: Format is "yyyy-mm-dd" and there is no check if the given format is correct or not
    constructor() {
        super();
        this._dateValue = this.getAttribute("date")?.trim() ?? this._createDateString(new Date());
        this._minDate = this.getAttribute("min_date")?.trim() ?? null;
        this._maxDate = this.getAttribute("max_date")?.trim() ?? null;
    }   

    // Formats string from Date object or just returns a string
    private _createDateString(date: string | Date): string {
        if (date instanceof Date) {
          const year = date.getFullYear();
          const monthNum = date.getMonth() + 1;
          const month = monthNum < 0 ? "0" + monthNum : monthNum;
          const dayNum = date.getDate();
          const day = dayNum < 0 ? "0" + dayNum : dayNum;          
          return year + "-" + month + "-" + day;
        } else {
            return date;
        }
    }

    // Sends value changed notification
    private _valueChanged(): void {
        this._dateValue = this._dateInput?.value ?? this._createDateString(new Date());
        this._notifyOnValueChange();           
    }

    // Sets minimum date user can choose
    public setMinDate(date: string | Date): void {
        this._minDate = this._createDateString(date);
    }

    // Sets maximum date user can choose
    public setMaxDate(date: string | Date): void {
        this._maxDate = this._createDateString(date);
    }
    
    // Renders the component
    render() {
        return html`
        <div class="container_base" id="container">
            <div class="label"><b>${this.title}</b></div>
            <input id=${this.id} class="text_input" type="date" .value=${this.dateValue} @input=${this._valueChanged} .min=${this._minDate} .max=${this._maxDate} @blur=${this._removeFocus} @focus=${this._addFocus}/>
        </div>
        `;
    }

    // Called before the component is rendered for the first time
    firstUpdated(): void {        
        super.firstUpdated();
        this._dateInput = this.shadowRoot?.getElementById(`${this.id}`) as HTMLInputElement;
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        input::-webkit-calendar-picker-indicator {
            cursor: pointer;
        }
    `];

    // Returns currently selected date
    getValue(): any {
        return this.dateValue;
    }

    // Sets new date, doesn't check or verify the format of the given input variable (Date object preferred)
    setValue(val: any): void {
        this.dateValue = this._createDateString(val);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-date": MagxPanelDate
    }
}