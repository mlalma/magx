import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { MagxPanelBaseElement } from './Panel-BaseElement';
import { MagxPanelConstants } from './Panel-Constants';
import "magx-sparkline";
import { MagxSparkline } from 'magx-sparkline';

// Shows an image on the panel
@customElement(MagxPanelConstants.PANEL_SPARKLINE)
export class MagxPanelSparkline extends MagxPanelBaseElement {
    @property({ type: String }) public imageURL: string = "";

    // Constructor
    constructor() {
        super();
        this.imageURL = this.getAttribute("src") ?? "";
    }

    // Returns the sparkline
    public getSparkline(): MagxSparkline | null {
        return this.shadowRoot?.getElementById("sparkline") as MagxSparkline;
    }

    // Renders the element
    render() {
        return html`
            <div class="container_base" id="container">
                <div class="label"><b>${this.title}</b></div>
                <magx-sparkline class="sparkline" id="sparkline"></magx-sparkline>
            </div>
        `;
    }

    firstUpdated(): void {
        super.firstUpdated();

        const sparkline = this.getSparkline();
        const container = this.shadowRoot?.getElementById("container");
        if (!sparkline || !container) { return; }

        const sparkStyle = window.getComputedStyle(sparkline);
        const sparkWidthStr = sparkStyle.getPropertyValue("width");
        const sparkWidth = parseFloat(sparkWidthStr.substring(0, sparkWidthStr.length - 2));
        sparkline.style.height = (sparkWidth * 0.33).toString() + "px";
        let bckgCol = window.getComputedStyle(container).getPropertyValue("--magx-panel-container-bg").trim();
        if (bckgCol.startsWith("#")) {
            bckgCol = bckgCol.substring(1);
            const r = parseInt(bckgCol.substring(0, 2), 16);
            const g = parseInt(bckgCol.substring(2, 4), 16);
            const b = parseInt(bckgCol.substring(4, 6), 16);
            sparkline.setBackgroundColor({ r: r, g: g, b: b, a: 1.0 });
            sparkline.renderCanvas();
        } else if (bckgCol.startsWith("rgb")) {
            let rgbVals = bckgCol.match(/[.?\d]+/g) ?? [];
            if (Array.isArray(rgbVals) && rgbVals.length >= 3) {
                const r = parseFloat(rgbVals[0]);
                const g = parseFloat(rgbVals[1]);
                const b = parseFloat(rgbVals[2]);
                sparkline.setBackgroundColor({ r: r, g: g, b: b, a: 1.0 });
                sparkline.renderCanvas();
            }
        }
    }

    // Stylesheet
    static styles = [MagxPanelBaseElement._baseStyle, css`
        .image {
            width: 100%;
        }

        .sparkline {     
            display: inline-block; 
            width: 100%;
            height: inherit;
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
        "magx-panel-sparkline": MagxPanelSparkline
    }
}