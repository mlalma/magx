import { MagxPanelValueChangeEvent } from "./src/Panel-BaseElement";
import { MagxPanelConstants } from "./src/Panel-Constants";

document.addEventListener(MagxPanelConstants.PANEL_ELEMENT_VALUE_CHANGED, (ev: Event) => {
    const pv: MagxPanelValueChangeEvent = (ev as CustomEvent).detail;
    console.log("Panel", pv.panelId);    
    console.log("Panel element", pv.panelElementId);    
});

