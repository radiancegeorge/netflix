// const cancel = document.querySelector('.cancel'),
//     logout = document.querySelector('.logout'),
   const logoutPrompt = document.querySelector('.prompt');

    window.addEventListener('click', (e)=>{
        if(e.target.id === 'logout'){
            logoutPrompt.classList.toggle('hide');
        }else if(e.target.className === 'cancel'){
            logoutPrompt.classList.toggle('hide');
        }
    })
const date = new Date();
console.log(date.getTime())