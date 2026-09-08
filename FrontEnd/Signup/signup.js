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

    if (response.status == 201) {
      window.location.href = "../Login/login.html";
    } else throw new Error("Failed  to Login");
  } catch (err) {
       document.body.innerHTML=`<div style="color:red">${err}</div>`
  }
}
