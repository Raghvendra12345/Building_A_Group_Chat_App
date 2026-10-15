async function handleFormSubmit(event) {
  try {
    event.preventDefault();

    const identifier = event.target.identifier.value;

    const password = event.target.password.value;

    const loginDetail = { identifier, password };
    console.log(loginDetail);

    const response = await fetch("http://localhost:4700/chat/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginDetail),
    });
    const data = await response.json();

    

    if (response.ok && data.success) {

      console.log("Login response:", data);
    console.log("Email from response:", data.email);
      alert(data.message);
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      localStorage.setItem("username", data.username);
      window.location.href="../chat/chat.html"
      
    } else{
      showMessage(data.error || data.message || "Login Failed")
    }
  } catch (err) {
       showMessage("Something went Wrong ..Try Again Later!!")
      console.log(err)
  }
}

function showMessage(msg){
    const showError=document.getElementById("error-message")
     showError.textContent=msg
     showError.style.display="block"
     showError.style.color="red"

}