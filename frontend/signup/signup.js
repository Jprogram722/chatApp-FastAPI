import axios from "axios";

(() => {

    let networks = ["http://localhost"];

    let form = document.querySelector("#signup-form");

    const displayError = (errContianer, errMsg) => {
        errContianer.style.display = "block";
                errContianer.textContent = "Your username is already taken";
                setTimeout(() => {
                    errContianer.style.display = "none";
                    errContianer.textContent = errMsg;
                }, 5000);
    }

    const passToAPI = async (username, password) => {
        try{
            let res = await axios.post(`${networks[2]}:8080/signup/`, {"username":username, "password": password});
            return res;
        }
        catch(err){
            return null;
        }
    }

    const submitSignup = async (e) => {
        e.preventDefault();
        
        let username = document.querySelector("#username").value;
        let password = document.querySelector("#password").value;
        let errMsg = document.querySelector(".err-msg");

        if(password.length < 8){
            displayError(errMsg, "Your password is not long enough");
        }
        else{

            let res = await passToAPI(username, password);

            let data = res.data

            console.log(data);
            
            if(data.status === "success"){
                window.location.replace(`${networks[0]}:5000`);
            }
            else{
                displayError(errMsg, "Your username is already taken");
            }
        }
    }

    form.addEventListener('submit', submitSignup);

})()