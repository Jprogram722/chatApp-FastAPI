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

    // get the sections on the index page
    const notLoggedIn = document.querySelector("#not-logged-in");
    const loggedIn = document.querySelector("#is-logged-in");

    // check and see if there is a username in the localstorage
    if(localStorage.getItem("Username")){
        // make the app page visable
        notLoggedIn.style.display = "none";
        loggedIn.style.display = "block";

        // grab the logout button from the dom
        const logoutBtn = document.querySelector("#logout-btn");

        // attach the logout function to the logout button
        logoutBtn.addEventListener( 'click', logout);

        // get the 
        let chatForm = document.querySelector("#chat-form");

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