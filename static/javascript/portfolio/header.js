const menu_button = document.querySelector(".menu-icon")
const close_menu_button = document.querySelector(".close-menu-icon")
const menu = document.querySelector(".header-menu")

menu_button.addEventListener("click", () => {
    if ( !menu.classList.contains("show-menu") ) {
        menu.classList.add("show-menu")
        menu_button.innerHTML = "close"
    }
    else {
        menu.classList.remove("show-menu")
        menu_button.innerHTML = "menu"
    }
})
