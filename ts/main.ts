declare let Detector: any;

const VERTICAL = "縦書き";
const HORIZONTAL = "横書き";

let fontList: HTMLSelectElement;
let fontSizeList: HTMLSelectElement;
let fontWeightList : HTMLSelectElement;
let colorList : HTMLSelectElement;
let centerLineCheckbox : HTMLInputElement;

let charMarginList: HTMLSelectElement;
let lineMarginList: HTMLSelectElement;

let paperList : HTMLSelectElement;
let paperMarginInput : HTMLInputElement;
let directionList : HTMLSelectElement;

let colors = [ "#000000", "#202020", "#404040", "#606060", "#808080", "#A0A0A0", "#C0C0C0", "#E0E0E0", "#F0F0F0" ];
let papers = ["A4縦", "A4横", "A5縦", "A5横", "B5縦", "B5横"];
let paperSizes = [[210,297], [297,210], [148,210], [210,148], [176,250], [250,176]];

class Inf {
    fontName : string;
    fontSize: number;
    fontWeight: string;
    color: string;
    centerLine : boolean;
    paper: string;
    paperMargin: number;

    rows : number;
    cols : number;
    charMargin : number;
    lineMargin : number;
    direction: string;

    constructor(){
        let opt = fontList.selectedOptions[0];

        this.fontName = opt.textContent!;
        this.fontSize = parseInt(fontSizeList.value);  
        this.fontWeight = fontWeightList.value;  
        this.color = colors[colors.length - parseInt(colorList.value)];
        this.centerLine = centerLineCheckbox.checked;

        this.paper = papers[paperList.selectedIndex];
        let [w_mm,h_mm] = paperSizes[paperList.selectedIndex];

        this.paperMargin = parseFloat(paperMarginInput.value);

        w_mm -= 2 * this.paperMargin;
        h_mm -= 2 * this.paperMargin;

        let w_px = 96 * w_mm / 25.4;
        let h_px = 96 * h_mm / 25.4;

        this.rows = Math.ceil(h_px / this.fontSize);
        this.cols = Math.ceil(w_px / this.fontSize);

        this.charMargin = parseFloat(charMarginList.value);
        this.lineMargin = parseFloat(lineMarginList.value);
        this.direction = directionList.value;
    }
}

function range(start: number, end: number|undefined = undefined, step: number = 1): number[]{
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
    fontWeightList = setSelect("font-weight", ["bold", "bolder", "normal", "lighter"], "normal");
    colorList = setSelect("color", range(1, colors.length), 5);
    centerLineCheckbox = document.getElementById("center-line") as HTMLInputElement;

    charMarginList = setSelect("char-margin", [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], 0.5);
    lineMarginList = setSelect("line-margin", [ 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], 0.5);
    paperList = setSelect("paper-list", papers, 20);
    directionList = setSelect("direction-list", [HORIZONTAL, VERTICAL], HORIZONTAL);

    paperMarginInput = document.getElementById("paper-margin") as HTMLInputElement;

    fontSizeList.onchange = draw;
    fontWeightList.onchange = draw;
    colorList.onchange = draw;
    centerLineCheckbox.onchange = draw;

    paperMarginInput.onblur = draw;

    charMarginList.onchange = draw;
    lineMarginList.onchange = draw;
    paperList.onchange = draw;
    directionList.onchange = draw;
}

function initShuji(){
    initSettings();

    getFontList();

    let settings = localStorage.getItem("settings");
    if(settings != null){

        let inf = JSON.parse(settings) as Inf;
        fontList.value = inf.fontName;
        fontSizeList.value = "" + inf.fontSize;

        fontWeightList.value = inf.fontWeight;

        let i = colors.indexOf(inf.color);
        if(i != -1){
            colorList.value = "" + (colors.length - i);
        }

        centerLineCheckbox.checked = inf.centerLine;

        // rowsList.value = "" + inf.rows;
        // colsList.value = "" + inf.cols;

        charMarginList.value = "" + inf.charMargin;
        lineMarginList.value = "" + inf.lineMargin;
        directionList.value = inf.direction;
    }

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

function drawLine2(inf: Inf, g: SVGGElement, x1: number, y1: number, x2: number, y2: number){
    let hline = document.createElementNS("http://www.w3.org/2000/svg","line");
    g.appendChild(hline);

    hline.setAttribute("stroke", inf.color);
    hline.setAttribute("stroke-width", `${1}`);
    hline.setAttribute("stroke-dasharray", "5,5");

    hline.setAttribute("x1", `${x1}`);
    hline.setAttribute("y1", `${y1}`);
    hline.setAttribute("x2", `${x2}`);
    hline.setAttribute("y2", `${y2}`);
}

function drawText2(inf: Inf, g: SVGGElement, str: string, x: number, y: number){
    let text = document.createElementNS("http://www.w3.org/2000/svg","text");
    g.appendChild(text);

    text.setAttribute("font-family", inf.fontName);
    text.setAttribute("fill", inf.color);
    text.setAttribute("font-size", `${inf.fontSize}`);
    text.setAttribute("font-weight", inf.fontWeight);


    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("alignment-baseline", "central");
    // text.setAttribute("", "");

    if(inf.direction == VERTICAL){

        text.setAttribute("writing-mode", "tb");
    }
    // text.setAttribute("stroke-width", `${0.2 * p.y}`);
    text.setAttribute("x", "" + x);
    text.setAttribute("y", "" + y);
    text.textContent = str;

}


function makeSVG(inf: Inf) : [SVGSVGElement, SVGGElement] {
    let width: number, height: number;

    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.style.display = "block";

    if(inf.direction == HORIZONTAL){

        width  = (inf.cols + (inf.cols + 1) * inf.charMargin) * inf.fontSize;
        height = (inf.rows + (inf.rows + 1) * inf.lineMargin) * inf.fontSize;

        svg.style.marginLeft = "auto";
        svg.style.marginRight = "auto";
    }
    else{

        height  = (inf.cols + (inf.cols + 1) * inf.charMargin) * inf.fontSize;
        width   = (inf.rows + (inf.rows + 1) * inf.lineMargin) * inf.fontSize;

        // canvas.style.marginLeft = "auto";
        // canvas.style.marginRight = "auto";
    }

    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.style.margin = "0px";

    // viewBox="-10 -10 20 20"
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    document.body.appendChild(svg);

    let g = document.createElementNS("http://www.w3.org/2000/svg","g");
    svg.appendChild(g);

    // let ys = range(line.length).map(i=> startY + i * inf.fontSize);

    return [svg, g];
}

function draw(){
    for(let tag of [ "svg", "canvas", "hr" ]){
        for(let c of Array.from(document.body.getElementsByTagName(tag))){
            document.body.removeChild(c)
        }
    }

    let inf = new Inf();

    let [svg, g] = makeSVG(inf);

    const bodyText = (document.getElementById("body-text") as HTMLTextAreaElement).value;

    let lineSize, charSize;
    
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

                x = svg.clientWidth - linePos;
                y = charPos;
            }

            if(inf.centerLine){

                drawLine2(inf, g, x - charWidth/2.0, y, x + charWidth/2.0, y);
                drawLine2(inf, g, x, y - charHeight/2.0, x, y + charHeight/2.0);
            }

            drawText2(inf, g, c, x, y);

        }

        lineIdx++;
        if(lineIdx == inf.rows){

            document.body.appendChild(document.createElement("hr"));

            [svg, g] = makeSVG(inf);

            lineIdx = 0;
        }
    }
}

function saveClick(){
    let inf = new Inf();

    localStorage.setItem("settings", JSON.stringify(inf));

    alert("設定を保存しました。");
}
