document.head.insertAdjacentHTML('beforeend',`<style>${HWF.CSS}</style>`);
document.querySelectorAll('[data-hw]').forEach(el=>{el.classList.add('hw-slot');el.innerHTML=HWF.char(JSON.parse(el.dataset.hw))});
