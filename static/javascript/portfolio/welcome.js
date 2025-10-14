const stars = document.querySelectorAll(".XS")

let random = 0

stars.forEach(star => {
    random = Math.random() * 100;
    console.log(random)
    star.style.setProperty('--random-left', `${Math.floor(random)}%`);
    random = Math.random() * 100;
    star.style.setProperty('--random-top', `${Math.floor(random)}%`);

    console.log("zazk")
});