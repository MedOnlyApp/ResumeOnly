
console.log(location.href)

window.addEventListener('popstate', function (event) {
    history.pushState(null, null, '/login');

    alert("Back button is disabled on this page.");
});

window.history.forward();
function noBack() {
    window.history.forward();
}



