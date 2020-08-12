const timeHolder = document.querySelectorAll('.found .time span')


const xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = ()=>{
    // alert(xhttp.readyState)
    if(xhttp.readyState === 4 && xhttp.status === 200){
        const data = xhttp.response;
        data.forEach(element => {
            const time = element.time;
            // console.log(time)
            setInterval(() => {
                const currentTime = Date.now();
                const TimeMerged = new Date(time).getTime();
                const elapsed = currentTime - TimeMerged;
                const hourToUse = 61200000;
                const remaining = hourToUse - elapsed;
                const newTime = new Date(remaining);
                const timeToString = `${newTime.getHours() - 1} : ${newTime.getMinutes()} : ${newTime.getSeconds()}`;
                timeHolder[data.indexOf(element)].innerText = timeToString;
                // console.log(new Date(remaining).getHours())
            }, 1000);
        });
    }
}
xhttp.open('get', '/user/timeout', true);
xhttp.responseType = 'json';
xhttp.send()
