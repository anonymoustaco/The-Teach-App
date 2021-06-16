red = document.getElementById('red')
orange = document.getElementById('orange')
yellow = document.getElementById('yellow')
green = document.getElementById('green')
blue = document.getElementById('blue')
purple = document.getElementById('purple')

function change (value, color) {
    color.style.display = value;
}

function dummy() {}

i = 0

while(true) {
    setTimeout(dummy, 1000)
    if (i == 0) {
        change("none", red)
        change("none", orange)
        change("none", yellow)
        change("none", green)
        change("none", blue)
        change("none", purple)
    }
    i += 1
    if (i = 1) {
        change("inline", red)
    }
    if (i = 2) {
        change("inline", orange)
    }
    if (i = 3) {
        change("inline", yellow)
    }
    if (i = 4) {
        change("inline", green)
    }
    if (i = 5) {
        change("inline", blue)
    }
    if (i = 6) {
        change("inline", purple)
        i = 0
    }
}