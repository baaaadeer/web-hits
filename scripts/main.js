document.addEventListener('DOMContentLoaded', () => {
    const workBlock = document.querySelector('.Work-Block');
    const paletteBlocks = document.querySelectorAll('.Blocks-Area .block');

    // счётчик для уникальных ID
    let blockCounter = 0;

    // функция создания нового перетаскиваемого блока
    function createDraggableBlock(text) {
        const block = document.createElement('div');
        block.className = 'block instance';
        block.textContent = text;
        block.id = `block-${blockCounter++}`;

        const workRect = workBlock.getBoundingClientRect();
        // максимальные координаты, чтобы блок не уходил за края
        const maxLeft = workRect.width - 170;
        const maxTop = workRect.height - 100;
        const left = 10 + Math.random() * Math.max(0, maxLeft - 20);
        const top = 10 + Math.random() * Math.max(0, maxTop - 20);

        block.style.left = left + 'px';
        block.style.top = top + 'px';
        workBlock.appendChild(block);

        interact(block).draggable({
            inertia: false,

            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: false
                })
            ],

            listeners: {
                move(event) {
                    const target = event.target;
                    let x = (parseFloat(target.style.left) || 0) + event.dx;
                    let y = (parseFloat(target.style.top) || 0) + event.dy;

                    target.style.left = x + 'px';
                    target.style.top = y + 'px';
                }
            }
        });
    }

    paletteBlocks.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent.trim();
            createDraggableBlock(text);
        });
    });
});