//global 
var pbSelector = "body"
var pbMin = 0
var pbHtml = ""
var pbOutputScript = ""
var pbIframeW = 300;
var pbIframeH = 250;
var pbIsGPT = false;
var pbIsIframe = false;

function init() {

    url = new URL(window.location.href);

    if (url.searchParams.get('pbSelector')) {
        pbSelector = url.searchParams.get('pbSelector');
    }
    if (url.searchParams.get('pbMin')) {
        pbMin = url.searchParams.get('pbMin');
        adjustedMin = pbMin > 0 ? pbMin - 1 : 0
    }
    if (url.searchParams.get('pbHtml')) {
        pbHtml = url.searchParams.get('pbHtml');
        pbIsGPT = pbHtml.includes("tag/js/gpt.js");
        $("#generateButton").prop('disabled', false);
    }
    if (url.searchParams.get('pbIsIframe')) {
        pbIsIframe = url.searchParams.get('pbIsIframe') == 'true';
    }
    if (url.searchParams.get('pbIframeW')) {
        pbIframeW = url.searchParams.get('pbIframeW');
    }
    if (url.searchParams.get('pbIframeH')) {
        pbIframeH = url.searchParams.get('pbIframeH');
    }
    
    $("#inputPbSelector").val(pbSelector);
    $(".pbSelector").html(pbSelector);

    $("#inputPbMin").val(pbMin);
    $(".pbMin").html(pbMin);

    $("#inputPbHtml").val(pbHtml);
    $("#inputIframeW").val(pbIframeW);
    $("#inputIframeH").val(pbIframeH);
    escapedPassback = escapePassback(pbHtml);
    
    $(".adjustedMin").html(adjustedMin);
    

    if (pbIsIframe) {
        $("#switchIframe").prop("checked", true);
        $("#inputIframeW").prop('disabled', false);
        $("#inputIframeH").prop('disabled', false);
    } else {
        $("#inputIframeW").prop('disabled', true);
        $("#inputIframeH").prop('disabled', true);
    }

    if (pbIsGPT) {
        $(".escapedPassback").html(escapedPassback.replace(/'/g, "\"").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(
            /gpt.js"&gt;/g, "gpt.js\"&gt; ` + resizeDFP + `"));

        $(".iframeW").html(1);
        $(".iframeH").html(1);
    } else {
        $(".escapedPassback").html(escapedPassback.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        $(".iframeW").html(pbIframeW);
        $(".iframeH").html(pbIframeH);
    }

    if (pbMin != "" && pbHtml != "" && pbSelector != "") {
        $(".after_generate").removeClass('d-none'); //show passback output if fields are not empty
        if (pbIsGPT) {
            $(".gpt_only").removeClass('d-none');
            pbOutputScript = $("#gpt_pbOutput").text();
        } else if (pbIsIframe) {
            $(".iframe_only").removeClass('d-none');
            pbOutputScript = $("#iframe_pbOutput").text();
        } else {
            $(".std_only").removeClass('d-none');
            pbOutputScript = $("#std_pbOutput").text();
        }

        testPb();

    } else {
        $(".before_generate").removeClass('d-none'); //show passback output if fields are not empty
    }

}

function resetPb() {
    console.log(window.location.href.split('?')[0])
        // var url = location.protocol + '//' + location.host + location.pathname;
    window.location.replace(window.location.href.split('?')[0]);
}
function escapePassback(string) {
    return ('' + string).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
        case '"':
        case "'":
        case '\\':
            return '\\' + character
        // Four possible LineTerminator characters need to be escaped:
        case '\n':
            return '\\n'
        case '\r':
            return '\\r'
        case '\u2028':
            return '\\u2028'
        case '\u2029':
            return '\\u2029'
    }
    })
}
function generatePb() {
    pbSelector = $("#inputPbSelector").val();
    pbMin = $("#inputPbMin").val()
    adjustedMin = pbMin > 0 ? $("#inputPbMin").val() - 1 : 0;
    pbHtml = $("#inputPbHtml").val();
    escapedPassback = escapePassback(pbHtml);
    pbIsIframe = $("#switchIframe").is(':checked');
    pbIframeW = $("#inputIframeW").val();
    pbIframeH = $("#inputIframeH").val();

    var url = window.location.href;
    if (url.indexOf("?") > 0) {
        url = url.substring(0, url.indexOf("?"));
    }
    url += "?pbIsIframe=" + pbIsIframe + "&pbIframeW=" + pbIframeW + "&pbIframeH=" + pbIframeH +
        "&pbSelector=" + encodeURIComponent(pbSelector) + "&pbMin=" + pbMin + "&pbHtml=" + encodeURIComponent(pbHtml);
    window.location.replace(url);
}

function testPb() {

    //clean all passback test iframes
    $("#iframeContainer > iframe").remove();

    //append new passback test iframe
    var pbIframe = document.createElement("iframe");
    pbIframe.width = "100%";
    pbIframe.height = 500;
    pbIframe.border = 1;
    $("#iframeContainer").append(pbIframe);

    var myscript = document.createElement('script');
    myscript.type = 'text/javascript';
    //adapt slot and min to test iframe
    myscript.innerHTML = pbOutputScript.replace(/^ *var passbackSlot.*$/m,
        'var passbackSlot = window.document.querySelectorAll("body")[0];');
    pbIframe.contentDocument.head.appendChild(myscript);
}

function copyPb() {
    navigator.clipboard.writeText(pbOutputScript).then(function() {
        // $('#copyAlert').show()
        $('#copyButtonOff').addClass('d-none');
        $('#copyButtonOn').removeClass('d-none');

        setTimeout(function() {
            $('#copyButtonOn').addClass('d-none');
            $('#copyButtonOff').removeClass('d-none');
        }, 3000);
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

$(document).ready(function() {
    init();
    $('#switchIframe').change(function() {
        if (this.checked) {
            $("#inputIframeW").prop('disabled', false);
            $("#inputIframeH").prop('disabled', false);
        } else {

            $("#inputIframeW").prop('disabled', true);
            $("#inputIframeH").prop('disabled', true);
        }
    });

    $('#inputPbHtml').keyup(function() {
        $('#generateButton').prop('disabled', this.value == "" ? true : false);
    })

});

//