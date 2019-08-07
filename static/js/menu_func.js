function toggleDetails(event) {
    let elem = event.target;
    let span = elem.querySelector(".details");

    if (event.type === 'mouseenter') {
        span.style.display = 'block';
    }
    if (event.type === 'mouseleave') {
        span.style.display = 'none';
    }
}