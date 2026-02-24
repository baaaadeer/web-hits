import { renderVariable } from "./variable.js";

const workArea = document.getElementById("Work-Area");
const menu = document.getElementById("menu");

const state={
  blocks: new Map(),    
};

function defParameters(type){
  if (type=="variable")
    return {name: "x", value:"0"};
  if (type=="operation")
    return {};
  return {};
}

function createId(){
  return Math.floor(Math.random()*1000)+1;
}


function createBlock(type){
  return{
    id:createId(), type, x: 0, y:0, parameters: defParameters(type),
  };
}

function getTitle(type){
  if (type=="variable") return "Переменная";
  if (type=="operation") return "Арифм. операция"
  if (type=="operatorIf") return "If"
}

function renderNode(object){
  const element=document.createElement("div");
  element.className= `block instance`
  element.dataset.id=object.id;

  element.dataset.x=String(object.x);
  element.dataset.y=String(object.y);

  element.style.transform = `translate(${object.x}px,${object.y}px)`;

  element.innerHTML = `
    <div class = "nodeHeader">${getTitle(object.type)}</div>
    <div class = "nodeBody">
      ${renderVariable(object)}
    </div>
  `;

  element.addEventListener("input",(eventObject) =>{
    const input = eventObject.target.closest("input[data-field]");
    if (!input) return;

    const id = element.dataset.id;
    const modelMap = state.blocks.get(id);

    if(!modelMap) return;

    const field=input.dataset.field;
    modelMap.parameters[field]=input.value;
  });

  workArea.appendChild(element);
  makeDraggable(element);
  return element;
}

  menu.addEventListener("click", (eventObject)=>{
    const click = eventObject.target.closest(".block[data-type]");
    if (!click) return;

    const type = click.dataset.type;
    const model = createBlock(type);
    state.blocks.set(model.id,model);

    renderNode(model);
  });

function makeDraggable(element){
  interact(element).draggable({
    modifiers: [ interact.modifiers.restrictRect({restriction: workArea})],
    listeners: {
    move(event){
      const target = event.target;

      const prevX = parseFloat(target.dataset.x) || 0;
      const prevY = parseFloat(target.dataset.y) || 0;

      const x = prevX+event.dx;
      const y = prevY+event.dy;

      target.style.transform = `translate(${x}px,${y}px)`;

      target.dataset.x=String(x);
      target.dataset.y=String(y);
      const id = target.dataset.id;
      const object = state.blocks.get(id);

      if (object){
        object.x=x;
        object.y=y;
      }
    }
  }
  });
}