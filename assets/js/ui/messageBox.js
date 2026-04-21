let messagebox = document.querySelector("#messagebox");
messagebox.querySelector("p").innerHTML = "";
messagebox.classList.add("hidden");

function showMessage(mess, temp) {
    return new Promise((r) => {
        messagebox.querySelector("p").innerHTML = mess;
        messagebox.classList.remove("hidden");
        setTimeout((e) => {
            messagebox.classList.add("hidden");
        }, temp)
    })
} 