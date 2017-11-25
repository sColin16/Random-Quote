
var requests = 5;

var quotes = [];

currentQuote = "";
currentAuthor = "";

function Quote(quote, author){
    this.quote = quote;
    this.author = (author === "") ? "Unknown" : author;
}

function parseQuery(json){
    //pull data from query out of JSON object
    var result = json.query.results.result;
    
    //remove the html tags from the received data
    var jsonStr = result.match(/>({.+})</)[1];
    
    //get the JSON object, removing escape characters to prevent errors
    var jsonObj = JSON.parse(jsonStr.replace(/\\/g, ""));
    
    //filter out really long quotes
    if(jsonObj.quoteText.length < 200){
        quotes.push(new Quote(jsonObj.quoteText.slice(0, -1), jsonObj.quoteAuthor));
    }
}

function getQuote(){
    $.ajax({
        //using Yahoo Query Language, we can obtain cross-domain data through JSON (Forismatic JSONP does not escape doulbe quotes)
        url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20htmlstring%20where%20url%3D'https%3A%2F%2Fapi.forismatic.com%2Fapi%2F1.0%2F%3Fmethod%3DgetQuote%26format%3Djson%26lang%3Den%26rnd%3D" + Math.random() + "'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
        //we cachebust so that we actually get a new quote every time
        dataType: "json",
        success: function(data){
            parseQuery(data);
        },
        error: function(){
            console.log("Error in retreiving quote")
        }
    });
}

function presentQuote(){
    var quote = quotes.shift();
    
    //attempt to refill quote bank
    for(var i = quotes.length; i <= 5; i++){
        getQuote();
    }
    
    console.log("You have " + quotes.length + " quotes left");
    
    currentQuote = quote.quote;
    currentAuthor = quote.author;
    
    updatePage();
}

function snatchFirstQuote(){
    if(quotes.length > 0){
        var quote = quotes.shift();
        
        currentQuote = quote.quote;
        currentAuthor = quote.author;
        
        updatePage();
    } else{
        setTimeout(snatchFirstQuote, 100);
    }
}

function updatePage(){
    
    document.getElementById("quote-wrapper").classList.remove("fadeIn");
    document.getElementById("quote-wrapper").classList.add("fadeOut");
    
    setTimeout(fadeInQuote, 400);
    
}

function fadeInQuote(){
    document.getElementById("quote").innerText = "\"" + currentQuote + "\"";
    document.getElementById("author").innerText = "- " + currentAuthor;
    
    document.getElementById("quote-wrapper").classList.remove("fadeOut");
    document.getElementById("quote-wrapper").classList.add("fadeIn");
}

function openTwitter(quote, author) {
    var link = "https://twitter.com/intent/tweet?url=https%3A%2F%2Fscolin16.github.io%2FRandom-Quote&text=%22" + encodeURI(quote) + "%22%20-%20" + encodeURI(author) + ".%20Find%20more%20awesome%20quotes%3A%20";
    window.open(link);
}

document.getElementsByClassName("fa-twitter")[0].addEventListener("click", function(){openTwitter(currentQuote, currentAuthor)});

document.getElementById("new-quote").addEventListener("click", presentQuote);

for (var i = 0; i < requests; i++){
    getQuote();
}

setTimeout(snatchFirstQuote, 100);

