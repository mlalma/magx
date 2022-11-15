import "magx-panel/dist/Panel.css";
import "magx-panel";
import { MagxPanel, MagxPanelCheckbox, MagxPanelColorPicker, MagxPanelConstants, MagxPanelValueChangeEvent } from "magx-panel";

document.addEventListener(MagxPanelConstants.PANEL_ELEMENT_VALUE_CHANGED, (ev: Event) => {
    const pv: MagxPanelValueChangeEvent = (ev as CustomEvent).detail;
    
    if (pv.panelElementId === "Checkbox1") {
        const panel = document.getElementById("Panel") as MagxPanel;
        panel.setOutOfBoundsCheck((document.getElementById("Checkbox1") as MagxPanelCheckbox).getValue());
    } else if (pv.panelElementId === "Button1") {
        let r = document.querySelector(":root") as HTMLElement;
        r.style.setProperty("--magx-panel-background", (document.getElementById("ColorPicker1") as MagxPanelColorPicker).getValue());
    }
});
