export function renderVariable(object){
    if (object.type=="variable") return `
    <label>
        Имя 
        <input data-field="name" value ="${object.parameters.name}">
    </label>
    <label>
        Значение
        <input data-field="name" value ="${object.parameters.value}">
    </label>
    `;

    if (object.type=="operation") return `
    <label>
        Имя
        <input data-field="name" value = "${object.parameters.name}">
    </label>
    `;

    if (object.type=="operatorIf") return `
    <label>
        Имя
        <input data-field="name" value = "${object.parameters.name}">
    </label>
    `;

}


