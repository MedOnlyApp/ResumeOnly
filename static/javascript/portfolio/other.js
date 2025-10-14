const button = document.getElementById("arrow_up_id")

window.addEventListener("scroll", () => {
    if (window.scrollY > 100) { // 500px from top
        button.style.bottom = "4%"
        button.style.opacity = "1";
    }
    else if (window.scrollY < 100) { // 500px from top
        button.style.bottom = "-10%"
        button.style.opacity = "0";
    }
});


button.addEventListener("click", (e) => {
    window.location.href = "#"
})
