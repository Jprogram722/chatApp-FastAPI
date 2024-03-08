import axios from "axios";

(() => {

    let networks = ["http://localhost"];

    let form = document.querySelector("#login-form");

    const displayError = (errContianer, errMsg) => {
        errContianer.style.display = "block";
                errContianer.textContent = errMsg;
                setTimeout(() => {
                    errContianer.style.display = "none";
                    errContianer.textContent = errMsg;
                }, 5000);
    }

    const passToAPI = async (user_input) => {
        try{
            let res = await axios.post(`${networks[0]}:8080/login/`, user_input);
            return res
        }
        catch(err){
            return {"users": null, "status": "error"};
        }
    }

    const submitLogin = async (e) => {
        e.preventDefault();
        
        let username = document.querySelector("#username").value;
        let password = document.querySelector("#password").value;
        const errMsg = document.querySelector(".err-msg");

        let user_input = {"username": username, "password": password};

        try{
            let { data } = await passToAPI(user_input);
            if(data.status === "success"){
                localStorage.setItem("Username", data.username);
                window.location.replace(`${networks[0]}:5000`);
            }
            else{
                console.log(data)
                displayError(errMsg, "Check Username And Password");
            }
        }
        catch(err){
            console.log(err);
            displayError(errMsg, "Could not connect to database")
        }
    }

    form.addEventListener('submit', submitLogin);

})()