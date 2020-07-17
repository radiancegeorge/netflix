const inputs = document.querySelectorAll('form input');
const submitBtn = document.querySelector('form button');
const form = document.querySelector('form')
console.log(form)
// console.log(inputs[0].name)



submitBtn.addEventListener('click', (e)=>{
    // e.preventDefault();

    // alert('clicked')
    let determinant = {
        value: 0
    }

    const check = (property, value)=>{
        const verify = new XMLHttpRequest();
        verify.onreadystatechange = ()=>{
            if(verify.status === 200 && verify.readyState === 4){
                determinant.value++;
                // console.log(determinant.value)
            }else if(verify.status === 409){
                console.log(value);
                e.preventDefault()
                return false
            }
        }
        verify.open('get',`http://localhost:3000/validate/${property}/${value}`, true);
        verify.send()
    }

    inputs.forEach( input =>{
        if(input.value.trim() !== ''){
            if(input.name === 'email' || input.name === 'username' || input.name === 'phone_number'){
                if(input.name === 'phone_number'){
                    input.value = input.value.substr(1);
                    check(input.name, input.value);
                }else{
                    check(input.name, input.value);
                }
                
                
            }else if(input.name === 'retype_password'){
                inputs.forEach(element => {
                    if(element.name === 'password'){
                        if(element.value === input.value){
                            console.log('same');
                            // determinant.value++
                        }else{
                            //pass a message of passwords not being the same
                        }
                    }
                });
            }else{
                // determinant.value++;
            }
           if(determinant.value >= 6){
                form.submit()
           }
        }else if(input.name === 'referred'){
            input.value = null;
        }else{
            //pass a message of an empty string
            e.preventDefault()
        }
    })

})