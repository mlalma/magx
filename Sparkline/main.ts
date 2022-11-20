import "./src/Sparkline";
import { MagxSparkline, RefLineType, SparklineType, Filltype, Linetype } from "./src/Sparkline";

const sl = document.getElementById("sparkline") as MagxSparkline;

sl.setType(SparklineType.Line);
sl.setLineWidth(1.5);
//sl.setLineColor(Linetype.Solid, { r:75, g:75, b:75, a:0.75 });
sl.setLineColor(Linetype.AboveOneColBelowOneCol, { above: { r: 0, b: 0, g: 255, a: .5 }, below: { r: 255, b: 0, g: 0, a: .5 } });
//sl.setFill(Filltype.Solid, { r:150, g:150, b:150, a:0.5 });
sl.setFill(Filltype.AboveOneColBelowOneCol, { above: {r:0, b:0, g:255, a:1}, below: {r:255, b:0, g:0, a: 1} });
sl.setFill(Filltype.Gradient, { above: { r: 0, b: 0, g: 255, a: 0.5 }, below: { r: 255, b: 0, g: 0, a: 0.5 } });
sl.setReferenceLine(RefLineType.Middle);
sl.setReferenceLineColor({r:75, g:75, b:75, a: 0.0});
sl.setEndpoint(3.50, { r: 0.0, g:0.0, b:255.0, a:1.0 });
sl.renderCanvas();
//sl.setDataPointNum(50);
sl.setLowerBound(true, -5);
sl.setUpperBound(true, 5);
//sl.setCap(true, true);

function randn_bm() {
  let u = 1 - Math.random();
  let v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

/*
setInterval(() => {
  const c = document.getElementById("sparkline") as MagxSparkline;  
  const val = randn_bm();  
  c.addDatapoint(val * 5);   
  c.renderCanvas();  
}, 500);*/