// выражение в скобках 

import { Expression } from './Expression.js';

export class ParenthesesExpr extends Expression {
    evaluate() {
        const contentContainer = this.find('.paren-content');
        
        const contentBlock = contentContainer.firstChild;
        
        if (!contentBlock) {
            throw new Error('Пустые скобки');
        }
        
        return this.interpreter.evaluateExpression(contentBlock);
    }
}