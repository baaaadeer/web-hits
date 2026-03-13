export class Interpreter {
  constructor(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.memory = {};
    this.outputLog = [];
    this.adjacencyList = {};
    this.totalIterations = 0;
    this.maxTotalIterations = 10000;
  }

  run() {
    this.outputLog = [];
    this.memory = {};
    this.totalIterations = 0;
    this.buildGraph();

    const startNodes = this.findStartNodes();
    const visited = new Set();

    startNodes.forEach(node => {
      this.executeNode(node, visited);
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

  executeNode(node, visited = new Set()) {
    this.totalIterations++;
    if (this.totalIterations > this.maxTotalIterations) {
      throw new Error("Зацикливание обнаружено");
    }

    if (visited.has(node.id)) {
      return;
    }
    visited.add(node.id);

    const type = node.type;
    const data = node.data?.parameters || {};

    switch (type) {
      case 'variable':
        this.handleVariable(data);
        this.moveToNextNode(node.id, visited);
        break;
      case 'assign':
        this.handleAssign(data);
        this.moveToNextNode(node.id, visited);
        break;
      case 'operatorIf':
        this.handleIf(node, data, visited);
        break;
      case 'whileBl':
        this.handleWhile(node, data, visited);
        break;
      case 'forBl':
        this.handleFor(node, data, visited);
        break;
      case 'array':
        this.handleArray(data);
        this.moveToNextNode(node.id, visited);
        break;
      case 'cout':
        this.handleCout(data);
        this.moveToNextNode(node.id, visited);
        break;
      case 'arifmetic':
        this.handleArithmetic(node, data);
        break;
      default:
        this.moveToNextNode(node.id, visited);
    }
  }

  handleVariable(data) {
    const name = data.name;
    if (!name) throw new Error("Имя переменной не указано");
    this.memory[name] = 0;
  }

  handleAssign(data) {
    const target = data.target;
    const valueRaw = data.value;

    if (!target) throw new Error("Целевая переменная не указана");

    const value = this.evaluateExpression(valueRaw);

    const arrayAccessMatch = target.match(/^([a-zA-Z_]\w*)\[(.+)\]$/);
    if (arrayAccessMatch) {
      const arrayName = arrayAccessMatch[1];
      const indexExpr = arrayAccessMatch[2];
      const index = this.evaluateExpression(indexExpr);

      if (!this.memory.hasOwnProperty(arrayName)) {
        throw new Error(`Массив '${arrayName}' не найден`);
      }

      const array = this.memory[arrayName];
      if (!Array.isArray(array)) {
        throw new Error(`'${arrayName}' не является массивом`);
      }

      array[index] = value;
      return;
    }

    this.memory[target] = value;
  }

  handleIf(node, data, visited) {
    const expression = data.expression || '';
    const conditionMet = this.evaluateCondition(expression);

    const nextSteps = this.adjacencyList[node.id] || [];

    if (conditionMet) {
      const trueBranch = nextSteps.find(step => step.handle === 'true');
      if (trueBranch) {
        const nextNode = this.nodes.find(n => n.id === trueBranch.targetId);
        if (nextNode) this.executeNode(nextNode, visited);
      }
    } else {
      const falseBranch = nextSteps.find(step => step.handle === 'false');
      if (falseBranch) {
        const nextNode = this.nodes.find(n => n.id === falseBranch.targetId);
        if (nextNode) this.executeNode(nextNode, visited);
      }
    }
  }

  handleWhile(node, data, visited) {
    const condition = data.condition || '';
    const maxIterations = 1000;
    let iterations = 0;

    const nextSteps = this.adjacencyList[node.id] || [];
    const bodyStep = nextSteps.find(step => step.handle === 'body');
    const exitStep = nextSteps.find(step => step.handle === 'exit');

    const bodyNode = bodyStep ? this.nodes.find(n => n.id === bodyStep.targetId) : null;
    const exitNode = exitStep ? this.nodes.find(n => n.id === exitStep.targetId) : null;

    const bodyNodes = [];
    if (bodyNode) {
      this.collectBodyNodes(bodyNode, node.id, bodyNodes);
    }

    while (this.evaluateCondition(condition) && iterations < maxIterations) {
      iterations++;

      bodyNodes.forEach(bodyN => {
        this.executeNode(bodyN, visited);
      });

      bodyNodes.forEach(n => visited.delete(n.id));
    }

    if (exitNode) {
      this.executeNode(exitNode, visited);
    }
  }

  collectBodyNodes(node, whileNodeId, bodyNodes) {
    if (!node || node.id === whileNodeId) return;

    bodyNodes.push(node);

    const nextSteps = this.adjacencyList[node.id] || [];

    for (const step of nextSteps) {
      if (step.handle === 'true' || step.handle === 'false') continue;
      if (step.handle === 'body' || step.handle === 'exit') continue;
      if (step.targetId === whileNodeId) continue;

      const nextNode = this.nodes.find(n => n.id === step.targetId);
      if (nextNode && !bodyNodes.includes(nextNode)) {
        this.collectBodyNodes(nextNode, whileNodeId, bodyNodes);
        break;
      }
    }
  }

  handleFor(node, data, visited) {
    const variableInit = data.variable || 'i=0';
    const endCondition = data.endCondition || 'i<10';
    const step = data.step || 'i+=1';
    const maxIterations = 1000;
    let iterations = 0;

    const [varNameRaw, initValueRaw] = variableInit.split('=');
    const varName = varNameRaw?.trim() || 'i';
    const initValue = this.evaluateExpression(initValueRaw?.trim() || '0');
    this.memory[varName] = initValue;

    const nextSteps = this.adjacencyList[node.id] || [];
    const bodyStep = nextSteps.find(s => s.handle === 'default' || !s.handle || s.handle === 'body');
    const bodyNode = bodyStep ? this.nodes.find(n => n.id === bodyStep.targetId) : null;

    const exitStep = nextSteps.find(s => s.handle === 'exit');
    const exitNode = exitStep ? this.nodes.find(n => n.id === exitStep.targetId) : null;

    while (this.evaluateCondition(endCondition) && iterations < maxIterations) {
      iterations++;

      const iterationVisited = new Set();
      iterationVisited.add(node.id);

      if (bodyNode) {
        this.executeNodeInFor(bodyNode, node.id, iterationVisited);
      }

      this.executeStep(step);
    }

    if (exitNode) {
      this.executeNode(exitNode, visited);
    }
  }

  executeNodeInFor(node, forNodeId, iterationVisited) {
    if (!node) return;
    
    // Если это узел for цикла, просто возвращаемся (цикл управляется handleFor)
    if (node.id === forNodeId) return;
    
    // Не проверяем visited для узла цикла - разрешаем повторное посещение
    if (iterationVisited.has(node.id) && node.type !== 'forBl') return;

    iterationVisited.add(node.id);

    const type = node.type;
    const data = node.data?.parameters || {};

    switch (type) {
      case 'variable':
        this.handleVariable(data);
        this.executeNextInFor(node.id, forNodeId, iterationVisited);
        break;
      case 'assign':
        this.handleAssign(data);
        this.executeNextInFor(node.id, forNodeId, iterationVisited);
        break;
      case 'operatorIf':
        this.handleIfInFor(node, data, forNodeId, iterationVisited);
        break;
      case 'whileBl':
        this.handleWhile(node, data, iterationVisited);
        break;
      case 'forBl':
        this.handleFor(node, data, iterationVisited);
        break;
      case 'array':
        this.handleArray(data);
        this.executeNextInFor(node.id, forNodeId, iterationVisited);
        break;
      case 'cout':
        this.handleCout(data);
        this.executeNextInFor(node.id, forNodeId, iterationVisited);
        break;
      case 'arifmetic':
        this.handleArithmetic(node, data);
        break;
      default:
        this.executeNextInFor(node.id, forNodeId, iterationVisited);
    }
  }

  executeNextInFor(currentNodeId, forNodeId, iterationVisited) {
    const nextSteps = this.adjacencyList[currentNodeId] || [];

    for (const step of nextSteps) {
      // Разрешаем возврат к узлу цикла (для замыкания цикла внутри тела)
      if (step.handle === 'exit') continue;

      const nextNode = this.nodes.find(n => n.id === step.targetId);
      if (nextNode && !iterationVisited.has(nextNode.id)) {
        this.executeNodeInFor(nextNode, forNodeId, iterationVisited);
        break;
      }
    }
  }

  handleIfInFor(node, data, forNodeId, iterationVisited) {
    const expression = data.expression || '';
    const conditionMet = this.evaluateCondition(expression);

    const nextSteps = this.adjacencyList[node.id] || [];

    if (conditionMet) {
      const trueBranch = nextSteps.find(step => step.handle === 'true');
      if (trueBranch) {
        const nextNode = this.nodes.find(n => n.id === trueBranch.targetId);
        if (nextNode) this.executeNodeInFor(nextNode, forNodeId, iterationVisited);
      }
    } else {
      const falseBranch = nextSteps.find(step => step.handle === 'false');
      if (falseBranch) {
        const nextNode = this.nodes.find(n => n.id === falseBranch.targetId);
        if (nextNode) this.executeNodeInFor(nextNode, forNodeId, iterationVisited);
      }
    }
  }

  handleArray(data) {
    const name = data.name;
    const elementsRaw = data.elements || '';

    if (!name) throw new Error("Имя массива не указано");

    const elements = elementsRaw
      .split(/[,\s]+/)
      .filter(el => el.trim() !== '')
      .map(el => this.evaluateExpression(el.trim()));

    this.memory[name] = elements;
  }

  handleCout(data) {
    const target = data.target;

    if (!target) return;

    const value = this.evaluateExpression(target);
    this.log(`${value}`);
  }

  handleArithmetic(node, data) {
    const operation = data.operation || '';
    const result = this.evaluateArithmeticExpression(operation);

    const nextSteps = this.adjacencyList[node.id] || [];
    const nextStep = nextSteps.find(s => s.handle === 'default' || !s.handle);
    if (nextStep) {
      const nextNode = this.nodes.find(n => n.id === nextStep.targetId);
      if (nextNode && nextNode.data?.parameters) {
        const target = nextNode.data.parameters.target;
        if (target) {
          this.memory[target] = result;
        }
      }
    }
  }

  evaluateCondition(condition) {
    if (!condition || condition.trim() === '') return false;

    const operators = ['>=', '<=', '==', '!=', '>', '<'];
    for (const op of operators) {
      const index = condition.indexOf(op);
      if (index !== -1) {
        const leftExpr = condition.substring(0, index).trim();
        const rightExpr = condition.substring(index + op.length).trim();

        const left = this.evaluateArithmeticExpression(leftExpr);
        const right = this.evaluateArithmeticExpression(rightExpr);

        switch (op) {
          case '>=': return left >= right;
          case '<=': return left <= right;
          case '==': return left == right;
          case '!=': return left != right;
          case '>': return left > right;
          case '<': return left < right;
        }
      }
    }

    const value = this.evaluateArithmeticExpression(condition);
    return !!value;
  }

  executeStep(step) {
    if (!step || step.trim() === '') return;

    const operators = ['+=', '-=', '*=', '/=', '='];
    for (const op of operators) {
      const parts = step.split(op);
      if (parts.length === 2) {
        const varName = parts[0].trim();
        const currentValue = this.memory[varName] || 0;
        const stepValue = this.evaluateExpression(parts[1].trim());

        switch (op) {
          case '+=':
            this.memory[varName] = currentValue + stepValue;
            break;
          case '-=':
            this.memory[varName] = currentValue - stepValue;
            break;
          case '*=':
            this.memory[varName] = currentValue * stepValue;
            break;
          case '/=':
            this.memory[varName] = currentValue / stepValue;
            break;
          case '=':
            this.memory[varName] = stepValue;
            break;
        }
        return;
      }
    }
  }

  evaluateArithmeticExpression(expression) {
    if (!expression || expression.trim() === '') return 0;

    const expr = expression.trim();

    const arrayAccessMatch = expr.match(/^([a-zA-Z_]\w*)\[(.+)\]$/);
    if (arrayAccessMatch) {
      return this.evaluateExpression(expr);
    }
    if (/^[a-zA-Z_]\w*$/.test(expr)) {
      return this.evaluateExpression(expr);
    }
    if (/^-?\d+(\.\d+)?$/.test(expr)) {
      return Number(expr);
    }

    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const char = expr[i];

      if (char === ' ') {
        i++;
        continue;
      }

      if (char === '+' || char === '-' || char === '*' || char === '/' || char === '(' || char === ')' || char === '[' || char === ']') {
        tokens.push(char);
        i++;
        continue;
      }

      let token = '';
      while (i < expr.length) {
        const c = expr[i];
        if (c === ' ' || c === '+' || c === '-' || c === '*' || c === '/' || c === '(' || c === ')' || c === '[' || c === ']') {
          break;
        }
        token += c;
        i++;
      }
      if (token) {
        tokens.push(token);
      }
    }

    return this.evaluateTokens(tokens);
  }

  evaluateTokens(tokens) {
    if (tokens.length === 0) return 0;

    while (tokens.includes('[')) {
      const openIndex = tokens.lastIndexOf('[');
      let closeIndex = openIndex + 1;
      let depth = 1;

      while (closeIndex < tokens.length && depth > 0) {
        if (tokens[closeIndex] === '[') depth++;
        else if (tokens[closeIndex] === ']') depth--;
        if (depth > 0) closeIndex++;
      }

      if (depth !== 0) {
        throw new Error("Несбалансированные квадратные скобки");
      }

      let arrayNameIndex = openIndex - 1;
      let arrayName = '';
      
      while (arrayNameIndex >= 0 && tokens[arrayNameIndex] !== '[' && tokens[arrayNameIndex] !== ']' && 
             tokens[arrayNameIndex] !== '+' && tokens[arrayNameIndex] !== '-' && 
             tokens[arrayNameIndex] !== '*' && tokens[arrayNameIndex] !== '/') {
        arrayName = tokens[arrayNameIndex] + arrayName;
        arrayNameIndex--;
      }
      arrayName = arrayName.trim();

      const indexTokens = tokens.slice(openIndex + 1, closeIndex);
      const index = this.evaluateTokens([...indexTokens]);

      const arrayStartIndex = arrayNameIndex + 1;
      tokens.splice(arrayStartIndex, closeIndex - arrayStartIndex + 1, this.getArrayValue(arrayName, index));
    }

    while (tokens.includes('(')) {
      const openIndex = tokens.lastIndexOf('(');
      let closeIndex = openIndex + 1;
      let depth = 1;

      while (closeIndex < tokens.length && depth > 0) {
        if (tokens[closeIndex] === '(') depth++;
        else if (tokens[closeIndex] === ')') depth--;
        if (depth > 0) closeIndex++;
      }

      if (depth !== 0) {
        throw new Error("Несбалансированные скобки");
      }

      const innerTokens = tokens.slice(openIndex + 1, closeIndex);
      const innerResult = this.evaluateTokens(innerTokens);
      tokens.splice(openIndex, closeIndex - openIndex + 1, innerResult);
    }

    let i = 0;
    while (i < tokens.length) {
      if (tokens[i] === '*' || tokens[i] === '/') {
        const left = this.getTokenValue(tokens[i - 1]);
        const right = this.getTokenValue(tokens[i + 1]);
        const result = tokens[i] === '*' ? left * right : left / right;
        tokens.splice(i - 1, 3, result);
        i = i - 1;
      } else {
        i++;
      }
    }

    let result = this.getTokenValue(tokens[0]);
    i = 1;
    while (i < tokens.length) {
      const op = tokens[i];
      const right = this.getTokenValue(tokens[i + 1]);
      if (op === '+') {
        result += right;
      } else if (op === '-') {
        result -= right;
      }
      i += 2;
    }

    return result;
  }

  getArrayValue(arrayName, index) {
    if (!this.memory.hasOwnProperty(arrayName)) {
      return 0;
    }

    const array = this.memory[arrayName];
    if (!Array.isArray(array)) {
      return 0;
    }

    const value = array[index];
    return value !== undefined ? value : 0;
  }

  getTokenValue(token) {
    if (typeof token === 'number') {
      return token;
    }
    if (/^-?\d+(\.\d+)?$/.test(token)) {
      return Number(token);
    }
    return this.evaluateExpression(token);
  }

  moveToNextNode(currentNodeId, visited) {
    const nextSteps = this.adjacencyList[currentNodeId] || [];

    for (const step of nextSteps) {
      if (step.handle === 'true' || step.handle === 'false') continue;

      const nextNode = this.nodes.find(n => n.id === step.targetId);
      if (nextNode) {
        this.executeNode(nextNode, visited);
        break;
      }
    }
  }

  evaluateExpression(input) {
    if (input === undefined || input === null) return 0;

    const trimmed = String(input).trim();

    const arrayAccessMatch = trimmed.match(/^([a-zA-Z_]\w*)\[(.+)\]$/);
    if (arrayAccessMatch) {
      const arrayName = arrayAccessMatch[1];
      const indexExpr = arrayAccessMatch[2];
      const index = this.evaluateExpression(indexExpr);

      if (!this.memory.hasOwnProperty(arrayName)) {
        return 0;
      }

      const array = this.memory[arrayName];
      if (!Array.isArray(array)) {
        return 0;
      }

      const value = array[index];
      return value !== undefined ? value : 0;
    }

    const num = Number(trimmed);
    if (!isNaN(num)) {
      return num;
    }

    if (this.memory.hasOwnProperty(trimmed)) {
      return this.memory[trimmed];
    }

    if (trimmed.includes('+') || trimmed.includes('-') || trimmed.includes('*') || trimmed.includes('/')) {
      return this.evaluateArithmeticExpression(trimmed);
    }

    return 0;
  }

  log(message) {
    this.outputLog.push(message);
  }
}

export function runCode(nodes, edges) {
  const interpreter = new Interpreter(nodes, edges);
  return interpreter.run();
}
