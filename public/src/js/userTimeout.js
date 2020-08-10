// const { get } = require("../../../routes/dashboard_users/user_dashboard");
const accountDetails = [
    // {
    //     accountName: 'NWIGWE LOVETH IFEOMA',
    //     bankName: 'GTB',
    //     accountNumber: '0238976033',
    //     phoneNumber: '09069274075'
    // }
    {
        accountName: 'EKEH MUNACHIMSO C',
        bankName: 'GTB',
        accountNumber: '0590264940',
        phoneNumber: '08023712471'
    }
];

const num = Math.floor(Math.random() * accountDetails.length);
const pushDetails = ()=>{
    document.querySelector('.bankName span').innerText = accountDetails[num].bankName
    document.querySelector('.accountName span').innerText = accountDetails[num].accountName
    document.querySelector('.phoneNumber span').innerText = accountDetails[num].phoneNumber
    document.querySelector('.accountNumber span').innerText = accountDetails[num].accountNumber
}

pushDetails()

const timer = document.querySelector('.activation .timer span');
// alert('hello dear')/
const timeout = ()=>{
    const getHour = new XMLHttpRequest();
    getHour.onreadystatechange = () => {
        // alert(getHour.readyState)
        if (getHour.readyState === 4 && getHour.status === 200) {
            const response = getHour.response.timeout;
            const dateCreated = new Date(response)
           
            setInterval(() => {
                const CurrentDate = new Date();
                const elapsed = CurrentDate - dateCreated;
                const _24hrs = 100800000;
                const timeLeft = _24hrs - elapsed;
                const newTime = new Date(timeLeft);
                if(newTime.getTime() <= 0){
                    document.querySelector('.message').textContent = 'Your Account Has been deactivated, please pay the following amount below to have your Account Activated';
                    document.querySelector('.amount'). textContent = 2000;
                }else{
                    timer.textContent = `${newTime.getHours()} : ${newTime.getMinutes()} : ${newTime.getSeconds()}`
                }
            }, 1000);
        }
    };
    getHour.open('get', '/user/timer', true);
    getHour.responseType = 'json'
    getHour.send();
};
timeout()
