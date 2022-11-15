import { LitElement, css } from 'lit';
import { property } from 'lit/decorators.js';
import { MagxPanel } from "./Panel";
import { MagxPanelConstants } from './Panel-Constants';

// Interface used for notifying when a value has changed on any of the elements in any panel
export interface MagxPanelValueChangeEvent {
    panelId: string,
    panelElementId: string
}

// Base class for all the panel elements. Eases the development of new panel elements
// Note that you need to call super.firstUpdated() if you overload firstUpdated(), you need
// to bring in to your somponent stylesheet _baseStyle and you need to implement
// getValue() and setValue() methods, which are abstract.
export abstract class MagxPanelBaseElement extends LitElement {

    protected _container : HTMLDivElement | null = null;
    protected doNotRemoveSelected: boolean = false;

    // Title shown on the top of the element
    @property({type: String}) public title: string = "";

    // Used to identify the element, will be set automatically if not given as an attribute
    @property({type: String}) public id: string = "";

    // Constructor
    constructor() {
        super();
        this.title = this.getAttribute("title")?.trim() ?? "";
        this.id = this.getAttribute("id")?.trim() ?? "panel_component_" + Math.round(Math.random() * (1 << 24)).toString(16);
    }

    // Helper to quickly build an element
    protected _createElement(type: string, id: string | null = null, className: string | null = null, parent: HTMLElement | null = null): HTMLElement | null {
        const element = document.createElement(type);
        if (!element) return null;
        
        if (id) { element.id = id; }
        if (className) { element.className = className; }
  
        if (parent) {
            parent.appendChild(element);
        }
  
        return element;
    }
    
    // Helper to remove a visual cue that focus has moved from the element
    protected _removeFocus(): void {
        if (!this.doNotRemoveSelected) {
            this._container?.classList.remove("container_base_selected");
            this._sendEvent(MagxPanelConstants.PANEL_ELEMENT_FOCUS_REMOVED);
        }
    }

    // Helper to show a visual cure that element has gained focus
    protected _addFocus(): void {        
        this._container?.classList.add("container_base_selected");
        this._sendEvent(MagxPanelConstants.PANEL_ELEMENT_FOCUS_GAINED);
    }
    
    // Dispatches event
    protected _sendEvent(eventName: string): void {
        let panelId = "";

        if (this.parentElement && this.parentElement instanceof MagxPanel) {
            panelId = (this.parentElement as MagxPanel).id;
        }
        
        const event = new CustomEvent(eventName, { detail: { panelElementId: this.id, panelId: panelId } });  
        document.dispatchEvent(event);
    }

    // Used to notify on value change
    protected _notifyOnValueChange(): void {
        this._sendEvent(MagxPanelConstants.PANEL_ELEMENT_VALUE_CHANGED);
    }

    // Finds container from the Shadow DOM
    firstUpdated(): void {
        this._container = this.shadowRoot?.getElementById("container") as HTMLDivElement;
    }

    // Returns value of the element (completely dependend on the implementation and element itself, can also return null)
    abstract getValue(): any;

    // Sets the value of the element, also dependend on the element and if it makes sense to set the value in the first place
    abstract setValue(val: any): void;

    // Base styles that need to be brought in to panel elements
    protected static _baseStyle = css`
        .container_base {                        
            margin: var(--magx-panel-container-margin);
            padding: var(--magx-panel-container-padding);
            background-color: var(--magx-panel-container-bg);
            border: var(--magx-panel-common-border);
            position: relative;
            overflow: hidden;
        }

        .container_base_selected {            
            border: var(--magx-panel-selected-container-border);
	        background-color: var(--magx-panel-selected-container-background);
        }

        .label {            
            margin-bottom: var(--magx-panel-label-margin);
	        user-select: none;
	        -webkit-user-select: none;
	        cursor: default;
	        font: var(--magx-panel-font);
        }

        .text_input {            
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            width: 100%;
            padding: 0 0 0 5px;
            height: var(--magx-panel-common-height);
            border: var(--magx-panel-text-border);
            background-color: var(--magx-panel-text-bg);
            color: var(--magx-panel-text-color);
            font: var(--magx-panel-input-font);
        }

        .text_input:focus {
            outline: none;
	        background: var(--magx-panel-text-bg-focused);
	        border: var(--magx-panel-text-border-focused);
        }
    `;
}