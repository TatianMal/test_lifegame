document.addEventListener('DOMContentLoaded', function() {
    let ranges = document.querySelectorAll("input[type='range']");
    for (let i = 0; i < ranges.length; i++) {
        ranges[i].setAttribute("min", "1");
    }
});

function showVal(obj, value) {
    let span = obj.nextElementSibling;
    span.innerHTML = "Значение: " + value;
}