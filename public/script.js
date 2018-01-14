

if (top.location.pathname === '/') {
    $(".learnMoreButton").click(function() {
        $('html,body').animate({
            scrollTop: $("#main").offset().top
        }, 'slow');
    });

    $("#aboutScroll").click(function() {
        $('html,body').animate({
            scrollTop: $("#main").offset().top
        }, 'slow');
    });
}

var canvas = document.getElementById('canvas').getContext('2d');
var sigInput = $('#sigInput');
var canvasDiv = ('#canvas');
canvas.width = canvas.width;

if (top.location.pathname === '/sign') {
    $(".clear").click(function() {
        console.log('canvas clear clicked');
        // canvas.clearRect(0,0, canvasDiv.width, canvasDiv.height);
        canvas.clearRect(0, 0, 445, 100);
        sigInput.val('');
    });
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if (top.location.pathname === '/sign' || top.location.pathname === '/submitSig')
{
    var signed = false;
    var draw = false;

    $('#canvas').on('click', function() {
        signed = true;
    });

    $('#canvas').on('mousedown', function() {
        console.log('mouse is down');
        draw = true;
        canvas.lineWidth = 7;
        canvas.beginPath();
    });

    $('#canvas').on('mousemove', function(e) {
        console.log('mouse move');
        if (draw == true) {
            signed = true;
            canvas.lineTo(e.pageX - $('#canvas').offset().left, e.pageY - $('#canvas').offset().top);
            canvas.stroke();
        }
    });

    $('#canvas').on('mouseup', function() {
        draw = false;
        console.log('mouse up');
        var data = document.getElementById('canvas').toDataURL();
        if (signed) {
            $('input:hidden').val(data);
        }
    });
}

//clear canvas

// end canvas sig ~~~~~~~~~~~~~~~~~~~~~~~~
