import { css, html, LitElement, PropertyValueMap } from 'lit';
import { customElement } from 'lit/decorators.js';

// Reference line type. Also re-positions the y-axis of data
export enum RefLineType {
    None = "none",
    Middle = "middle",
    Average = "average",
    Median = "median",
    Custom = "custom",
    TieToFirstDataPoint = "firstdatapoint"
}

// Type of sparkline, can be a line char or bar chart
export enum SparklineType {
    Line = "line",
    Bar = "bar"
}

// Line type for drawing the line / line around bars differently
export enum Linetype {
    Solid = "solid",
    AboveOneColBelowOneCol = "abovebelow",
    AboveBelowBasedOnFirstLastDiff = "firstlastdiff"
}

// Fill type is either solid col,
// one solid col above ref line and 2nd below the line or
// gradient from top to transparent on reference line and then 2nd col for the bottom
export enum Filltype {
    Solid = "solid",
    AboveOneColBelowOneCol = "abovebelow",
    Gradient = "gradient"
}

// Datatype for color
export interface SparklineCol {
    r: number;
    g: number;
    b: number;
    a: number;
}

// Datatype for passing above and below colors
export interface AboveBelowCols {
    above: SparklineCol;
    below: SparklineCol;
}

// Sparkline component
@customElement("magx-sparkline")
export class MagxSparkline extends LitElement {    
    private _canvas : HTMLCanvasElement | null = null;
    private _ctx: CanvasRenderingContext2D | null = null;    
    private _resizeObserver: ResizeObserver | null = null;

    private _data: Array<number> = new Array<number>();        
    private _dataCount: number = 0;
    private _dataIndex: number = 0;

    private _type: SparklineType = SparklineType.Line;

    private _lineWidth: number = 1.0;
    private _lineType: Linetype = Linetype.Solid;
    private _lineColor: string = "rgba(0.0, 0.0, 0.0, 1.0)";
    private _aboveBelowLineCols: { above: string; below: string } =
        {
            above: "rgba(0.0, 0.0, 0.0, 1.0)",
            below: "rgba(0.0, 0.0, 0.0, 1.0)"
        }

    private _fillType: Filltype = Filltype.Solid;
    private _fillColor: string = "rgba(0.0, 0.0, 0.0, 0.0)";
    private _aboveBelowCols: { above: string; below: string } = 
        { 
            above: "rgba(0.0, 0.0, 0.0, 0.0)",
            below: "rgba(0.0, 0.0, 0.0, 0.0)" 
        }
    private _aboveBelowVals: AboveBelowCols = 
        { 
            above: {r: 0, g: 0, b: 0, a: 0},
            below: {r: 0, g: 0, b: 0, a: 0}
        }

    private _endpointColor: string = "rgba(255.0, 0.0, 0.0, 0.75)";
    private _endpointRadius: number = 4;

    private _backgroundColor: string = "rgba(255.0, 255.0, 255.0, 1.0)";

    private _referenceLineType: RefLineType = RefLineType.None;
    private _referenceLineYPos: number = 0.0;
    private _referenceLineColor: string = "rgba(255.0, 0.0, 0.0, 0.0)";
    private _referenceLineWidth: number = 1.0;

    private _useLowerBound: boolean = false;
    private _lowerBound: number = 0;

    private _useUpperBound: boolean = false;
    private _upperBound: number = 0;

    private _capAbove: boolean = false;
    private _capBelow: boolean = false;

    private _minVal: number = Number.MAX_VALUE;
    private _maxVal: number = Number.MIN_VALUE;
    private _sumVal: number = 0;
    
    private _renderingCanvasHeight: number = 0;
    private _renderingCanvasWidth: number = 0;
    private _xstep: number = 0;
    private _ystep: number = 0;
    
    // Constructor
    constructor() {        
        super();
        this._type = (this.getAttribute("type") ?? "line").toLowerCase().trim() as SparklineType ?? SparklineType.Line;
        this._useLowerBound = this.getAttribute("lowerBound") ? true : false;
        this._lowerBound = parseInt(this.getAttribute("lowerBound") ?? "0");
        this._useUpperBound = this.getAttribute("upperBound") ? true : false;
        this._upperBound = parseInt(this.getAttribute("upperBound") ?? "0");
        this._capAbove = (this.getAttribute("capAbove") ?? "false").toLowerCase().trim() === "true";
        this._capBelow = (this.getAttribute("capBelow") ?? "false").toLowerCase().trim() === "true";

        this._referenceLineYPos = parseFloat(this.getAttribute("refLineYPos") ?? "0.0");
        this._referenceLineColor = this.getAttribute("refLineCol")?.toLowerCase().trim() ?? "rgba(255.0, 0.0, 0.0, 0.0)";
        this._referenceLineWidth = parseFloat(this.getAttribute("refLineWidth") ?? "1.0");
        this._referenceLineType = (this.getAttribute("refLineType") ?? "none").toLowerCase().trim() as RefLineType ?? RefLineType.None;

        this._backgroundColor = this.getAttribute("bckgCol")?.toLowerCase().trim() ?? "rgba(255.0, 255.0, 255.0, 1.0)";

        this._endpointColor = this.getAttribute("endpointCol")?.toLowerCase().trim() ?? "rgba(255.0, 0.0, 0.0, 0.75)";
        this._endpointRadius = parseFloat(this.getAttribute("endpointRadius") ?? "3");

        this._lineWidth = parseFloat(this.getAttribute("lineWidth") ?? "1.0");
        this._lineType = (this.getAttribute("lineType") ?? "solid").toLowerCase().trim() as Linetype ?? Linetype.Solid;
        this._lineColor = this.getAttribute("lineCol")?.toLowerCase().trim() ?? "rgba(0.0, 0.0, 0.0, 1.0)";
        this._aboveBelowLineCols.above = this.getAttribute("lineAboveCol")?.toLowerCase().trim() ?? "rgba(0.0, 0.0, 0.0, 1.0)";
        this._aboveBelowLineCols.below = this.getAttribute("lineBelowCol")?.toLowerCase().trim() ?? "rgba(0.0, 0.0, 0.0, 1.0)";

        this._fillType = (this.getAttribute("filltype") ?? "solid").toLowerCase().trim() as Filltype ?? Filltype.Solid;
        this._fillColor = this.getAttribute("fillCol")?.toLowerCase().trim() ?? "rgba(0.0, 0.0, 0.0, 0.0)";        
        this._aboveBelowCols.above = this.getAttribute("fillAboveCol")?.toLowerCase().trim() ?? "rgba(0.0, 0.0, 0.0, 0.0)";
        let rgbVals = this._aboveBelowCols.above.match(/[.?\d]+/g) ?? [];
        if (Array.isArray(rgbVals) && rgbVals.length === 4) {
            this._aboveBelowVals.above = {
                r: parseFloat(rgbVals[0]), g: parseFloat(rgbVals[1]),
                b: parseFloat(rgbVals[2]), a: parseFloat(rgbVals[3])
            }
        }
        this._aboveBelowCols.below = this.getAttribute("fillBelowCol")?.toLowerCase().trim() ?? "rgba(0.0, 0.0, 0.0, 0.0)";
        rgbVals = this._aboveBelowCols.below.match(/[.?\d]+/g) ?? [];
        if (Array.isArray(rgbVals) && rgbVals.length === 4) {
            this._aboveBelowVals.below = {
                r: parseFloat(rgbVals[0]), g: parseFloat(rgbVals[1]),
                b: parseFloat(rgbVals[2]), a: parseFloat(rgbVals[3])
            }
        }

        const data = this.getAttribute("data")?.toLowerCase().trim() ?? "";
        let dataVals = data.match(/[.?-\d]+/g) ?? [];
        let dataArr = new Array<number>();
        for (const d of dataVals) { dataArr.push(parseFloat(d)); }
        this.setData(dataArr);
    }

    // Sets sparkline rendering type
    public setType(type: SparklineType) {
        this._type = type; 
    }

    // Forces the values to be capped so that they are shown on
    // top / bottom of canvas if they are too large
    public setCap(above: boolean, below: boolean) {
        this._capAbove = above;
        this._capBelow = below;
    }

    // Set manual lower bound for the y-axis
    // Otherwise the lowerbound is tied to lowest value in data
    public setLowerBound(active: boolean, bound: number = 0) {
        this._useLowerBound = active;
        this._lowerBound = bound;
    }

    // Upperbound for the data for the y-axis
    // Otherwise the upperbound is to the highest value in data
    public setUpperBound(active: boolean, bound: number = 0) {
        this._useUpperBound = active;
        this._upperBound = bound;
    }

    // Sets fill type. If no fill is required, set solid fill and set alpha to zero
    public setFill(type: Filltype, params: SparklineCol | AboveBelowCols): void {
        this._fillType = type;
        if (type === Filltype.Solid) {
            this._fillColor = this.convertCol(params as SparklineCol);
        } else if (type === Filltype.Gradient) {
            const abCols = params as AboveBelowCols;
            this._aboveBelowCols = { above: this.convertCol(abCols.above), below: this.convertCol(abCols.below) };
        } else if (type === Filltype.AboveOneColBelowOneCol) {
            const abCols = params as AboveBelowCols;
            this._aboveBelowCols = { above: this.convertCol(abCols.above), below: this.convertCol(abCols.below) };
            this._aboveBelowVals = {...abCols};
        }
    }

    // Sets endpoint used in line type. Shows a dot at the end of the last data point
    public setEndpoint(size: number = 2.5, col: SparklineCol): void {
        this._endpointRadius = size;
        this._endpointColor = this.convertCol(col);
    }

    // Sets amount of data points for the sparkline
    public setDataPointNum(maxCount: number): void {
        maxCount = Math.round(maxCount);
        if (maxCount < 1 || maxCount === this._data.length) { return; }
                
        let newDataArray = new Array<number>();
        let counter = Math.min(this._dataCount, maxCount);            
        let index = this._mod(this._dataIndex - counter, this._data.length);
        while (counter > 0) {
            newDataArray.push(this._data[index]);
            index = (index + 1) % this._data.length;
            counter -= 1;
        }

        if (maxCount > counter) {
            // Extends the array if need to be
            newDataArray[maxCount - 1] = 0;
        }
        
        this._dataCount = Math.min(this._dataCount, maxCount);
        this._dataIndex = this._dataCount == maxCount ? 0 : this._dataIndex;
        this._data = newDataArray;
    }

    // Adds a new data point
    public addDatapoint(dataPoint: number): void {        
        this._sumVal += dataPoint - (this._data[this._dataIndex] ?? 0);
        this._data[this._dataIndex] = dataPoint;
        this._dataCount = Math.min(this._dataCount + 1, this._data.length);
        this._dataIndex = (this._dataIndex + 1) % this._data.length;

        this._minVal = Math.min(this._minVal, dataPoint);
        this._maxVal = Math.max(this._maxVal, dataPoint);        
    }

    // Sets data point as a bulk insert
    public setData(data: Array<number>): void {
        this._data = [...data];
        this._dataCount = this._data.length;
        this._dataIndex = 0;

        if (this._data.length == 0) {
            this._minVal = Number.MAX_VALUE;
            this._maxVal = -Number.MAX_VALUE;
            this._sumVal = 0;
        } else {
            this._minVal = Math.min.apply(Math, this._data);
            this._maxVal = Math.max.apply(Math, this._data);
            this._sumVal = this._data.reduce((val1: number, val2: number) => val1 + val2) ?? 0;
        }
    }

    // Sets linie width for the line chart type
    public setLineWidth(width: number): void {
        this._lineWidth = Math.max(0.1, width);
    }

    // Converts color to a string to CSS attribute string
    public convertCol(col: SparklineCol): string {
        const r = Math.max(0.0, Math.min(col.r, 255.0));
        const g = Math.max(0.0, Math.min(col.g, 255.0));
        const b = Math.max(0.0, Math.min(col.b, 255.0));
        const a = Math.max(0.0, Math.min(col.a, 1.0));
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";        
    }

    // Sets line color the line chart type
    public setLineColor(type: Linetype, param: SparklineCol | AboveBelowCols): void {        
        this._lineType = type;
        if (type === Linetype.Solid) {
            this._lineColor = this.convertCol(param as SparklineCol);
        } else {
            const abCols = param as AboveBelowCols;
            this._aboveBelowLineCols = { above: this.convertCol(abCols.above), below: this.convertCol(abCols.below) };            
        }        
    }

    // Sets reference line type and y-position (if type is "Custom")
    public setReferenceLine(type: RefLineType, y_pos: number = 0.0): void {        
        this._referenceLineType = type;
        this._referenceLineYPos = y_pos;
    }
    
    // Sets reference line width
    public setReferenceLineWidth(width: number): void {
        this._referenceLineWidth = Math.max(0.1, width);
    }

    // Sets reference line color
    public setReferenceLineColor(col: SparklineCol, width: number = 1.0): void {        
        this._referenceLineColor = this.convertCol(col);
        this._referenceLineWidth = width;
    }

    // Sets the background color used to clear the canvas
    public setBackgroundColor(col: SparklineCol): void {
        this._backgroundColor = this.convertCol(col);        
    }

    // JavaScript "%" operator doesn't handle negative values properly
    private _mod = (n: number, p: number) => n >= 0 ? n % p : (n + (Math.floor(-n / p) + 1) * p) % p;
    private _lastIndex = () => this._mod(this._dataIndex - 1, this._data.length);
    private _firstIndex = () => this._mod(this._dataIndex - this._dataCount, this._data.length);
    private _index = (index: number) => this._mod(this._dataIndex - this._dataCount + index, this._data.length);

    // Calculates median value from data
    private _calcMedianValue(): number {
        if (this._dataCount == 0) { return 0; }
        if (this._dataCount == 1) { return this._data[this._lastIndex()]; }
        
        const sorted = Array.from(this._data.slice(0, this._dataCount)).sort((a, b) => a - b);                
        const middle = Math.floor(sorted.length / 2);    
        return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2.0 : sorted[middle];        
    }

    // Calculates reference line y position on canvas
    private _calcReferenceLineYPos(): number {
        if (!this._ctx || !this._canvas) { return 0; }

        let yPos = -this._referenceLineWidth - 1 ;
        if (this._referenceLineType == RefLineType.None) {
            yPos = this._canvas.height;
        } else if (this._referenceLineType == RefLineType.Average) {
            yPos = Math.round(this._sumVal / this._dataCount);                      
            yPos = this._calcYPositionOnCanvas(yPos);            
        } else if (this._referenceLineType == RefLineType.Median) {
            yPos = this._calcMedianValue();
            yPos = this._calcYPositionOnCanvas(yPos);
        } else if (this._referenceLineType == RefLineType.Middle) {
            yPos = (this._canvas.height - this._referenceLineWidth) / 2.0;
        } else if (this._referenceLineType == RefLineType.Custom) {
            yPos = this._calcYPositionOnCanvas(this._referenceLineYPos);
        } else if (this._referenceLineType == RefLineType.TieToFirstDataPoint) {
                return this._dataCount > 0 ? this._calcYPositionOnCanvas(this._data[this._firstIndex()]) : yPos;
        }
        
        return yPos;
    }

    // Draws the reference line to canvas
    private _drawReferenceLine(): void {
        if (!this._ctx || !this._canvas) { return; }
        
        this._ctx.beginPath();
        this._ctx.strokeStyle = this._referenceLineColor;
        this._ctx.lineWidth = this._referenceLineWidth;
        
        const yPos = this._calcReferenceLineYPos();        
        this._ctx.moveTo(0, yPos);
        this._ctx.lineTo(this._renderingCanvasWidth, yPos);
        this._ctx.stroke();
    }

    // Calculates the variables for rendering the actual sparkline
    private _prepareForRendering(): void {
        if (!this._canvas || !this._ctx) { return; }

        this._renderingCanvasHeight = this._canvas.height - this._lineWidth - this._endpointRadius;
        this._renderingCanvasWidth = this._canvas.width - this._lineWidth / 2.0;
        this._renderingCanvasWidth -= this._endpointRadius;

        const lowerBound = this._useLowerBound ? this._lowerBound : this._minVal;
        const upperBound = this._useUpperBound ? this._upperBound : this._maxVal;        

        this._xstep = this._renderingCanvasWidth / Math.max(1, (this._data.length - 1));
		this._ystep = (upperBound - lowerBound) / this._renderingCanvasHeight;
    }

    // Converts coordinates from "data space" to canvas
    private _calcYPositionOnCanvas(value: number): number {
        const lowerBound = this._useLowerBound ? this._lowerBound : this._minVal;
        let y = this._renderingCanvasHeight - (value - lowerBound) / this._ystep;

        if (this._capAbove && y < 0) { y = this._endpointRadius; }
        if (this._capBelow && y > this._renderingCanvasHeight) { y = this._renderingCanvasHeight - this._endpointRadius; }
        return y;
    }    

    // Draws the line on screen (can be also used for filling)
    private _doDrawSparkLine(drawLine: boolean): { x: number; y: number } {
        if (!this._canvas || !this._ctx) { return { x: 0, y: 0 }; }

        if (drawLine) {
            if (this._lineType == Linetype.AboveBelowBasedOnFirstLastDiff) {
                this._ctx.strokeStyle = this._data[this._firstIndex()] <= this._data[this._lastIndex()] ?
                    this._aboveBelowLineCols.above :
                    this._aboveBelowLineCols.below;
            }
        }
        
        const referenceLineYpos = this._calcReferenceLineYPos();
        let prevX = 0;
        let prevY = this._calcYPositionOnCanvas(this._data[this._index(0)]);
        let x = 0;
        let y = prevY;
        for (let i = 1; i < this._dataCount; i = i + 1) {       
            x = x + this._xstep;        
            if (Math.round(x) > Math.round(prevX)) {
                y = this._calcYPositionOnCanvas(this._data[this._index(i)]);
                if (drawLine && this._lineType == Linetype.AboveOneColBelowOneCol) {
                    this._ctx.beginPath();
                    this._ctx.moveTo(prevX, prevY);
                    if (prevY <= referenceLineYpos && y <= referenceLineYpos) {
                        this._ctx.strokeStyle = this._aboveBelowLineCols.above;
                        this._ctx.lineTo(Math.round(x), Math.round(y));
                        this._ctx.stroke();
                    } else if (prevY >= referenceLineYpos && y >= referenceLineYpos) {
                        this._ctx.strokeStyle = this._aboveBelowLineCols.below;
                        this._ctx.lineTo(Math.round(x), Math.round(y));
                        this._ctx.stroke();
                    } else {
                        // Splits drawing the line to two
                        // On one color above ref line, on 2nd color below ref line
                        const deltaX = this._xstep / (y - prevY);
                        const startXPos = x - this._xstep;
                        const zeroPoint = startXPos + (referenceLineYpos - prevY) * deltaX;
                        this._ctx.strokeStyle = prevY <= referenceLineYpos ?
                            this._aboveBelowLineCols.above :
                            this._aboveBelowLineCols.below;
                        this._ctx.lineTo(Math.round(zeroPoint), Math.round(referenceLineYpos));
                        this._ctx.stroke();

                        this._ctx.beginPath();
                        this._ctx.moveTo(Math.round(zeroPoint), Math.round(referenceLineYpos));
                        this._ctx.strokeStyle = y <= referenceLineYpos ?
                            this._aboveBelowLineCols.above :
                            this._aboveBelowLineCols.below;
                        this._ctx.lineTo(Math.round(x), Math.round(y));
                        this._ctx.stroke();
                    }
                } else {
                    this._ctx.lineTo(Math.round(x), Math.round(y));
                }
            }
            
            prevX = x;
            prevY = y;
		}
        
        return { x, y };
    }

    // Draws the sparkline as line
    private _drawLine(): void {
        if (!this._canvas || !this._ctx) { return; }
        
        const referenceLineYpos = this._calcReferenceLineYPos();
        let y = this._calcYPositionOnCanvas(this._data[this._mod(this._dataIndex - this._dataCount, this._data.length)]);
        
        this._ctx.strokeStyle = this._lineColor;       
        this._ctx.lineWidth = this._lineWidth;
 
        // Sets the correct fill type. Re-set for gradients as reference line might have moved
        if (this._fillType === Filltype.Solid) {
            this._ctx.fillStyle = this._fillColor;
        } else if (this._fillType === Filltype.AboveOneColBelowOneCol) {
            const yPos = Math.max(0.0001, Math.min(0.9999, referenceLineYpos / this._canvas.height));
            const grd = this._ctx.createLinearGradient(0, 0, 0, this._canvas.height);
            grd.addColorStop(0, this._aboveBelowCols.above);
            grd.addColorStop(yPos - 0.001, this._aboveBelowCols.above);
            grd.addColorStop(yPos, "rgba(0,0,0,0)");
            grd.addColorStop(yPos + 0.001, this._aboveBelowCols.below);
            grd.addColorStop(1, this._aboveBelowCols.below);
            this._ctx.fillStyle = grd;
        } else if (this._fillType === Filltype.Gradient) {
            const yPos = Math.max(0.0001, Math.min(0.9999, referenceLineYpos / this._canvas.height));
            const grd = this._ctx.createLinearGradient(0, 0, 0, this._canvas.height);            
            grd.addColorStop(0, this._aboveBelowCols.above);
            let c = this._aboveBelowVals.above;
            grd.addColorStop(yPos, this.convertCol({ r: c.r, g: c.g, b: c.b, a: 0.0}));
            c = this._aboveBelowVals.below;
            grd.addColorStop(yPos + 0.0001, this.convertCol({ r: c.r, g: c.g, b: c.b, a: 0.0}));
            grd.addColorStop(1, this._aboveBelowCols.below);
            this._ctx.fillStyle = grd;
        }
		
        // First draw the line
        this._ctx.beginPath();
		this._ctx.moveTo(0, Math.round(y));
        const endCoordinates = this._doDrawSparkLine(true);
		this._ctx.stroke();

        // Then do the fill
        this._ctx.beginPath();
        this._ctx.moveTo(0, referenceLineYpos);
        this._ctx.lineTo(0, Math.round(y));
        this._doDrawSparkLine(false);
        this._ctx.lineTo(Math.round(endCoordinates.x), referenceLineYpos);
        this._ctx.closePath();                        
        this._ctx.fill();
        
        // Then draw the endpoint        
        this._ctx.beginPath();
        this._ctx.moveTo(Math.round(endCoordinates.x), Math.round(endCoordinates.y));
        this._ctx.arc(endCoordinates.x, endCoordinates.y, this._endpointRadius, 0, 2.0 * Math.PI);
        this._ctx.fillStyle = this._endpointColor;
        this._ctx.fill();        
    }

    // Draws the sparkline as bar chart
    private _drawBar(): void {
        if (!this._canvas || !this._ctx) { return; }
    
        const referenceLineYpos = this._calcReferenceLineYPos();    
        this._ctx.strokeStyle = this._lineColor;       
        this._ctx.lineWidth = this._lineWidth;
        
        if (this._fillType === Filltype.Solid) {
            this._ctx.fillStyle = this._fillColor;
        } else if (this._fillType === Filltype.AboveOneColBelowOneCol) {
            const yPos = Math.max(0.0001, Math.min(0.9999, referenceLineYpos / this._canvas.height));
            const grd = this._ctx.createLinearGradient(0, 0, 0, this._canvas.height);
            grd.addColorStop(0, this._aboveBelowCols.above);
            grd.addColorStop(yPos - 0.001, this._aboveBelowCols.above);
            grd.addColorStop(yPos, "rgba(0,0,0,0)");
            grd.addColorStop(yPos + 0.001, this._aboveBelowCols.below);
            grd.addColorStop(1, this._aboveBelowCols.below);
            this._ctx.fillStyle = grd;
        } else if (this._fillType === Filltype.Gradient) {
            const yPos = Math.max(0.0001, Math.min(0.9999, referenceLineYpos / this._canvas.height));
            const grd = this._ctx.createLinearGradient(0, 0, 0, this._canvas.height);            
            grd.addColorStop(0, this._aboveBelowCols.above);
            let c = this._aboveBelowVals.above;
            grd.addColorStop(yPos, this.convertCol({ r: c.r, g: c.g, b: c.b, a: 0.0}));
            c = this._aboveBelowVals.below;
            grd.addColorStop(yPos + 0.0001, this.convertCol({ r: c.r, g: c.g, b: c.b, a: 0.0}));
            grd.addColorStop(1, this._aboveBelowCols.below);
            this._ctx.fillStyle = grd;
        }

        const barSpace = this._xstep < 2.0 * this._lineWidth ? 0 : 2.0 * this._lineWidth * (this._data.length) / (this._data.length - 1);
        
        let x = 0;
        let prevX = -1;
        for (let i = 1; i < this._dataCount; i = i + 1) {
            if (Math.round(x) > Math.round(prevX)) {
                let addSpace = i == this._data.length - 1 ? 0 : barSpace;            
                let barYPos = this._calcYPositionOnCanvas(this._data[this._mod(this._dataIndex - this._dataCount + i, this._data.length)]);

                // First fill the bar
                this._ctx.beginPath();
                this._ctx.moveTo(Math.round(x), Math.round(referenceLineYpos));
                this._ctx.lineTo(Math.round(x), Math.round(barYPos));
                this._ctx.lineTo(Math.round(x + this._xstep - addSpace), Math.round(barYPos));
                this._ctx.lineTo(Math.round(x + this._xstep - addSpace), Math.round(referenceLineYpos));
                this._ctx.closePath();     
                this._ctx.fill();           

                // Then draw the bar outlines
                this._ctx.beginPath();   
                        
                if (this._lineType == Linetype.AboveOneColBelowOneCol) {
                    this._ctx.strokeStyle = barYPos <= referenceLineYpos ?
                        this._aboveBelowLineCols.above :
                        this._aboveBelowLineCols.below;
                } else if (this._lineType == Linetype.AboveBelowBasedOnFirstLastDiff) {
                    this._ctx.strokeStyle = this._data[this._firstIndex()] <= this._data[this._lastIndex()] ?
                        this._aboveBelowLineCols.above :
                        this._aboveBelowLineCols.below;
                }
                
                this._ctx.moveTo(Math.round(x), Math.round(referenceLineYpos));
                this._ctx.lineTo(Math.round(x), Math.round(barYPos));
                this._ctx.lineTo(Math.round(x + this._xstep - addSpace), Math.round(barYPos));
                this._ctx.lineTo(Math.round(x + this._xstep - addSpace), Math.round(referenceLineYpos));
                this._ctx.stroke();                
            }
            prevX = x;
            x = x + this._xstep;
		}                        
    }
    
    // Renders the canvas on screen
    public renderCanvas(): void {
        if (!this._canvas || !this._ctx) { return; }

        // Clear canvas
        this._ctx.beginPath();
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.beginPath();
        this._ctx.fillStyle = this._backgroundColor;
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);        

        if (this._dataCount < 2 || this._data.length < 2) { return; }
        this._prepareForRendering();

        // Draw actual sparkline
        if (this._type == SparklineType.Line) {
            this._drawLine();
        } else if (this._type == SparklineType.Bar) {
            this._drawBar();
        }		

        // Draw reference line
        this._drawReferenceLine();
    }

    // Sets the size of the canvas based on the size of the component itself
    private _setSize(): void {
        if (!this.parentElement || !this._canvas) { return; }
        this._canvas.style.width = this.clientWidth + "px";
        this._canvas.style.height = this.clientHeight + "px";                        
        this._canvas.width = this.clientWidth * window.devicePixelRatio;
        this._canvas.height = this.clientHeight * window.devicePixelRatio;            
        this.renderCanvas();
    }

    // Lifecycle method called when the element has been added to DOM
    connectedCallback(): void {
        super.connectedCallback();

        if (!this.parentElement) { return; }
        this._resizeObserver = new ResizeObserver(_entries => {            
            this._setSize();
        });                  
        this._resizeObserver.observe(this);
    }

    // Lifecycle method called when the element has been removed from DOM
    disconnectedCallback(): void {
        super.disconnectedCallback();

        this._resizeObserver?.disconnect();
        this._resizeObserver = null;
    }

    // Lifecycle method called a single time after element has been updated
    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);        
        this._canvas = this.shadowRoot?.getElementById("sparkline_canvas") as HTMLCanvasElement;
        this._ctx = this._canvas.getContext("2d"); 

        if (!this.parentElement || !this._canvas || !this._ctx) { return; }

        this._setSize();
        // Stupid drink to get the anti-aliasing handled when drawing lines
        this._ctx.translate(0.5, 0.5);
    }

    // Called when any properties have changed on the component - re-draws the sparkline
    protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        this.renderCanvas();
    }

    // Renders the canvas, but doesn't draw the actual sparkline. For that, call renderCanvas()
    protected render(): unknown {
        return html`
        <canvas class="sparkline_canvas" id="sparkline_canvas">
        </canvas>            
        `;
    }
    
    // Stylesheet
    static styles = css`                
        .sparkline_canvas {            
            display: inline-block;
            width: inherit;
            height: inherit;
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        "magx-sparkline": MagxSparkline
    }
}