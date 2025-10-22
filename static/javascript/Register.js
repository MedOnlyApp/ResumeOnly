const name_input = document.getElementById("name_id")
const username_input = document.getElementById("username_id")
const email_input = document.getElementById("email_class")
const password_input = document.getElementById("password_class")
const password_confirm_input = document.getElementById("password_confirm_class")
const error_message = document.getElementById("error_message")
// const error_passwords_match = document.getElementById("error_passwords_match")
const register_Form = document.getElementById("registration_form")
const submit_button = document.getElementById("submit_button")

console.log("moh")
// import emailjs from '@emailjs/browser';
const emailjs = window.emailjs;


function is_password_strong(password) {
    if ( password.length < 8 || password.length > 20 )
        return false
    else
        return true
}



submit_button.addEventListener('click', function(e) {
    e.preventDefault();
    console.log("moh")

    error_message.style.display = "none"
    // error_passwords_match.style.display = 'none'
    
    const name = name_input.value.trim();
    const username = username_input.value.trim();
    const email = email_input.value.trim();
    const password = password_input.value.trim();
    const password_confirm = password_confirm_input.value.trim();
    
    if ( is_password_strong(password) == false )
    {
        error_message.style.display = "inline"
        error_message.innerHTML = "The password must be between 8-20 characters."
        password_input.value = ''
        password_confirm_input.value = ''
        password_input.blur()
        password_confirm_input.blur()
        console.log(data.response)
        
        return
    }

    // Set API endpoint
    const API_URL = '/register_form';
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_name: name,
            username: username,
            email: email,
            password: password,
            password_confirm: password_confirm
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        
        if ( data.response == 'password_error' )
        {
            // error_passwords_match.style.display = 'inline'
            error_message.style.display = "inline"
            error_message.innerHTML = "The passwords don't match."
            password_input.value = ''
            password_confirm_input.value = ''
            password_input.blur()
            password_confirm_input.blur()
            console.log(data.response)
        }
        else if ( data.response == 'verified' )
        {
            error_message.style.display = "inline"
            error_message.innerHTML = "User already exist, Login."
            username_input.value = ''
            email_input.value = ''
            password_input.value = ''
            password_confirm_input.value = ''
            username_input.blur()
            email_input.blur()
            password_input.blur()
            password_confirm_input.blur()
            console.log(data.response)
        }
        else if ( data.response == 'unverified' )
        {
            console.log(data.response)

            // > send verification email
            emailjs.send("service_a17lfxf","template_wn7vzdh",{
                message: data.verification_code
            }, "A1mKi6_6NZGOXeTfV")
            .then((result) => {
                console.log("Email sent successfully!", result.text);
            }, (error) => {
                console.log("Failed to send email:", error.text);
                const body = document.querySelector("body")
                body.insertAdjacentHTML("beforeend", `<div class="error-panel">
                                                    <span>
                                                        <h2>Error!</h2>
                                                        <p>Try again Later.</p>
                                                        <div>
                                                            <button>Ok</button>
                                                        </div>
                                                    </span>
                                                </div>
                                        `)
                const error_panel = document.querySelector(".error-panel")

                error_panel.firstElementChild.lastElementChild.firstElementChild.addEventListener("click", () => {
                    error_panel.remove()
                    window.location.href = "/main_page"
                })

            });

            window.location.href = "/Verify_email"
        }
        else if ( data.response == "exist, unverified" )
        {
            console.log(data.response)
            window.location.href = "/Verify_email"
            // window.location.href = "/login"
        }
    
    })
    .catch(error => {
        console.error('Error:', error);
        const body = document.querySelector("body")
        body.insertAdjacentHTML("beforeend", `<div class="error-panel">
                                            <span>
                                                <h2>Error!</h2>
                                                <p>Try again Later.</p>
                                                <div>
                                                    <button>Ok</button>
                                                </div>
                                            </span>
                                        </div>
                                `)
        const error_panel = document.querySelector(".error-panel")

        error_panel.firstElementChild.lastElementChild.firstElementChild.addEventListener("click", () => {
            error_panel.remove()
            window.location.href = "/login"
        })


    });
});

