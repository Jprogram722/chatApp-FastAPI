import axios from "axios";

(() => {

    let networks = ["localhost"];

    const logout = () => {
        // clear the localstorage
        localStorage.clear();
        // reload the page
        window.location.reload();
    }

    /**
     * This function gets stored messages and displays them to the dom
     * @param {Element} chatForm 
     */
    const StoredMessages = async () => {
        let messageList = document.querySelector("#messages");

        // get the stored messages
        let res = await axios.get(`http://${networks[0]}:8080/get-messages/`);

        console.log(localStorage.getItem('Username'));

        // loop through the array of messages
        for(let message of res.data){
            let messageContainer = document.createElement('li');
            messageContainer.classList.add("message");
            let content = document.createTextNode(`${message.user}: ${message.message}`);
            messageContainer.appendChild(content);
            messageList.appendChild(messageContainer);
        }
    }

    const getUserImg = async (username) => {

        const { data } = await axios.get(`http://${networks[0]}:8080/get-image/${username}`);

        // get the image container 
        const imgContainer = document.querySelector("#img-container");

        // create img tag
        let img = document.createElement('img');
        // get img source
        img.src = data.image;
        // specify an alt for the image
        img.alt = "img";
        // append to the image to the container
        imgContainer.appendChild(img);
    }


    const submitUserImg = async (event) => {
        // stop page from reloading
        event.preventDefault();
        
        // init a form data object
        const formData = new FormData();

        // get the container that holds the value of the image
        const img = document.querySelector("#img-data");

        // put the image info into the form data
        formData.append(
            "image", // content type
            img.files[0], // file
            img.files[0].name, // file name
            {'type': 'multipart/form-data'} // request headers
        );


        try{
            // sends the image to the sever
            const res = await axios.post(
                `http://${networks[0]}:8080/select-image/${localStorage.getItem("Username")}`,
                formData,
            );

            // prints the response to the console
            console.log(res.data);

            // refreshes the page
            window.location.reload();
        }
        catch(err){
            console.log(err);
        }

    }

    // get the sections on the index page
    const notLoggedIn = document.querySelector("#not-logged-in");
    const loggedIn = document.querySelector("#is-logged-in");

    // check and see if there is a username in the localstorage
    if(localStorage.getItem("Username")){
        // make the app page visable
        notLoggedIn.style.display = "none";
        loggedIn.style.display = "block";

        // get the chat form
        const chatForm = document.querySelector("#chat-form");
        // grab the logout button from the dom
        const logoutBtn = document.querySelector("#logout-btn");
        // grab the the image form
        const imgForm = document.querySelector("#img-form");

        // attach the logout function to the logout button
        logoutBtn.addEventListener('click', logout);
        // attach the submit form function to the img form
        imgForm.addEventListener('submit', submitUserImg);

        // get the users image and the messages sent to the chat
        getUserImg(localStorage.getItem("Username"));
        StoredMessages();

        // create the websocket
        let ws = new WebSocket(`ws://${networks[0]}:8080/ws/${localStorage.getItem("Username")}`);

        // when we recieve data from socket
        ws.onmessage = (event) => {
            let messageList = document.querySelector("#messages");
            let message = document.createElement("li");
            message.classList.add("message");
            let content = document.createTextNode(event.data);
            message.appendChild(content);
            messageList.appendChild(message);
        }

        // sending data to the websocket
        const sendMessage = async (event) => {
            event.preventDefault();
            let input = document.querySelector(".input-box");
            await axios.post(`http://${networks[0]}:8080/send-message/`, {
                "from_user": localStorage.getItem("Username"),
                "message_content": input.value
            });
            ws.send(input.value);
            input.value = "";
        }

        chatForm.addEventListener('submit', sendMessage);
    }
    else{
        // make the main page visable
        notLoggedIn.style.display = "block";
        loggedIn.style.display = "none";
    }
})()