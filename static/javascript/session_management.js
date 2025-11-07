const user_id = document.getElementById("user-info").dataset.userId;


if (user_id == "" || user_id == "{{ user_id }}" || user_id == "None")
{
    const user_div_id = document.getElementById("user_div_id")
    const sign_in_up_id = document.getElementById("sign_in_up_id")

    user_div_id.style.display = "none"
    sign_in_up_id.style.display = "flex"
}
else {
    const user_div_id = document.getElementById("user_div_id")
    const sign_in_up_id = document.getElementById("sign_in_up_id")
    
    user_div_id.style.display = "flex"
    sign_in_up_id.style.display = "none"
}





const user_div = document.getElementById("user_div_id")
// const account_menu_div = document.getElementById("account_menu_div_id")
const account_id = document.getElementById("account_id")
// const settings_id = document.getElementById("settings_id")
const log_out_id = document.getElementById("log_out_id")


account_id.addEventListener("click", (e) => {
    window.location.href = '/account'
})

// settings_id.addEventListener("click", (e) => {
//     window.location.href = '/settings'
// })

log_out_id.addEventListener("click", (e) => {
    window.location.href = '/'
})


user_div.addEventListener("click", (e) => {
    // console.log('Clicked in the element!');
    // account_menu_div.style.display = "block"
})

document.addEventListener('click', (e) => {
    // Check if the click was outside the element
    if (user_div.contains(e.target))
    {
        // console.log('contains!');
        // account_menu_div.style.display = "block"
    
    // }else if (account_menu_div.contains(e.target) == false) {
        // account_menu_div.style.display = "none"
        // console.log('Clicked outside the element!');
    }
});


