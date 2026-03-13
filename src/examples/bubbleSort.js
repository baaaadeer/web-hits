export function getBubbleSortBlocks() {
  const nodes = [];
  const edges = [];

  function createNode(type, parameters, x, y) {
    const node = {
      id: crypto.randomUUID(),
      type,
      position: { x, y },
      data: { parameters },
    };
    nodes.push(node);
    return node;
  }

  function connect(sourceId, targetId, sourceHandle = undefined) {
    edges.push({
      id: crypto.randomUUID(),
      source: sourceId,
      target: targetId,
      sourceHandle,
    });
  }

  const arrayNode = createNode("array", { name: "a", length: "6", elements: "5, 2, 8, 1, 9, 0" }, 100, 50);
  const nNode = createNode("assign", { target: "n", value: "5" }, 100, 150);
  const forI = createNode("forBl", { variable: "i=0", endCondition: "i<n-1", step: "i+=1" }, 100, 250);
  const forJ = createNode("forBl", { variable: "j=0", endCondition: "j<n-i-1", step: "j+=1" }, 100, 350);
  const ifCompare = createNode("operatorIf", { expression: "a[j]>a[j+1]" }, 100, 450);
  const tempAssign = createNode("assign", { target: "temp", value: "a[j]" }, 400, 450);
  const swap1 = createNode("assign", { target: "a[j]", value: "a[j+1]" }, 400, 550);
  const swap2 = createNode("assign", { target: "a[j+1]", value: "temp" }, 400, 650);
  const out0 = createNode("cout", { target: "a" }, 100, 750);


  connect(arrayNode.id, nNode.id);
  connect(nNode.id, forI.id);
  connect(forI.id, forJ.id, "body");
  connect(forJ.id, ifCompare.id, "body");
  connect(ifCompare.id, tempAssign.id, "true");
  connect(tempAssign.id, swap1.id);
  connect(swap1.id, swap2.id);
  connect(forI.id, out0.id, "exit");

  return { nodes, edges };
}
