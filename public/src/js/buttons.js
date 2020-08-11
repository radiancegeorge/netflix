const allButtons = document.querySelectorAll('button');

console.log(allButtons);

allButtons.forEach(button =>{
    button.addEventListener('click', ()=>{

        setTimeout(() => {
            button.disabled = true;
        }, 500);

    })
})