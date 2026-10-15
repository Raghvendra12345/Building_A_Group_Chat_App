async function handleFormSubmit(event) {

  
  try {
    event.preventDefault();

    const username = event.target.username.value;
    const email = event.target.email.value;
    const phoneNumber = event.target.phoneNumber.value;
    const password = event.target.password.value;

    const signupDetail = { username, email, phoneNumber, password };
    console.log(signupDetail);

    const response = await fetch("http://localhost:4700/chat/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupDetail),
    });
    const data=await response.json()

    if (response.status == 201) {
      window.location.href = "../Login/login.html";
    } else{ 
      showMessage(data.error || data.message || "Signup Failed")
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
