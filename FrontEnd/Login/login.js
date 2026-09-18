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

    if (response.status== 200) {
      alert(data.message);
      localStorage.setItem("token", data.token);
      window.location.href="../chat/chat.html"
    } else throw new Error("Failed to Login");
  } catch (err) {
    document.body.innerHTML=`<div style color:"red">${err}</div>`
  }
}
