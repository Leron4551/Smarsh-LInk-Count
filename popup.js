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
    button_press(object, "domain");

    document.querySelector("#all_links").addEventListener("click", function() {
        button_press(object);
    });
    document.querySelector("#domain_links").addEventListener("click", function() {
        button_press(object, "domain");
    });
    document.querySelector("#subdomain_links").addEventListener("click", function() {
        button_press(object, "subdomain", object.subdomains);
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
    if(filter) {
        var filtered_links = [];
        for(var i = 0; i < links.length; i++) {
            if (links[i][filter]) {
                filtered_links.push(links[i]);
            }
        }
        return filtered_links;
    } else {
        return links;
    }
}

function button_press(object, filter, subdomains) {
    var url_list = filter_links(object.links, filter);
    clear_table();
    var header_name = filter? filter + " links" : "All links";
    generate_header(header_name);
    if(subdomains) {
        for(var i = 0; i < subdomains.length; i++) {
            generate_header(subdomains[i]);
            for (var j = 0; j < url_list.length; j++) {
                if(url_list[j].subdomain === subdomains[i]) {
                    generate_row(j + 1, url_list[j])
                }
            }
        }
    } else {
        for (var j = 0; j < url_list.length; j++) {
            generate_row(j + 1, url_list[j])
        }
    }

}

function clear_table() {
    var table_body = document.querySelector("#table_body");
    while(table_body.lastChild) {
        table_body.removeChild(table_body.lastChild);
    }
}

function generate_header(name) {
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.setAttribute("colspan", 9);
    th.innerHTML = name.toUpperCase();
    tr.appendChild(th);
    document.querySelector("#table_body").appendChild(tr);
}

function generate_row(number, link) {
    var tr = document.createElement("tr");
    var td_number = document.createElement("th");
    td_number.setAttribute("class", "external_row");
    if(link.domain) {
        td_number.setAttribute("class", "domain_row");
    }
    if(link.subdomain) {
        td_number.setAttribute("class", "subdomain_row");
    }
    var td_url = document.createElement("td");
    td_url.setAttribute("colspan", 8);
    td_number.innerHTML = number;
    td_url.innerHTML = '<a target="_blank" href="' + link.url + '">' + link.url + '</a>';
    tr.appendChild(td_number);
    tr.appendChild(td_url);
    document.querySelector("#table_body").appendChild(tr);
}

window.addEventListener("load", init);
