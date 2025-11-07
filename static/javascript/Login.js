const email_input = document.getElementById("email_class")
const password_input = document.getElementById("password_class")
const hidden_password = document.getElementById("hidden")
const visible_password = document.getElementById("visible")
const error_message = document.getElementById("error_message")
const login_Form = document.getElementById("login_form")
const submit_button = document.getElementById("submit_button")

const password_visibility = document.getElementById("show_password")

password_visibility.addEventListener("click", (e) => {
    if ( password_visibility.checked == true )
        password_input.type = 'text'
    else 
        password_input.type = 'password'
})


// > Event listener for form submission
login_Form.addEventListener('submit', function(e) {
    e.preventDefault();
    error_message.style.display = "none"

    const email = email_input.value.trim();
    const password = password_input.value.trim();

    // > Set API endpoint
    const API_URL = '/login_form';

    // > Send question to API
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        
        if ( data.response == 'password incorrect' || data.response == 'user not found' )
        {
            error_message.style.display = "inline"
            email_input.value = ''
            password_input.value = ''
            email_input.blur()
            password_input.blur()
        }
        else if ( data.response == 'valid' )
        {
            window.location.href = '/main_page'
        }
        else if ( data.response == 'unverified' )
        {
            window.location.href = '/Verify_email'
        }
            
    })
    .catch(error => {

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




