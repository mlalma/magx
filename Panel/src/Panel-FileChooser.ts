import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// File chooser dialog
@customElement(MagxPanelConstants.PANEL_FILECHOOSER)
export class MagxPanelFileChooser extends MagxPanelBaseElement {    
    @property ({type: String}) public placeholderLabel = "";
    
    private _fileChooser : HTMLInputElement | null = null;
    private _fcLabel: HTMLLabelElement | null = null;

    private readonly _DEFAULT_LABEL: string = "Choose a file..";

    // Constructor
    constructor() {
        super();
        this.placeholderLabel = this.getAttribute("placeholder") || this._DEFAULT_LABEL;
    }

    // Clears the selection and shows the placeholder text instead on UI
    public clearFileSelection(): void {
        if (!this._fileChooser || !this._fcLabel) { return; }
        this._fileChooser.value = "";
        this._fcLabel.textContent = this.placeholderLabel;
    }

    // Called when user selects a file
    private _valueChanged(): void {
        if (!this._fcLabel || !this._fileChooser?.files || !this._fileChooser?.files.length) { return };
        this._fcLabel.textContent = this._fileChooser.files[0].name;
        this._notifyOnValueChange();
    }

    // Renders the component
    render() {
        return html`
            <div class="container_base" id="container">
                <div class="label"><b>${this.title}</b></div>
                <input id=${this.id} type="file" class="file_chooser" @change=${this._valueChanged} @blur=${this._removeFocus} @focus=${this._addFocus} />
                <label id="file_chooser_label" class="file_chooser_label" for=${this.id}>${this.placeholderLabel}</label>
            </div>
        `;
    }

    // Called before the component is rendered for the first time
    // Sets the filter (extension) for the files that are allowed to be uploaded
    firstUpdated(): void {        
        super.firstUpdated();
        this._fileChooser = this.shadowRoot?.getElementById(`${this.id}`) as HTMLInputElement;
        this._fcLabel = this.shadowRoot?.getElementById("file_chooser_label") as HTMLLabelElement;

        const filter = this.getAttribute("filter");
        if (filter) {
            this._fileChooser.accept = filter;
        }
    }    

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .file_chooser {            
            position: absolute;
            left: -999999px;            
        }

        .file_chooser_label {                        
            background-color: var(--magx-panel-button-bg);
            color: var(--magx-panel-text-color);
            height: var(--magx-panel-button-height);
            border: var(--magx-panel-button-border);
            font: var(--magx-panel-font);
            width: 100%;
            display: block;
            cursor: pointer;
            padding: var(--magx-panel-file-padding);
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `];

    // Returns selected File object
    getValue(): any {
        if (this._fileChooser?.files) {
            return this._fileChooser.files[0];
        } else {
            return "";
        } 
    }

    // Set doesn't make any sense for file chooser
    setValue(_val: any): void {}
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-filechooser": MagxPanelFileChooser
    }
}