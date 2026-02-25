//оператор

import { Expression } from './Expression.js';

export class OperationExpr extends Expression {
    evaluate() {
        const leftContainer = this.find('.op-left');
        const rightContainer = this.find('.op-right');
        const operator = this.getValue('.operator');
        
        if (!leftContainer.firstChild || !rightContainer.firstChild) {
            throw new Error('Не заполнены операнды в операции');
        }
        
        const leftValue = this.interpreter.evaluateExpression(leftContainer.firstChild);
        const rightValue = this.interpreter.evaluateExpression(rightContainer.firstChild);
        
        return this.interpreter.calculateOperation(leftValue, rightValue, operator);
    }
}