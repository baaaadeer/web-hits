// базовый класс для наследования 

export class Expression {
    constructor(domElement, interpreter) {
        this.element = domElement;
        this.interpreter = interpreter;
    }

    evaluate() {
        throw new Error('Метод evaluate должен быть реализован в наследнике');
    }

    find(selector) {
        return this.element.querySelector(selector);
    }

    getValue(selector) {
        const el = this.find(selector);
        return el ? el.value.trim() : '';
    }
}