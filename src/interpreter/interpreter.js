export class Interpreter {
  constructor(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.memory = {}; 
    this.outputLog = []; 
    this.adjacencyList = {}; 
  }

  run() {
    this.outputLog = [];
    this.memory = {};
    this.buildGraph();
    
    const startNodes = this.findStartNodes();

    if (startNodes.length === 0 && this.nodes.length > 0) {
      this.log("Ошибка: Граф содержит циклы или не имеет точки входа.");
      return this.outputLog;
    }

    startNodes.forEach(node => {
      this.executeNode(node);
    });

    return this.outputLog;
  }

  buildGraph() {
    this.adjacencyList = {};
    this.nodes.forEach(node => {
      this.adjacencyList[node.id] = [];
    });

    this.edges.forEach(edge => {
      const sourceNode = this.nodes.find(n => n.id === edge.source);
      if (sourceNode) {
        const handle = edge.sourceHandle || 'default';
        this.adjacencyList[edge.source].push({
          targetId: edge.target,
          handle: handle
        });
      }
    });
  }

  findStartNodes() {
    const incomingEdges = new Set();
    this.edges.forEach(edge => incomingEdges.add(edge.target));
    return this.nodes.filter(node => !incomingEdges.has(node.id));
  }

  executeNode(node) {
    const type = node.type;
    const data = node.data?.parameters || {};

    this.log(`Выполнение блока: ${type}`);

    try {
      switch (type) {
        case 'variable':
          this.handleVariable(data);
          break;
        case 'assign':
          this.handleAssign(data);
          break;
        case 'operatorIf':
          this.handleIf(node, data);
          return;
        default:
          this.log(`Неизвестный тип блока: ${type}`);
      }
      this.moveToNextNodes(node.id);

    } catch (error) {
      this.log(`Ошибка в блоке ${type}: ${error.message}`);
    }
  }

  handleVariable(data) {
    const name = data.name;
    if (!name) throw new Error("Имя переменной не указано");
    
    if (this.memory.hasOwnProperty(name)) {
      this.log(`Предупреждение: Переменная '${name}' уже существует.`);
    }
    this.memory[name] = 0; 
    this.log(`Создана переменная: ${name} = ${this.memory[name]}`);
  }

  handleAssign(data) {
    const target = data.target;
    const valueRaw = data.value;

    if (!target) throw new Error("Целевая переменная не указана");

    const value = this.evaluateExpression(valueRaw);

    this.memory[target] = value;
    this.log(`Присвоено: ${target} = ${value}`);
  }

  handleIf(node, data) {
    const { firstVar, operator, secondVar } = data;
    
    const val1 = this.evaluateExpression(firstVar);
    const val2 = this.evaluateExpression(secondVar);

    let conditionMet = false;

    switch (operator) {
      case '>': conditionMet = val1 > val2; break;
      case '<': conditionMet = val1 < val2; break;
      case '==': conditionMet = val1 == val2; break;
      case '>=': conditionMet = val1 >= val2; break;
      case '<=': conditionMet = val1 <= val2; break;
      case '!=': conditionMet = val1 != val2; break;
      default: throw new Error(`Неизвестный оператор: ${operator}`);
    }

    this.log(`Условие (${val1} ${operator} ${val2}) = ${conditionMet ? 'ИСТИНА' : 'ЛОЖЬ'}`);

    const nextSteps = this.adjacencyList[node.id] || [];

    if (nextSteps.length === 0) return;
    
    if (conditionMet) {
      const trueBranch = nextSteps.find(step => step.handle === 'true') || nextSteps[0];
      if (trueBranch) {
        const nextNode = this.nodes.find(n => n.id === trueBranch.targetId);
        if (nextNode) this.executeNode(nextNode);
      }
    } else {
      const falseBranch = nextSteps.find(step => step.handle === 'false') || nextSteps[1];
      if (falseBranch) {
        const nextNode = this.nodes.find(n => n.id === falseBranch.targetId);
        if (nextNode) this.executeNode(nextNode);
      }
    }
  }
  moveToNextNodes(currentNodeId) {
    const nextSteps = this.adjacencyList[currentNodeId] || [];
    
    nextSteps.forEach(step => {
      if (step.handle === 'true' || step.handle === 'false') return;

      const nextNode = this.nodes.find(n => n.id === step.targetId);
      if (nextNode) {
        this.executeNode(nextNode);
      }
    });
  }

  evaluateExpression(input) {
    if (input === undefined || input === null) return 0;
    
    const trimmed = String(input).trim();
    const num = Number(trimmed);

    if (!isNaN(num)) {
      return num;
    }

    if (this.memory.hasOwnProperty(trimmed)) {
      return this.memory[trimmed];
    }

    this.log(`Предупреждение: Переменная '${trimmed}' не найдена, используется 0`);
    return 0;
  }

  log(message) {
    this.outputLog.push(message);
    console.log("[Interpreter]", message);
  }
}

export function runCode(nodes, edges) {
  const interpreter = new Interpreter(nodes, edges);
  return interpreter.run();
}