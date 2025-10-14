
const menu_button = document.querySelector(".menu-icon")
const menu = document.getElementById("nav-menu")

menu_button.addEventListener("click", () => {
    if ( !menu.classList.contains("show-menu") ) {
        menu.classList.add("show-menu")
        menu_button.innerHTML = "close"
        menu.style.top = "101%"
        menu.style.bottom = "auto"
    }
    else {
        menu.classList.remove("show-menu")
        menu_button.innerHTML = "menu"
        menu.style.top = "auto"
        menu.style.bottom = "101%"
    }
})
