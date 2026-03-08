import {Handle, Position, useReactFlow} from "@xyflow/react";

function BaseBlock({title,children}){
    return (
        <div className="nodeBox">
            <div className="title">{title}</div>
            {children}
        </div>
    );
}

export function VariableBlock({id,data}){
    const {setNodes} = useReactFlow();
    const parametr = data.parameters;
    const setName = (name) => setNodes((prev) => prev.map((n) => (n.id === id ? {...n, data: {...n.data,parameters: {...parametr,name}}} : n)));
    return (
        <BaseBlock title = "Переменная">
            <div className="row">
                <span>Имя:</span>
                <input value={parametr.name ?? ""} onChange={(element) => setName(element.target.value)} placeholder="x"/>
            </div>
            <Handle type="source" position={Position.Right}/>
        </BaseBlock>

    );
}

export function AssignBlock({id,data}){
    const {setNodes} = useReactFlow();
    const parametr = data.parameters;
    const change = (changeObject)=> setNodes((prev) => prev.map((n) => (n.id === id ? {...n,data: {...n.data,parameters: {...parametr,...changeObject}}}: n)));

    return (
        <BaseBlock title="Присваивание">
            <div className="row">
                <span>Имя:</span>
                <input value={parametr.target ?? ""} onChange={(element)=> change({target: element.target.value})} placeholder="x"/>
            </div>
            <div className="row">
                <span>Значение</span>
                <input value={parametr.value ?? ""} onChange={(element)=>change({value: element.target.value})} placeholder="0"/>
            </div>
            <Handle type="target" position={Position.Left}/>
            <Handle type="source" position={Position.Right}/>
        </BaseBlock>
    );
}

export function IfBlock({id,data}){
    const {setNodes} = useReactFlow();
    const parametr = data.parameters;
    const change = (changeObject)=> setNodes((prev) => prev.map((n) => (n.id === id ? {...n,data: {...n.data,parameters: {...parametr,...changeObject}}}: n)));

    return (
        <BaseBlock title="If">
            <div className="row">
                <span>Первый</span>
                <input value={parametr.firstVar ?? ""} onChange={(element)=> change({firstVar: element.target.value})} placeholder="a"/>
            </div>
            <div className="row">
                <span>Условие</span>
                <select value={parametr.operator ?? ">"} onChange={(element)=> change({operator: element.target.value})}>
                    <option value=">">{">"}</option>
                    <option value=">=">{">="}</option>
                    <option value="<=">{"<="}</option>
                    <option value="<">{"<"}</option>
                    <option value="==">{"=="}</option>
                </select>
            </div>
            <div className="row">
                <span>Второй</span>
                <input value={parametr.secondVar ?? ""} onChange={(element)=> change({secondVar: element.target.value})} placeholder="b"/>
            </div>
            <Handle type="target" position={Position.Left}/>
            <Handle 
            type="source" 
            id="true" 
            position={Position.Bottom} 
            style={{left: "30%", background:"green"}}/>
        
            <Handle 
            type="source"
            id ="false" 
            position={Position.Bottom} 
            style={{left:"70%", background:"red"}}/>
        </BaseBlock>
    )
}

export function WhileBlock({id,data}){
    const {setNodes} = useReactFlow();
    const parametr = data.parameters;
    const change = (changeObject)=> setNodes((prev) => prev.map((n) => (n.id === id ? {...n,data: {...n.data,parameters: {...parametr,...changeObject}}}: n)));
    return (
        <BaseBlock title="while">
            <div className="row">
                <span>Условие:</span>
                <input value={parametr.condition ?? ""} onChange={(element)=> change({condition: element.target.value})} placeholder="i<10"/>
            </div>
            <Handle type="target" position={Position.Left}/>
            <Handle type="source" position={Position.Right}/>
        </BaseBlock>
    )
}

export function ForBlock({id,data}){
    const {setNodes} = useReactFlow();
    const parametr = data.parameters;
    const change = (changeObject)=> setNodes((prev) => prev.map((n) => (n.id === id ? {...n,data: {...n.data,parameters: {...parametr,...changeObject}}}: n)));
    return (
        <BaseBlock title="for">
            <div className="row">
                <span>Переменная</span>
                <input value={parametr.variable ?? ""} onChange={(element)=> change({variable: element.target.value})} placeholder="i=0"/>
            </div>
            <div className="row">
                <span>Условие окончания:</span>
                <input value={parametr.endCondition ?? ""} onChange={(element)=> change({endCondition: element.target.value})} placeholder="i<100"/>
            </div>
            <div className="row">
                <span>Шаг</span>
                <input value={parametr.step ?? ""} onChange={(element)=> change({step: element.target.value})} placeholder="i=0"/>
            </div>
            <Handle type="target" position={Position.Left}/>
            <Handle type="source" position={Position.Right}/>
        </BaseBlock>
    )
}
export function ArrayBlock({id,data}){
    const {setNodes} = useReactFlow();
    const parametr = data.parameters;
    const change = (changeObject)=> setNodes((prev) => prev.map((n) => (n.id === id ? {...n,data: {...n.data,parameters: {...parametr,...changeObject}}}: n)));
    return (
        <BaseBlock title="Массив">
            <div className="row">
                <span>Имя</span>
                <input value={parametr.name ?? ""} onChange={(element)=> change({name: element.target.value})} placeholder="i=0"/>
            </div>
            <div className="row">
                <span>Элементы</span>
                <input value={parametr.elements ?? ""} onChange={(element)=> change({elements: element.target.value})}/>
            </div>
            <Handle type="target" position={Position.Left}/>
            <Handle type="source" position={Position.Right}/>
        </BaseBlock>
    )
}

