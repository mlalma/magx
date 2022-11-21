import { MagxPanelValueChangeEvent } from "./src/Panel-BaseElement";
import { MagxPanelConstants } from "./src/Panel-Constants";
import { MagxPanelSparkline } from "./src/Panel-Sparkline";
import { MagxSparkline, SparklineType } from "magx-sparkline";

document.addEventListener(MagxPanelConstants.PANEL_ELEMENT_VALUE_CHANGED, (ev: Event) => {
    const pv: MagxPanelValueChangeEvent = (ev as CustomEvent).detail;
    console.log("Panel", pv.panelId);
    console.log("Panel element", pv.panelElementId);
});

const spark = (document.getElementById("sparkline-panel") as MagxPanelSparkline).getSparkline();
if (spark) {
    spark.setType(SparklineType.Line);
    spark.setLineWidth(1.5);
    spark.setDataPointNum(20);
    spark.setLowerBound(true, -6);
    spark.setUpperBound(true, 6);
    spark.renderCanvas();

    setInterval(() => {
        const val = randnBm();
        spark.addDatapoint(val * 2);
        spark.renderCanvas();
    }, 200);
}

function randnBm() {
    let u = 1 - Math.random();
    let v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
