declare let Detector: any;

const VERTICAL = "縦書き";
const HORIZONTAL = "横書き";

let fontSizeList: HTMLSelectElement;
let fontList: HTMLSelectElement;
let charMarginList: HTMLSelectElement;
let lineMarginList: HTMLSelectElement;
let rowsList : HTMLSelectElement;
let colsList : HTMLSelectElement;
let directionList : HTMLSelectElement;

class Inf {
    fontSize: number;
    rows : number;
    cols : number;
    charMargin : number;
    lineMargin : number;
    fontName : string;
    direction: string;

    constructor(){
        let opt = fontList.selectedOptions[0];
        this.fontName = opt.textContent!;
    
        this.fontSize = parseInt(fontSizeList.value)    
        this.rows = parseInt(rowsList.value);
        this.cols = parseInt(colsList.value);

        this.charMargin = parseFloat(charMarginList.value);
        this.lineMargin = parseFloat(lineMarginList.value);
        this.direction = directionList.value;
    }
}

function range(start: number, end: number|undefined, step: number = 1){
    if(end == undefined){

        return [...Array(start).keys()];
    }

    if(step == undefined){
        step = 1;
    }

    let n = Math.round((end - start) / step) + 1;

    let v : number[] = [];
    for(let i = 0; i < n; i++){
        v.push(start + i * step);
    }

    return v;
}

function msg(s: string){
    console.log(s);
}

function setSelect(id: string, values: any[], init:any|undefined = undefined) : HTMLSelectElement {
    let sel = document.getElementById(id) as HTMLSelectElement;

    for(let value of values){
        let opt = document.createElement("option");
        opt.value = "" + value;
        opt.textContent = "" + value;
        sel.appendChild(opt);

        if(value == init){
            sel.selectedIndex = sel.options.length - 1;
        }
    }

    return sel;
}

function initSettings(){
    fontSizeList = setSelect("font-size", range(8, 100, 2), 48);
    charMarginList = setSelect("char-margin", [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], 0.5);
    lineMarginList = setSelect("line-margin", [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], 0.5);
    rowsList = setSelect("rows-list", range(1, 100), 20);
    colsList = setSelect("cols-list", range(1, 100), 20);
    directionList = setSelect("direction-list", [HORIZONTAL, VERTICAL], HORIZONTAL);

    fontSizeList.onchange = draw;
    charMarginList.onchange = draw;
    lineMarginList.onchange = draw;
    rowsList.onchange = draw;
    colsList.onchange = draw;
}

function initShuji(){
    initSettings();

    getFontList();

    draw();
}

function getFontList(){
    fontList = document.getElementById("font-list") as HTMLSelectElement;

    let fontNames = (document.getElementById("font-list-text") as HTMLTextAreaElement).value.split('\n');
    let d = new Detector();
    for(let name of fontNames){
        if(d.detect(name)){

            let opt = document.createElement("option");
            opt.textContent = name;
            fontList.appendChild(opt);
        }
        else{

            msg(`${name} NG`);
        }
    }

    fontList.onchange = draw;
}

function drawLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number){
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number){
    ctx.setLineDash([]);
    // ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
}

function makeCanvasContext(inf: Inf) : [ HTMLCanvasElement, CanvasRenderingContext2D ]{
    let canvas = document.createElement("canvas");

    canvas.style.display = "block";
    if(inf.direction == HORIZONTAL){

        canvas.width  = (inf.cols + (inf.cols + 1) * inf.charMargin) * inf.fontSize;
        canvas.height = (inf.rows + (inf.rows + 1) * inf.lineMargin) * inf.fontSize;

        canvas.style.marginLeft = "auto";
        canvas.style.marginRight = "auto";
    }
    else{

        canvas.height  = (inf.cols + (inf.cols + 1) * inf.charMargin) * inf.fontSize;
        canvas.width   = (inf.rows + (inf.rows + 1) * inf.lineMargin) * inf.fontSize;

        canvas.style.marginLeft = "auto";
        canvas.style.marginRight = "auto";
    }

    // <canvas style="border-style: ridge; margin-left: auto; margin-right: auto; width: 100px; text-align: center; display: block;"></canvas>    

    document.body.appendChild(canvas);
    let ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;

    ctx.font = `100 ${inf.fontSize}px ${inf.fontName}`;

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    let color = "#808080"
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.setLineDash([5, 5]);

    return [ canvas, ctx ];
}

function draw(){
    for(let tag of [ "svg", "canvas", "hr" ]){
        for(let c of Array.from(document.body.getElementsByTagName(tag))){
            document.body.removeChild(c)
        }
    }

    const bodyText = (document.getElementById("body-text") as HTMLTextAreaElement).value;

    let inf = new Inf();

    let [canvas , ctx] = makeCanvasContext(inf);

    let tm = ctx.measureText("漢");
    let lineSize, charSize;
    
    // let charWidth  = tm.width;
    // let charHeight = Math.max(0, tm.actualBoundingBoxAscent) + Math.max(0, tm.actualBoundingBoxDescent);

    let charWidth = inf.fontSize;
    let charHeight = inf.fontSize;

    if(inf.direction == HORIZONTAL){

        lineSize = charHeight;
        charSize = charWidth;
    }
    else{

        lineSize = charWidth;
        charSize = charHeight;
    }

    let lines : string[] = [];

    for(let text of bodyText.split('\n')){
        while(inf.cols < text.length){
            lines.push(text.substring(0, inf.cols));
            text = text.substring(inf.cols);
        }
        if(text != ""){
            lines.push(text);
        }
    }

    let lineIdx = 0;
    let pageStart = (inf.lineMargin + 0.5) * lineSize;
    for(let line of lines){
        let linePos = pageStart + lineIdx * (1 + inf.lineMargin) * lineSize;
        let lineStart = (inf.charMargin + 0.5) * charSize;
        for(let [idx, c] of line.split('').entries()){
            let charPos = lineStart + idx * (1 + inf.charMargin) * charSize;

            let x, y;

            if(inf.direction == HORIZONTAL){

                x = charPos;
                y = linePos;
            }
            else{

                x = canvas.width - linePos;
                y = charPos;
            }

            drawLine(ctx, x - charWidth/2.0, y, x + charWidth/2.0, y);
            drawLine(ctx, x, y - charHeight/2.0, x, y + charHeight/2.0);

            drawText(ctx, c, x, y);
        }

        lineIdx++;
        if(lineIdx == inf.rows){

            document.body.appendChild(document.createElement("hr"));

            [canvas , ctx] = makeCanvasContext(inf);
            lineIdx = 0;
        }
    }
}
