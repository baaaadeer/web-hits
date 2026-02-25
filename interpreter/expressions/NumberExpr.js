// число

import { Expression } from './Expression.js';

export class NumberExpr extends Expression {
    evaluate() {
        const value = this.getValue('.number-value');
        const num = parseInt(value);
        
        if (isNaN(num)) {
            throw new Error(`Некорректное числовое значение: "${value}"`);
        }
        
        return num;
    }
}