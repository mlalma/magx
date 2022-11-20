import "./src/Sparkline";
import { MagxSparkline, RefLineType, SparklineType, Filltype, Linetype } from "./src/Sparkline";

const dynamicLine = new MagxSparkline();
dynamicLine.classList.add("sparkline");
dynamicLine.setType(SparklineType.Line);
dynamicLine.setLineWidth(1.5);
dynamicLine.setBackgroundColor({ r:155, g:155, b:155, a:.05 });
dynamicLine.setDataPointNum(20);
dynamicLine.setLowerBound(true, -6);
dynamicLine.setUpperBound(true, 6);
dynamicLine.renderCanvas();  

const dynamicBar = new MagxSparkline();
dynamicBar.classList.add("sparkline");
dynamicBar.setType(SparklineType.Bar);
dynamicBar.setLineWidth(1.5);
dynamicBar.setBackgroundColor({ r:155, g:155, b:155, a:.05 });
dynamicBar.setDataPointNum(20);
dynamicBar.setLowerBound(true, -6);
dynamicBar.setUpperBound(true, 6);
dynamicBar.setReferenceLine(RefLineType.Middle);
dynamicBar.setReferenceLineColor({ r: 128, g: 128, b: 128, a: 0.5 }) 
dynamicBar.setLineColor(Linetype.AboveOneColBelowOneCol, { above: { r: 0, g: 135, b: 0, a: .33 }, below: { r: 255, g: 30, b: 30, a: .33 } });
dynamicBar.setFill(Filltype.AboveOneColBelowOneCol, { above: { r: 0, g: 135, b: 0, a: .33 }, below: { r: 255, g: 30, b: 30, a: .33 } });
dynamicBar.renderCanvas();

const grid = document.getElementById("grid") as HTMLElement;
grid.appendChild(dynamicLine);
grid.appendChild(dynamicBar);

function randnBm() {
  let u = 1 - Math.random();
  let v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

setInterval(() => {
  const val = randnBm();  
  dynamicLine.addDatapoint(val * 2); 
  dynamicLine.renderCanvas();  
  dynamicBar.addDatapoint(val * 2);
  dynamicBar.renderCanvas();
}, 200);