const inputs = document.querySelectorAll('form input');
const submitBtn = document.querySelector('form button');
const formD = document.querySelector('form')
// console.log(form)
// console.log(inputs[0].name)
const submit = () => {
        formD.submit()  
}
const errorMessage = (input, custom)=>{
    const p = document.createElement('p');
    p.innerText = custom || `There is an error in ${input} field,
    It is already in use.
    `;
    p.style.position = 'fixed';
    p.style.top = 0;
    p.style.opacity = 1;
    p.style.left = '50%'
    p.style.transform = 'translateX(-50%)';
    p.style.backgroundColor = 'orange';
    p.style.padding = '20px';
    p.style.margin = 0;
    p.style.textAlign = 'center';
    p.style.transition = '0.7s'
    document.body.appendChild(p)
    setTimeout(() => {
        p.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(p)
        }, 1000);
    }, 3000);
}

submitBtn.addEventListener('click', (e)=>{
    e.preventDefault();

    // alert('clicked')
    let determinant = {
        value: 0
    }

    const check = (property, value, optional)=>{
        if(property === 'username'){
            const expression = /[-!@#$%^&* /(),.? ":{}|<>]/g;
            
            if (!expression.test(value)){
                const verify = new XMLHttpRequest();
                verify.onreadystatechange = ()=>{
                    if(verify.status === 200 && verify.readyState === 4){
                        determinant.value++;
                        console.log('async ' + determinant.value)
                        if (determinant.value === 7) {
                            submit()
                        }
                    }else if(verify.status === 409){
                        console.log(value);
                        optional.preventDefault()
                        determinant.value--
                        errorMessage(property)
                    }
                }
                verify.open('get',`http://localhost:3000/validate/${property}/${value}`, true);
                verify.send()
            }else{
                //found unwanted characters, find a way to notify them
                // const usernameInput = document.getElementsByName('username');
                const msg = `There are unwanted characters in the ${property} input field`
                errorMessage(property, msg)
            }
        }else{
            //not username so proceed as norm;
            const verify = new XMLHttpRequest();
            verify.onreadystatechange = () => {
                if (verify.status === 200 && verify.readyState === 4) {
                    determinant.value++;
                    console.log('async ' + determinant.value)
                    if (determinant.value === 7) {
                        submit()
                    }
                } else if (verify.status === 409) {
                    console.log(value);
                    optional.preventDefault()
                    determinant.value--
                    errorMessage(property)
                }
            }
            verify.open('get', `http://localhost:3000/validate/${property}/${value}`, true);
            verify.send()
        }

    }
        

    inputs.forEach( input =>{
        if(input.value.trim() !== ''){
            if(input.name === 'email' || input.name === 'username' || input.name === 'phone_number'){  
                    check(input.name, input.value, e); 

            }else if(input.name === 'retype_password'){
                inputs.forEach(element => {
                    if(element.name === 'password'){
                        if(element.value === input.value){
                            console.log('same');
                            determinant.value++;
                            
                        }else{
                            //pass a message of passwords not being the same
                        }
                    }
                });
            }else{
                determinant.value++;
            }
        }else if(input.name === 'referred'){
            determinant.value++;
            console.log(determinant.value)

        }else{
            //pass a message of an empty string

        }
    })

})

