const project_panel = document.getElementById("project_body_id")
const project_carts = document.querySelectorAll(".card-container")

console.log("moh")

project_carts.forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.children[0].style.transform = "rotateY(180deg)"
    })
    
    card.addEventListener("mouseleave", () => {
        console.log("moh2")
        
        card.children[0].style.transform = "rotateY(0)"
    })
})

console.log("moh3")










