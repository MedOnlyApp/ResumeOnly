function initButtons() {

    const contact_panel = document.getElementById("contact_id")
    const contact_type = document.querySelectorAll(".contact-type")
    const contact_button = document.querySelectorAll(".contact-button")

    contact_panel.addEventListener("mouseenter", (e) => {
        contact_panel.style.width = "150px"

        contact_type.forEach(element => {
            element.style.left = "40%"
        })
    })

    contact_panel.addEventListener("mouseleave", (e) => {
        contact_panel.style.width = "50px"
        
        contact_type.forEach(element => {
            element.style.left = "100%"
        })
    })

    contact_button.forEach(element => {
        element.addEventListener("click", (e) => {
            contact_panel.style.width = "150px"
            
            contact_type.forEach(element => {
                element.style.left = "40%"
            })
        })
    })


}

initButtons()