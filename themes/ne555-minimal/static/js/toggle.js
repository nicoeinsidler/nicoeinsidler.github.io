const elements_to_toggle = ['design', 'science', 'engineering']

window.addEventListener("DOMContentLoaded", () => {
    console.log('DOM has loaded')
    elements_to_toggle.map((id) => {
        console.log(id)
        var paragraph = document.getElementById(id);
        paragraph.style.display = "none";
        var trigger = document.querySelectorAll("a[href='#" + id + "']")[0];
        trigger.addEventListener("click", toggle, false);
    })
});



function toggle(caller) {
    caller.preventDefault();
    console.log('triggered yes')
    console.log(caller.target)

    const active_class = 'active';
    var id = caller.target.attributes['href'].value;
    var element = document.getElementById(id.substring(1));

    if (element.style.display === "none" | !element.style.display) {
        element.style.display = "block";
        caller.target.classList.add(active_class);
    } else {
        element.style.display = "none";
        caller.target.classList.remove(active_class);
    }
}