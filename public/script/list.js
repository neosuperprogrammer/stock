var pageToRequest = 1;
var itemToRequest = 0;
var itemState = 1;
var sortOrder = 0;
var requestEnd = 0;
var inRequest = 0;
var itemCount = 0;

var getStateTitle = function (id) {

    console.log("update item : " + id);
    // stopProp
}

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

    } else if (typeof XDomainRequest != "undefined") {

        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {

        // Otherwise, CORS is not supported by the browser.
        xhr = null;

    }
    return xhr;
}

var requestItems = function () {
    if (requestEnd == 1) {
        console.log('request ended');
        $('.loading-div').remove();
        return;
    }

    if (inRequest == 1) {
        console.log('in request, return');
        return;
    }

    console.log("===============request");
    inRequest = 1;

    var raw_template = $('#card-template').html();
    var template = Handlebars.compile(raw_template);
    var placeHolder = $('#content');

    // if (pageToRequest > 1) {
    //     $(window).scrollTop($(document).height());
    // }
    if (pageToRequest == 1) {
    	placeHolder.append("<div class='loading-div col-12'><div class='loading-text'><i class='fas fa-spinner fa-spin'></i></div></div>");
    }
    itemState = getState();
    sortOrder = getSort();
    // var start = (pageToRequest - 1) * 20;
    var start = itemToRequest;
    // console.log("sortOder : "  + sortOrder);
    // $.getJSON("/api/items/page/" + pageToRequest + "?state=" + itemState + "&sort=" + sortOrder, {}, function (data) {
    $.getJSON("/api/items/items/" + start + "?count=20&state=" + itemState + "&sort=" + sortOrder, {}, function (data) {
        $('.loading-div').remove();
        console.log(data);
        inRequest = 0;
        if(data.result == 'fail') {
            // var reason = JSON.parse(data.reason);
            var reason = JSON.stringify(data.reason, null, 4);
            var failReason = 'request page(' + pageToRequest + ') failed, reason : ' + reason;
            console.log(failReason);
            placeHolder.append("<div class='loading-div col-6'><i class=\"fab fa-accessible-icon\"></i>  " + failReason + " </div>");
        } else {
            console.log("length" + data.items.length);
            if (data.items.length == 0) {
                requestEnd = 1;
                if (pageToRequest == 1) {
                    placeHolder.append("<div class='loading-div col-6'><i class='far fa-thumbs-up''></i></div>");
                } else {
                    $('.loading-div').remove();
                }
            }
            else {
                data.items.forEach(function (item) {
                    var html = template(item);
                    // placeHolder.append(html);
                    // console.dir(">>>>>>>>>>>" + html);
                    var elements = $(html);
                    placeHolder.append(elements);
                    itemCount++;


                    if (item.forget_count == 0) {
                        $('.card-title', elements).css('background-color', '#73AD21');
                    }
                    else if (item.forget_count == 1) {
                        $('.card-title', elements).css('background-color', '#adac1f');
                    }
                    else if (item.forget_count == 2) {
                        $('.card-title', elements).css('background-color', '#bb832f');
                    }
                    else if (item.forget_count == 3) {
                        $('.card-title', elements).css('background-color', '#bb363b');
                    }
                    else if (item.forget_count == 4) {
                        $('.card-title', elements).css('background-color', '#bb3ca5');
                    }
                    else  {
                        $('.card-title', elements).css('background-color', '#9047bb');
                    }

                    $('.card-desc-block', elements).unbind('click');
                    $('.card-desc-block', elements).click(function (evt) {
                        evt.preventDefault();
                        // console.log(this);
                        $(this).toggleClass('hidden');

                        // var urlStr = 'http://endic.naver.com/nvoice?service=endic&speech_fmt=mp3&from=endic&text=He%20was%20born%20in%20the%20Year%20of%20the%20Rabbit%2e&vcode=381000&speaker=clara';


                        // var xhr = createCORSRequest('GET', urlStr);
                        // if (!xhr) {
                        //     throw new Error('CORS not supported');
                        // }
                        //
                        // xhr.onload = function() {
                        //     var responseText = xhr.responseText;
                        //     console.log(responseText);
                        //     // process the response.
                        // };
                        //
                        // xhr.onerror = function() {
                        //     console.log('There was an error!');
                        // };
                        // xhr.withCredentials = true;
                        // xhr.send();

                        // urlStr = 'http://ac.endic.naver.com/ac?q=zl&q_enc=utf-8&st=11001&r_format=json&r_enc=utf-8&r_lt=11001&r_unicode=0&r_escape=1';
                        // $.ajax({
                        //     url: urlStr,
                        //     type: 'get',
                        //     dataType: 'jsonp',
                        //     // responseType: 'blob',
                        //     success: function (data) {
                        //         console.log('success ' + data);
                        //     },
                        //     error: function (error) {
                        //         console.log('error >>> ' + error);
                        //     }
                        //
                        // });


                    });

                    $('.card-title-edit', elements).click(function (evt) {
                        var urlToRequest = "/items/" + this.id;
                        console.log("location : " + urlToRequest);
                        window.location.href = urlToRequest;
                        // 					window.location.replace(urlToRequest);
                        evt.preventDefault();
                        return false;
                    });

                    $('.card-title-jargon', elements).click(function (evt) {
                        var button = $(this);
                        if (itemState == 999) {
                            if (confirm('Move To Newly Added?')) {
                                var urlToRequest = "/api/items/unjargon/" + this.id;
                                console.log('request : ' + urlToRequest);
                                $.ajax({
                                    url: urlToRequest,
                                    success: function (data) {
                                        console.log(data.result);
                                        if (data.result == "success") {
                                            // console.log(button.parent());
                                            button.parent().parent().addClass("memorized");
                                            itemToRequest--;
                                            itemCount--;
                                            setTitle();
                                            // button.text('hi');
                                        }
                                    }
                                });
                            }

                        } else {
                            if (confirm('Too Jargonal?')) {
                                var urlToRequest = "/api/items/jargon/" + this.id;
                                console.log('request : ' + urlToRequest);
                                $.ajax({
                                    url: urlToRequest,
                                    success: function (data) {
                                        console.log(data.result);
                                        if (data.result == "success") {
                                            // console.log(button.parent());
                                            button.parent().parent().addClass("memorized");
                                            itemToRequest--;
                                            itemCount--;
                                            setTitle();
                                            // button.text('hi');
                                        }
                                    }
                                });
                            }
                        }
                        evt.preventDefault();
                        return false;

                    });

                    $(".card-update-button", elements).click
                    (
                        function (evt) {
                            //YOUR CODE HERE
                            // console.log(evt.target);
                            var button = $(this);
                            // $(this).text("hi");
                            var urlToRequest = "/api/items/memorized/" + evt.target.id;
                            if (itemState == 2) {
                                var urlToRequest = "/api/items/forgot/" + evt.target.id;
                            }
                            $.ajax({
                                url: urlToRequest,
                                success: function (data) {
                                    console.log(data.result);
                                    if (data.result == "success") {
                                        // console.log(button.parent());
                                        button.parent().parent().parent().addClass("memorized");
                                        // button.text('hi');
                                    }
                                }
                            });

                            evt.preventDefault();
                            return false;
                        }
                    );
                    $('.card-close-btn', elements).click(function (evt) {
                        console.log(this);
                        if (confirm('Delete?')) {
                            var urlToRequest = "/api/items/" + evt.target.id + "?_method=DELETE";
                            console.log("url " + urlToRequest);
                            $.ajax({
                                url: urlToRequest,
                                success: function (data) {
                                    console.log("delete success : " + data);
                                    window.location.replace("/");
                                    // requestItems();
                                    // updateContent();
                                },
                                data: {},
                                type: 'POST'
                            });

                        } else {
                        }
                        evt.preventDefault();
                        return false;
                    });
                    $('.card-forget-check-box', elements).change(function (evt) {
                        // this will contain a reference to the checkbox
                        if (this.checked) {
                            console.log('checked');
                            var button = $(this);
                            // var urlToRequest = "/api/items/memorized/" + evt.target.id;
                            // if (itemState == 2) {
                            var urlToRequest = "/api/items/forgot/" + evt.target.id;
                            // }
                            $.ajax({
                                url: urlToRequest,
                                success: function (data) {
                                    console.log(data.result);
                                    if (data.result == "success") {
                                        // console.log(button.parent());
                                        button.parent().parent().parent().parent().parent().addClass("memorized");
                                        // button.text('hi');
                                        itemToRequest--;
                                        itemCount--;
                                        setTitle();
                                    }
                                }
                            });

                            evt.preventDefault();
                            return false;

                        } else {
                            console.log('unchecked');
                        }
                    });
                    $('.card-remember-check-box', elements).change(function (evt) {
                        // this will contain a reference to the checkbox
                        if (this.checked) {
                            console.log('checked');
                            var button = $(this);
                            var urlToRequest = "/api/items/memorized/" + evt.target.id;
                            // if (itemState == 2) {
                            //     var urlToRequest = "/api/items/forgot/" + evt.target.id;
                            // }
                            $.ajax({
                                url: urlToRequest,
                                success: function (data) {
                                    console.log(data.result);
                                    if (data.result == "success") {
                                        // console.log(button.parent());
                                        button.parent().parent().parent().parent().parent().addClass("memorized");
                                        itemToRequest--;
                                        itemCount--;
                                        setTitle();

                                        // button.text('hi');
                                    }
                                }
                            });

                            evt.preventDefault();
                            return false;

                        } else {
                            console.log('unchecked');
                        }
                    });
                    $('.card-forget-check-text', elements).css('color', '#474747');
                    $('.card-remember-check-text', elements).css('color', '#474747');
                    if (itemState == 1) {
                        $('.card-forget-check-text', elements).css('color', '#adadad');
                        $('.card-forget-check-box', elements).prop('disabled', true);
                    }
                    else if (itemState == 5) {
                        $('.card-remember-check-text', elements).css('color', '#adadad');
                        $('.card-remember-check-box', elements).prop('disabled', true);
                    }

                    var d = new Date(item.remembered);
                    // console.log('item.remembered : ' + item.remembered);
                    var remained = remainedHours(d);
                    if (remained <= 0 || itemState == 1) {
                        $('.card-state-div', elements).show();
                    } else {
                        $('.card-state-div', elements).hide();
                    }
                    if (itemState == 999) {
                        $('.card-state-div', elements).hide();
                        $('.card-created', elements).hide();
                    } else {
                        $('.card-created', elements).show();
                    }


                });
                setTitle();
                pageToRequest++;
                itemToRequest += 20;
                // console.log('document height : ' + $(document).height());
                // console.log('window height : ' + $(window).height());
                if ($(document).height() <= $(window).height()) {
                    console.log('so request .....');
                    requestItems();
                }
                else {
                    placeHolder.append("<div class='loading-div col-12'><div class='loading-text'><i class='fas fa-spinner fa-spin'></i></div></div>");
                }
            }

        }

    });
};


var setTitle = function () {
    itemState = getState();
    if (itemState == 1) {
        // document.write("Don't Know");
        $('#main-title').text("Newly Added (" + itemCount + ")");
    } else if (itemState == 2) {
        // document.write("Maybe Know");
        $('#main-title').text("1'st Turn (" + itemCount + ")");
    } else if (itemState == 3) {
        // document.write("Remembered");
        $('#main-title').text("2'nd Turn (" + itemCount + ")");
    } else if (itemState == 4) {
        // document.write("Can't forget");
        $('#main-title').text("3'rd Turn (" + itemCount + ")");
    } else if (itemState == 5) {
        // document.write("Can't forget");
        $('#main-title').text("Long-Term Memory (" + itemCount + ")");
    }
    else if (itemState == 999) {
        // document.write("Can't forget");
        $('#main-title').text("Jargonal (" + itemCount + ")");
    }

};

var setSortOrderTitle = function() {
    // console.log('setSortOrderTitle : ' + sortOrder);
    $('#main-sort').text(sortOrder == 0 ? "To Newest" : "To Oldest");
};

var getUpdateTitle = function () {
    if (itemState == 1) {
        document.write("Move to memorized");
    } else {
        document.write("Move to memorizes");
    }
};

function setState(state) {
    localStorage['state'] = state;
}


function getState() {
    var state = localStorage['state'] || 1;
    return state;
}

function setSort(sort) {
    localStorage['sort'] = sort;
}

function getSort() {
    var sort = localStorage['sort'] || 0;
    return sort;
}

function setDirty(dirty) {
    localStorage['dirty'] = dirty;
}


function getDirty() {
    var dirty = localStorage['dirty'] || 0;
    return dirty;
}

function resetVariable() {
    pageToRequest = 1;
    itemToRequest = 0;
    requestEnd = 0;
    itemCount = 0;
    inRequest = 0;
}

var updateContent = function (state) {
    // if (itemState == 1) {
    //     itemState = 2;
    // } else {
    //     itemState = 1;
    // }

    if (state != undefined) {
        setState(state)
        itemState = state;
    }
    resetVariable();

    // $('#main-title').text(itemState == 1 ? "Items to memorize" : "Items memorized");
    //
    // $('#update-content-button').text(itemState == 1 ? "Move to memorized" : "Move to memorize");
    setTitle();
    setSortOrderTitle();
    var placeHolder = $('#content');
    placeHolder.empty();
    console.log('update content request');
    requestItems();
};

function elapsedHours(startTime) {
    // record start time
    // var startTime = new Date();
    // later record end time
    var endTime = new Date();
    // console.dir('Now ' + endTime);

    // time difference in ms
    var timeDiff = endTime - startTime;

    // strip the ms
    timeDiff /= 1000;
    timeDiff = Math.floor(timeDiff);
    var elapsedHours = timeDiff / 60 / 60;
    elapsedHours = Math.floor(elapsedHours);
    // console.dir('timeDiff ' + elapsedHours);

    // get seconds (Original had 'round' which incorrectly counts 0:28, 0:29, 1:30 ... 1:59, 1:0)
    var seconds = Math.round(timeDiff % 60);

    // remove seconds from the date
    timeDiff = Math.floor(timeDiff / 60);

    // get minutes
    var minutes = Math.round(timeDiff % 60);

    // remove minutes from the date
    timeDiff = Math.floor(timeDiff / 60);

    // get hours
    var hours = Math.round(timeDiff % 24);

    // remove hours from the date
    timeDiff = Math.floor(timeDiff / 24);

    // the rest of timeDiff is number of days
    var days = timeDiff ;
    return elapsedHours;
}

function remainedHours(startTime) {
    // record start time
    // var startTime = new Date();
    // later record end time
    var endTime = new Date();
    // console.dir('Now ' + endTime);

    // time difference in ms
    var timeDiff = endTime - startTime;

    // strip the ms
    timeDiff /= 1000;
    timeDiff = Math.floor(timeDiff);


    var timeRemain = 6 * 60 * 60 - timeDiff;


    var remainedHours = timeRemain / 60 / 60;
    remainedHours = Math.round(remainedHours);
    // console.dir('timeDiff ' + elapsedHours);


    return remainedHours;
}
    