function init() {
    scrape_links();
    chrome.runtime.onMessage.addListener(function (message_content) {
        object = message_content;
        console.log(object);
        main(object);
    });
}

function main(object) {

    generate_page_url(object.source_url);
    generate_button_text(object);

    document.querySelector("#all_links").addEventListener("click", function() {
        generate_table(object.links)
    });
    document.querySelector("#domain_links").addEventListener("click", function() {
        generate_table(filter_links(object.links, "domain"));
    });
    document.querySelector("#subdomain_links").addEventListener("click", function() {
        generate_table(filter_links(object.links, "subdomain"));
    });
}

function scrape_links() {
    chrome.tabs.executeScript({
        file: "scrape_links.js"
    });
}

function generate_page_url(url) {
    var url_segments = url.split("/");
    var url_protocol = url_segments.shift() + "//";
    url_segments.shift();
    var url_domain = url_segments.shift();
    var url_path = "/" + url_segments.join("/");

    var page_url = document.querySelector("#page_url");
    var page_domain = document.createElement("span");
    page_domain.setAttribute("id", "page_domain");
    page_url.innerHTML = url_protocol;
    page_domain.innerHTML = url_domain;
    page_url.appendChild(page_domain);
    page_url.innerHTML += url_path;
}

function generate_button_text(object) {
    var links = object.links;
    var all_links = 0;
    var domain_links = 0;
    var subdomain_links = 0;
    for(var i = 0; i < links.length; i++) {
        all_links++;
        if(links[i].domain) {
            domain_links++;
        }
        if(links[i].subdomain) {
            subdomain_links++;
        }
    }
    document.querySelector("#all_links").setAttribute("value", all_links + " Total");
    document.querySelector("#domain_links").setAttribute("value", domain_links+ " Domain");
    document.querySelector("#subdomain_links").setAttribute("value", subdomain_links + " Subdomain");
}

function filter_links(links, filter) {
    var filtered_links = [];
    for(var i = 0; i < links.length; i++) {
        if (links[i][filter]) {
            filtered_links.push(links[i]);
        }
    }
    return filtered_links;
}

function generate_table(links) {
    var table_body = document.querySelector("#table_body");
    while(table_body.lastChild) {
        table_body.removeChild(table_body.lastChild);
    }
    for(var i = 0; i < links.length; i++) {
        var tr = document.createElement("tr");
        var td_number = document.createElement("th");
        if(links[i].domain) {
            td_number.setAttribute("class", "domain_row")
        }
        if(links[i].subdomain) {
            td_number.setAttribute("class", "subdomain_row")
        }
        var td_url = document.createElement("td");
        td_url.setAttribute("colspan", 8);
        td_number.innerHTML = i + 1;
        td_url.innerHTML = '<a target="_blank" href="' + links[i].url + '">' + links[i].url + '</a>';
        tr.appendChild(td_number);
        tr.appendChild(td_url);
        table_body.appendChild(tr);
    }
}

window.addEventListener("load", init);
