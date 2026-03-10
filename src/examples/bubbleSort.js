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

  const arrayNode = createNode("array", { name: "a", elements: "5, 2, 8, 1, 9" }, 100, 50);
  const nNode = createNode("assign", { target: "n", value: "5" }, 100, 150);
  const forI = createNode("forBl", { variable: "i=0", endCondition: "i<n-1", step: "i+=1" }, 100, 250);
  const forJ = createNode("forBl", { variable: "j=0", endCondition: "j<n-i-1", step: "j+=1" }, 100, 350);
  const ifCompare = createNode("operatorIf", { firstVar: "a[j]", operator: ">", secondVar: "a[j+1]" }, 100, 450);
  const tempAssign = createNode("assign", { target: "temp", value: "a[j]" }, 400, 450);
  const swap1 = createNode("assign", { target: "a[j]", value: "a[j+1]" }, 400, 550);
  const swap2 = createNode("assign", { target: "a[j+1]", value: "temp" }, 400, 650);
  const out0 = createNode("cout", { target: "a[0]" }, 100, 750);
  const out1 = createNode("cout", { target: "a[1]" }, 100, 850);
  const out2 = createNode("cout", { target: "a[2]" }, 100, 950);
  const out3 = createNode("cout", { target: "a[3]" }, 100, 1050);
  const out4 = createNode("cout", { target: "a[4]" }, 100, 1150);

  connect(arrayNode.id, nNode.id);
  connect(nNode.id, forI.id);
  connect(forI.id, forJ.id, "body");
  connect(forJ.id, ifCompare.id, "body");
  connect(ifCompare.id, tempAssign.id, "true");
  connect(tempAssign.id, swap1.id);
  connect(swap1.id, swap2.id);
  connect(swap2.id, forJ.id);
  connect(ifCompare.id, forJ.id, "false");
  connect(forJ.id, forI.id, "exit");
  connect(forI.id, out0.id, "exit");
  connect(out0.id, out1.id);
  connect(out1.id, out2.id);
  connect(out2.id, out3.id);
  connect(out3.id, out4.id);

  return { nodes, edges };
}
