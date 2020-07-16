const accNumInput = document.querySelector('#account_number'),
bankNameInput = document.querySelector('#bank_name'),
btn = document.querySelector('.btn'),
animationContainer = document.querySelector('.account_name'), 
animation = document.querySelector('.animation');



     







const check = (property, value)=>{
    console.log('now making request')
    const xml = new XMLHttpRequest();
    xml.onreadystatechange = ()=>{
        console.log(xml.status)
        if(xml.readyState === 4 && xml.status === 200){
           
            bankNameInput.addEventListener('change', (e) => {
                const revealName = new XMLHttpRequest();
                revealName.onreadystatechange = () => {
                    console.log(revealName.status)
                    if (revealName.readyState === 4 && revealName.status === 201) {
                        btn.style.backgroundColor = 'green'
                        btn.addEventListener('click', (e) => {
                            document.location.replace('/bank/update_bank_details')
                        })
                    }
                }
                console.log(accNumInput.value, e.target.value)
                revealName.open('get', `/bank/user/${accNumInput.value}/${e.target.value}`, true);
                revealName.send()
            })

        }else{
            // console.log('found duplicate')
            // get the user to know that the account number is already in use;
            btn.removeEventListener('click', ()=>{
                console.log('removed')
            });
            bankNameInput.removeEventListener('change',()=>{
                console.log('removed')
            });
            accNumInput.removeEventListener('focusout', ()=>{
                alert('yeah')
            })
            btn.style.backgroundColor = ''
        }
    }
    xml.open('get', `/validate/${property}/${value}`, true);
    xml.send()
}




accNumInput.addEventListener('focusout', (e)=>{
    if(e.target.value.length > 5){
        check('account_number', e.target.value)
    }
})
// accNumInput.removeEventListener('keyup',()=>{
//     alert('removed')
// })