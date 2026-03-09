import "./App.css";
import { useCallback, useMemo, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge } from "@xyflow/react";
import { VariableBlock, AssignBlock, IfBlock,WhileBlock,ForBlock,ArrayBlock,CoutBlock,ArifmeticBlock} from "./renderNode";
import { runCode } from "./interpreter/interpreter";

import "@xyflow/react/dist/style.css";

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [logs, setLogs] = useState([]);

  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useRef(null);

  const nodeTypes = useMemo(
    () => ({
      variable: VariableBlock,
      assign: AssignBlock,
      operatorIf: IfBlock,
      whileBl: WhileBlock,
      forBl: ForBlock,
      array: ArrayBlock,
      cout: CoutBlock,
      arifmetic: ArifmeticBlock,
    }),
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges]
  );

  function addBlock(type) {
    if (!reactFlowWrapper.current || !reactFlowInstance.current) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();

    const centerScreen = {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    };
    const position = reactFlowInstance.current.screenToFlowPosition(centerScreen);
    let parameters = {};
    if (type === "variable") parameters = { name: "x" };
    if (type === "assign") parameters = { target: "x", value: "0" };
    if (type === "operatorIf") parameters = { firstVar: "a", operator: ">", secondVar: "b" };
    if (type==="whileBl") parameters = {condition: ""};
    if (type==="forBl") parameters = {variable: "i", endCondition: "i<100", step: "i+=1"};
    if (type==="array") parameters = {name: "a", elements: ""};
    if (type==="cout") parameters = {};
    if (type==="arifmetic") parameters ={operation: "+"};

    const newNode = {
      id: crypto.randomUUID(),
      type,
      position: {
        x: position.x,
        y: position.y,
      },
      data: { parameters },
    };
    setNodes((prev) => [...prev, newNode]);
  }
  function handleRun() {
    try {
      const result = runCode(nodes, edges);
      setLogs(result);
    } catch (error) {
      setLogs(["Критическая ошибка интерпретатора: " + error.message]);
    }
  }

  function handleClear() {
    setLogs([]);
  }

  return (
    <div className="backBlock">
      <div className="BlocksArea" id="menu">
        <div className="title">Блоки</div>
        <div className="block" onClick={() => addBlock("variable")}>
          Создать переменную
        </div>
        <div className="block" onClick={() => addBlock("assign")}>
          Присвоить значение
        </div>
        <div className="block" onClick={() => addBlock("operatorIf")}>
          If
        </div>
        <div className="block" onClick={()=>addBlock("whileBl")}>
          while
        </div>
        <div className="block" onClick={()=>addBlock("forBl")}>
          for
        </div>
        <div className="block" onClick={()=>addBlock("array")}>
          Массив
        </div>
        <div className="block" onClick={()=>addBlock("cout")}>
          Вывод
        </div>
        <div className="block" onClick={()=>addBlock("arifmetic")}>
          Арифм.Операция
        </div>

        
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={handleRun} style={{ padding: "10px", fontWeight: "bold", background: "#4CAF50", color: "white", border: "none" }}>
            ▶ Запустить
          </button>
          <button onClick={handleClear} style={{ padding: "10px", background: "#f44336", color: "white", border: "none" }}>
            Очистить
          </button>
        </div>
      </div>

      <div className="WorkArea" ref={reactFlowWrapper} style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => {
            reactFlowInstance.current = instance;
          }}
          fitView
        >
          <Background />
        </ReactFlow>
      </div>
      <div className="OutputArea" id="output">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span className="title">Output</span>
          <span style={{ fontSize: "0.8em", opacity: 0.7 }}>{logs.length} строк</span>
        </div>
        <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "4px 0" }}>
                {log}
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.5 }}>Нажмите "Запустить" для выполнения...</div>
          )}
        </div>
      </div>
    </div>
  );
}