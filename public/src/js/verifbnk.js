const accNumInput = document.querySelector('#account_number'),
bankNameInput = document.querySelector('#bank_name'),
btn = document.querySelector('.btn'),
animationContainer = document.querySelector('.account_name'), 
animation = document.querySelector('.animation');



const writeToField = (p, name)=>{
    name === undefined && (name = '');
    document.querySelector('.account_name p').textContent = p;
    document.querySelector('.account_name h2').textContent = name;
    name === '' ? document.querySelector('.account_name p').style.color = 'red' : document.querySelector('.account_name p').style.color = ''
}  







const check = (property, value)=>{
    console.log('now making request')
    const xml = new XMLHttpRequest();
    xml.onreadystatechange = ()=>{
        console.log(xml.status)
        if(xml.readyState === 4 && xml.status === 200){
           
            bankNameInput.addEventListener('focusout', (e) => {
                const revealName = new XMLHttpRequest();
                revealName.onreadystatechange = () => {
                    // console.log(revealName.status)
                    if (revealName.readyState === 4 && revealName.status === 201) {
                        // console.log(revealName.response)
                        btn.style.backgroundColor = 'green';
                        writeToField('Welcome', revealName.response )
                        animation.style.opacity = 0;

                        btn.addEventListener('click', (e) => {
                            document.location.replace('/bank/update_bank_details')
                        })
                    }
                }
                console.log(accNumInput.value, e.target.value)
                revealName.open('get', `/bank/user/${accNumInput.value}/${e.target.value}`, true);
                revealName.responseType = 'text'
                revealName.send()
            })

        }else if(xml.status === 409){
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
            btn.style.backgroundColor = '';
            animation.style.opacity = 0
            writeToField('Account number already in use');
        }
    }
    xml.open('get', `/validate/${property}/${value}`, true);
    xml.send()
}




accNumInput.addEventListener('focusout', (e)=>{
    if(e.target.value.length > 5){
        animation.style.opacity = 1
        check('account_number', e.target.value)
    }
})
// accNumInput.removeEventListener('keyup',()=>{
//     alert('removed')
// })