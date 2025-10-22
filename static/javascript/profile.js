const history_div = document.getElementById("history_div")
const editing_panel = document.getElementById("editing_panel")
const saved_info_div = document.getElementById("saved_info_div")
const profile_image_div = document.getElementById("profile_image_div")
const profile_img_input = document.getElementById("profile_img_input")

const edit_button = document.querySelector('.edit_span')
const save_button = document.querySelector('.save_span')
const cancel_button = document.querySelector('.cancel_span')

profile_img_input.addEventListener('input', () => {
    const file = profile_img_input.files[0]

    if (file) {
            const formData = new FormData();
            formData.append('image', file);  // Assuming file input

            fetch('/account/add_img', {
                method: 'POST',
                body: formData
            })
            .then(async response => {
                const contentType = response.headers.get('content-type');
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${errorText}`);
                } else if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    const text = await response.text();
                    throw new Error(`Expected JSON, got: ${text}`);
                }
            })
            .then(data => {
                console.log(data.response)
            })
            .catch(error => {
                console.error('Error:', error.message);
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
            
            const reader = new FileReader()
            
            reader.onload = function (e) {
                // Set the image source to the loaded file
                profile_image_div.children[0].children[0].src = e.target.result
                console.log(data.response)
            }

        reader.readAsDataURL(file)
    }
    })

edit_button.addEventListener('click', () => {
    editing_panel.children[1].value = saved_info_div.children[0].innerHTML
    editing_panel.children[3].value = saved_info_div.children[2].innerHTML
    saved_info_div.style.display = "none"
    editing_panel.style.display = "block"
})

save_button.addEventListener('click', () => {
    fetch('/account/update_profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
                    client_name: editing_panel.children[1].value,
                    bio: editing_panel.children[3].value 
                })
    })
    .then(async response => {
        const contentType = response.headers.get('content-type');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${errorText}`);
        } else if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            const text = await response.text();
            throw new Error(`Expected JSON, got: ${text}`);
        }
    })
    .then(data => {
        console.log(data.response)

        saved_info_div.children[0].innerHTML = editing_panel.children[1].value
        saved_info_div.children[2].innerHTML = editing_panel.children[3].value

    })
    .catch(error => {
        console.error('Error:', error.message);
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


    saved_info_div.style.display = "block"
    editing_panel.style.display = "none"
})

cancel_button.addEventListener('click', () => {
    saved_info_div.style.display = "block"
    editing_panel.style.display = "none"
})



// const delete_panel = document.getElementById("delete_panel")

fetch('/load_account_info', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nothing: '' })
})
.then(async response => {
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
    } else if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        const text = await response.text();
        throw new Error(`Expected JSON, got: ${text}`);
    }
})
.then(data => {
    console.log(data)

    saved_info_div.children[0].innerHTML = data.profile_info[0]
    saved_info_div.children[1].innerHTML = data.profile_info[1]
    saved_info_div.children[2].innerHTML = data.profile_info[2]
    if (data.profile_info[3] != null) 
        profile_image_div.children[0].children[0].src = `data:image/jpeg};base64,${data.profile_info[3]}`
    
    for ( let application of data.applications) {
        
        history_div.children[0].innerHTML += `
                            <tr>
                                <td>${application[1]}</td>
                                <td>${application[2]}</td>
                                <td>${application[3]}</td>
                                <td>${application[4]}</td>
                                <td class="modification_colomn">
                                    <span class="delete_span">
                                        <img src="../static/img/delete.svg" alt="">
                                        Delete
                                    </span>
                                </td>
                            </tr>
                            `

        // history_div.children[0].innerHTML += `
        //                     <tr>
        //                         <td>${application[0]}</td>
        //                         <td>${application[1]}</td>
        //                         <td>${application[2]}</td>
        //                         <td>${application[3]}</td>
        //                         <td>${application[4]}</td>
        //                         <td class="modification_colomn">
        //                             <span class="delete_span">
        //                                 <img src="../static/img/delete.svg" alt="">
        //                                 Delete
        //                             </span>
        //                         </td>
        //                     </tr>
        //                     `
    }

    const delete_buttons = document.querySelectorAll('.delete_span')
    // const edit_buttons = document.querySelectorAll('.edit_span')




    delete_buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            console.log("Delete button clicked!", button);
            
                
            fetch('/load_account_info/delete_application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },    
                body: JSON.stringify({ application_id: button.parentElement.parentElement.children[0].innerHTML })
            })    
            .then(async response => {
                const contentType = response.headers.get('content-type');
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${errorText}`);
                } else if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    const text = await response.text();
                    throw new Error(`Expected JSON, got: ${text}`);
                }    
            })    
            .then(data => {
                console.log(data)
                // window.location.href = "/account"
                button.parentElement.parentElement.remove()
            })    
            .catch(error => {
                console.error('Error:', error.message);
            });    
            
        });    
    });    

})
.catch(error => {
    console.error('Error:', error.message);
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





