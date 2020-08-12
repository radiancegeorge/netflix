const reciveHolder = document.querySelector('.receiveRemains span');
// alert(reciveHolder)



const xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = ()=>{
    if(xhttp.readyState === 4 && xhttp.status === 200){
        const lastDate = new Date(xhttp.response.data).getTime();
        console.log(new Date(lastDate));
        setInterval(() => {
            const difference = new Date().getTime() - lastDate;
            const hours = 60000 * 60 * 77;
            const remains = hours - difference;
            const newDate = new Date(remains);
            const toString = `${newDate.getDate() - 1}d ${newDate.getHours()}h : ${newDate.getMinutes()}m : ${newDate.getSeconds()}s`;
            reciveHolder.textContent = toString
        }, 1000);
    }
};

xhttp.open('get', '/user/lastDate', true);
xhttp.responseType = 'json';
xhttp.send()