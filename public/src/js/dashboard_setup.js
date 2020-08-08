// const cancel = document.querySelector('.cancel'),
//     logout = document.querySelector('.logout'),
   const logoutPrompt = document.querySelector('.prompt');
   const reminder = document.querySelector('.reminder')

    window.addEventListener('click', (e)=>{
        console.log(e.target)
        if(e.target.id === 'logout'){
            logoutPrompt.classList.toggle('hide');
        }else if(e.target.className === 'cancel'){
            logoutPrompt.classList.toggle('hide');
        }else if(e.target.className === 'cancel-reminder'){
            reminder.style.display = 'none'
        }
    });
    setTimeout(() => {
        reminder.style.display = 'none'
    }, 20000);
// const date = new Date();
// console.log(date.getTime())