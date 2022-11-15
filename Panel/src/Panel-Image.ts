import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';

// Shows an image on the panel
@customElement(MagxPanelConstants.PANEL_IMAGE)
export class MagxPanelImage extends MagxPanelBaseElement {
    @property({type: String}) public imageURL: string = "";

    // Constructor
    constructor() {
        super();
        this.imageURL = this.getAttribute("src") ?? "";
    }

    // Renders the element
    render() {
        return html`
            <div class="container_base" id="container">
                <div class="label"><b>${this.title}</b></div>
                <img id=${this.id} class="image" .src=${this.imageURL} />
            </div>
        `;
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .image {
            width: 100%;
        }
    `];

    // Returns current image URL
    getValue(): any {
        return this.imageURL;
    }

    // Sets the new image URL to be shown
    setValue(val: any): void {
        if (typeof val === "string") {
            this.imageURL = val;
        } 
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-panel-image": MagxPanelImage
    }
}