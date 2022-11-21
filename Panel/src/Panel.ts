import { LitElement, css, html, PropertyValueMap } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { MagxPanelBaseElement } from "./Panel-BaseElement";
import { MagxPanelConstants } from "./Panel-Constants";

// Panel gathers all elements into a single whole that can be move around / collapsed
@customElement(MagxPanelConstants.PANEL)
export class MagxPanel extends LitElement {
    // This counter is used by all panels to lift them up top when they get selected
    // If the page has other components with various z-index values, might be a good idea
    // to tune this value to ensure that the panels are on top    
    static _topZ: number = 1;

    @property({ type: String }) public id = "";
    @property({ type: String }) public title: string = "";

    private _startX: number = 0;
    private _startY: number = 0;
    private _maxX: number = 0;
    private _maxY: number = 0;
    private _outOfBoundsCheck: boolean = true;

    private _draggable: boolean = true;
    private _collapsed: boolean = false;
    private _collapsible: boolean = true;
    private _hidden: boolean = false;
    private _resizeObserver: ResizeObserver | null = null;

    private _panel: HTMLDivElement | null = null;
    private _overlay: HTMLDivElement | null = null;
    private _titleBar: HTMLDivElement | null = null;
    private _contentArea: HTMLDivElement | null = null;

    // Constructor
    constructor() {
        super();

        try { this._startX = parseInt(this.getAttribute("x") ?? "0"); } catch { this._startX = 0; }
        try { this._startY = parseInt(this.getAttribute("y") ?? "0"); } catch { this._startY = 0; }
        this.title = this.getAttribute("title") ?? "";
        this.id = this.getAttribute("id")?.trim() ?? "panel_" + Math.round(Math.random() * (1 << 24)).toString(16);
        if (this.getAttribute("outofbounds")) {
            this._outOfBoundsCheck = this.getAttribute("outofbounds") === "true";
        }
        this._bindHandlers();
    }

    // Sets if the panel can be dragged around or not
    public setDraggable(draggable: boolean): MagxPanel {
        this.draggable = draggable;
        if (!this._titleBar) { return this; }

        if (this.draggable || this._collapsible) {
            this._titleBar.style.cursor = "pointer";
        }
        else {
            this._titleBar.style.cursor = "default";
        }
        return this;
    }

    // Sets out-of-bounds check or inactive
    public setOutOfBoundsCheck(check: boolean): void {
        this._outOfBoundsCheck = check;
    }

    // Sets new position in parent element's coordinate space
    // To prevent problems ensure that parent element's "position" style is something else than "static"
    public setPosition(x: number, y: number): void {
        if (!this._panel) { return; }

        let minX = -Number.MAX_VALUE, minY = -Number.MAX_VALUE;
        let maxX = Number.MAX_VALUE, maxY = Number.MAX_VALUE;
        if (this._outOfBoundsCheck) {
            console.log("oobSHCEK");
            minX = 0, minY = 0;
            maxX = this._maxX, maxY = this._maxY;
        }

        this._panel.style.left = Math.round(Math.max(minX, Math.min(Math.max(x, minX), maxX - this._panel.offsetWidth))) + "px";
        this._panel.style.top = Math.round(Math.max(minY, Math.min(Math.max(y, minY), maxY - this._panel.offsetHeight))) + "px";
    }

    // Changes the width of the panel. Height is automatically set based on the elements
    public setWidth(w: number): void {
        if (!this._panel || !this._contentArea) { return; }

        this._panel.style.width = w.toString() + "px";
        this._contentArea.style.width = w.toString + "px";
    }

    // Collapses / expands panel
    public toggleCollapsed(): void {
        if (this._collapsed) {
            this._expand();
        }
        else {
            this._collapse();
        }
    }

    // Sets panel visibility
    public toggleVisibility(): void {
        if (this._hidden) {
            this._show();
        }
        else {
            this._hide();
        }
    }

    // De-serializes all the elements values to a single json
    public getValuesAsJSON(asString: boolean): string | { [title: string]: any } {
        let json: { [title: string]: any } | string = {};

        const slotNode = this.shadowRoot?.getElementById("panel_elements") as HTMLSlotElement;
        const panelElements = slotNode.assignedElements();

        for (const p of panelElements) {
            if (p instanceof MagxPanelBaseElement) {
                const val = p.getValue();
                if (val !== null) {
                    json[p.id] = val;
                }
            }
        }

        if (asString) {
            json = JSON.stringify(json);
        }

        return json;
    }

    // Sets element values from json
    public setValuesFromJSON(json: string | { [title: string]: any }): void {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }

        const slotNode = this.shadowRoot?.getElementById("panel_elements") as HTMLSlotElement;
        const panelElements = slotNode.assignedElements();
        const objects: Map<String, MagxPanelBaseElement> = new Map<String, MagxPanelBaseElement>();

        for (const p of panelElements) {
            if (p instanceof MagxPanelBaseElement) {
                objects.set(p.id, p);
            }
        }

        const jsonDict = json as { [title: string]: any };
        for (var title in jsonDict) {
            objects.get(title)?.setValue(jsonDict[title]);
        }
    }

    // Binds the handlers to this instance
    private _bindHandlers() {
        this._startDrag = this._startDrag.bind(this);
        this._drag = this._drag.bind(this);
        this._endDrag = this._endDrag.bind(this);
        this._doubleClickTitle = this._doubleClickTitle.bind(this);
    }

    // Helper method to create an element
    private _createElement(type: string, id: string | null = null, className: string | null = null, parent: HTMLElement | null = null): HTMLElement | null {
        const element = document.createElement(type);
        if (!element) return null;

        if (id) { element.id = id; }
        if (className) { element.className = className; }

        if (parent) {
            parent.appendChild(element);
        }

        return element;
    }

    // Collapses all the elements in the panel, only title is visible
    private _collapse() {
        if (!this._contentArea) { return; }
        this._panel?.removeChild(this._contentArea);
        this._collapsed = true;
        return this;
    }

    // Expands the panel to show all elements
    private _expand() {
        if (!this._contentArea) { return; }
        this._panel?.appendChild(this._contentArea);
        this._collapsed = false;
        return this;
    }

    // Hides the panel
    private _hide() {
        if (!this._panel) { return; }
        this._panel.style.visibility = "hidden";
        this._hidden = true;
        return this;
    }

    // Shows the panel
    private _show() {
        if (!this._panel) { return; }
        this._panel.style.visibility = "visible";
        MagxPanel._topZ++;
        this._panel.style.zIndex = MagxPanel._topZ.toString();
        this._hidden = false;
        return this;
    }

    // Double click handler on title bar
    private _doubleClickTitle() {
        if (this._collapsible) {
            this.toggleCollapsed();
        }
    }

    // Starts dragging
    private _startDrag(event: any) {
        if (!this._panel) { return; }

        if (this._draggable && this._titleBar) {
            ++MagxPanel._topZ;
            this._panel.style.zIndex = MagxPanel._topZ.toString();
            document.addEventListener("mousemove", this._drag);
            document.addEventListener("mouseup", this._endDrag);
            this._startX = event.clientX;
            this._startY = event.clientY;
            this._overlay = this._createElement("div", "overlay", "overlay", this._panel) as HTMLDivElement;
            document.body.style.cursor = "none";
        }
        event.preventDefault();
    }

    // Called during drag events (mouse move) to move the panel around
    private _drag(event: any): void {
        if (!this._panel) { return; }

        let x = parseInt(this._panel.style.left),
            y = parseInt(this._panel.style.top),
            mouseX = event.clientX,
            mouseY = event.clientY;

        const newXPos = x + mouseX - this._startX;
        const newYPos = y + mouseY - this._startY;

        this.setPosition(newXPos, newYPos);
        this._startX = mouseX;
        this._startY = mouseY;

        event.preventDefault();
    }

    // Called when dragging ends
    private _endDrag(event: any): void {
        document.removeEventListener("mousemove", this._drag);
        document.removeEventListener("mouseup", this._endDrag);
        event.preventDefault();

        if (!this._panel || !this._overlay) { return; }
        this._panel.removeChild(this._overlay);
        this._overlay = null;
        document.body.style.cursor = "auto";
    }

    // Renders the element
    protected render() {
        return html`
        <div id="panel" class="main_panel" @click=${this._panelClicked}>
            <div class="title_bar" id="title_bar" draggable="true" @dblclick=${this._doubleClickTitle} @dragstart=${this._startDrag}>${this.title}</div>
            <div class="content_area" id="content_area">
                <slot id="panel_elements"></slot>
            </div>
        </div>
        `;
    }

    // Prevents clicks progagating under the panel
    private _panelClicked(): void { }

    // Called when panel is added to DOM tree
    // Starts tracking the size changes of parent to change the allowed movement area if out-of-bounds check is set
    public connectedCallback(): void {
        super.connectedCallback()

        if (!this.parentElement) { return; }
        this._maxX = this.parentElement.clientWidth;
        this._maxY = this.parentElement.clientHeight;

        this._resizeObserver = new ResizeObserver(entries => {
            if (!this.parentElement) { return; }
            for (let _entry of entries) {
                this._maxX = this.parentElement.clientWidth;
                this._maxY = this.parentElement.clientHeight;
            }
        });
        this._resizeObserver.observe(this.parentElement);
        this.setPosition(0, 0);
    }

    // Called when panel is removed from DOM tree
    public disconnectedCallback(): void {
        super.disconnectedCallback();

        this._resizeObserver?.disconnect();
        this._resizeObserver = null;
    }

    // Called before the component is rendered for the first time
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this._panel = this.shadowRoot?.getElementById("panel") as HTMLDivElement;
        ++MagxPanel._topZ;
        this._panel.style.zIndex = MagxPanel._topZ.toString();

        this._titleBar = this.shadowRoot?.getElementById("title_bar") as HTMLDivElement;
        this._contentArea = this.shadowRoot?.getElementById("content_area") as HTMLDivElement;
        this.setPosition(this._startX, this._startY);
    }

    // Stylesheet
    static styles = css`        
        .main_panel {
            background-color: var(--magx-panel-main-bg);
            text-align:left;
            position: absolute;
            width: var(--magx-panel-panel-width);
            font: var(--magx-panel-font);
            box-shadow: var(--magx-panel-panel-shadow);
            user-select: none;
            -webkit-user-select: none;
            color: var(--magx-panel-text-color);
            border: var(--magx-panel-common-border);
        }

        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--magx-panel-overlay-bg);
        }

        .content_area {
            background-color: var(--magx-panel-background);
	        overflow-y: auto;
        }

        .title_bar {
            background-color: var(--magx-panel-title-bg);
            user-select: none;
            -webkit-user-select: none;
            cursor: pointer;
            padding: 5px;
            font-weight: bold;
            border: none;
            color: var(--magx-panel-text-color);
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'magx-panel': MagxPanel
    }
}