SOURCE_URL = document.location.href;
SOURCE_DOMAIN = SOURCE_URL.split("/")[2];

function generate_object() {
    var object = {
        "source_url":SOURCE_URL,
        "links":scrape_links()
    };
    object.subdomains = generate_subdomains(object.links);
    chrome.runtime.sendMessage(object);
}

function scrape_links() {
    var links = [];
    for(var i = 0; i < document.links.length; ++i) {
        var url = document.links[i].href;
        if(url.indexOf("javascript:") < 0 && url.indexOf("mailto:") < 0 && url.indexOf("tel:") < 0 ) {
            links.push(generate_link(url));
        }
    }
    return remove_duplicate_links(links);
}

function generate_link(url) {
    var domain = url.split("/")[2];
    return {
        "url":url,
        "domain":match_domain(domain),
        "subdomain":match_subdomain(domain)
    }
}

function match_domain(domain) {
    var domain_match = domain === SOURCE_DOMAIN ? SOURCE_DOMAIN : false;
    var subdomain = match_subdomain(domain);
    if(!domain_match && subdomain) {
        domain_match = domain.substr(subdomain.length + 1) === SOURCE_DOMAIN ? SOURCE_DOMAIN : false;
    }
    return domain_match;
}

function match_subdomain(domain) {
    var domain_index = domain.indexOf("." + SOURCE_DOMAIN);
    return domain_index > 0 ? domain.substr(0, domain_index) : false;
}

function remove_duplicate_links(original_array) {
    var new_array = [];
    for(var i = 0; i < original_array.length; i++) {
        if(!new_array.some(function(link) {
            return link.url === original_array[i].url;
            })) {
            new_array.push(original_array[i]);
        }
    }
    return new_array;
}

function generate_subdomains(links) {
    var subdomains = [];
    for(var i = 0; i < links.length; i++) {
        if(links[i].subdomain) {
            if(!subdomains.some(function(subdomain) {
                    return subdomain === links[i].subdomain;
                })) {
                subdomains.push(links[i].subdomain);
            }
        }
    }
    return subdomains;
}

generate_object();