//ссылка на переменную

import { Expression } from './Expression.js';

export class VariableRefExpr extends Expression {
    evaluate() {
        const varName = this.getValue('.var-ref-name');
        
        if (!varName) {
            throw new Error('Не указано имя переменной');
        }
        
        return this.interpreter.getVariable(varName);
    }
}