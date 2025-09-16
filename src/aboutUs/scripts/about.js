document.getElementById("today-button").addEventListener("click",async function () {

    console.log("Today button clicked");
    localStorage.setItem("currentDate",new Date());
    window.location.href = '../dashboard/dashboard.html';
    
})