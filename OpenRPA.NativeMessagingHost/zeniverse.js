// https://developer.chrome.com/apps/manifest/key

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

if (inIframe() == true) {
    console.debug('skip declaring zeniverse class');
    document.zeniverse = {};
}
if (typeof document.zeniverse === 'undefined') {
    console.debug('declaring zeniverse class 4');
    document.zeniverse = {};
    var last_mousemove = null;
    var cache = {};
    var cachecount = 0;
    var zeniverse = {
        ping: function () {
            return "pong";
        },
        init: function () {
            document.addEventListener('click', function (e) { zeniverse.pushEvent('click', e); }, true);
            document.addEventListener('keydown', function (e) { zeniverse.pushEvent('keydown', e); }, true);
            document.addEventListener('keypress', function (e) { zeniverse.pushEvent('keyup', e); }, true);
            document.addEventListener('mousedown', function (e) { zeniverse.pushEvent('mousedown', e); }, true);
            document.addEventListener('mousemove', function (e) { zeniverse.pushEvent('mousemove', e); }, true);
        },
        findform: function (element) {
            try {
                var form = null;
                var ele = element;
                while (ele && !form) {
                    var name = ele.localName;
                    if (!name) {
                        ele = ele.parentNode;
                        continue;
                    }
                    name = name.toLowerCase();
                    if (name === "form") form = ele;
                    ele = ele.parentNode;
                }
                return form;
            } catch (e) {
                console.error(e);
                return null;
            }
        },
        clickelement: function (message) {
            var ele = null;
            if (ele === null && message.zn_id !== null && message.zn_id !== undefined && message.zn_id > -1) {
                message.xPath = '//*[@zn_id="' + message.zn_id + '"]';
            }
            if (message.xPath) {
                var xpathEle = document.evaluate(message.xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (xpathEle === null) message.xPath = 'false';
                if (xpathEle !== null) message.xPath = 'true';
                ele = xpathEle;
            }
            if (message.cssPath && ele === null) {
                var cssEle = document.querySelector(message.cssPath);
                if (cssEle === null) message.cssPath = 'false';
                if (cssEle !== null) message.cssPath = 'true';
                ele = cssEle;
            }
            try {
                if (ele !== null && ele !== undefined) {
                    var events = ["mousedown", "mouseup", "click"];
                    for (var i = 0; i < events.length; ++i) {
                        simulate(ele, events[i]);
                    }
                }
            } catch (e) {
                console.log(e);
                message.error = e;
            }
            var test = JSON.parse(JSON.stringify(message));
            return test;
        },
        getelements: function (message) {
            var fromele = null;
            if (message.fromxPath != null && message.fromxPath != "") {
                if (message.fromxPath != null && message.fromxPath != "") {
                    // console.log("fromele = document.evaluate('" + message.fromxPath + "', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;");
                    fromele = document.evaluate(message.fromxPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                } else if (message.fromcssPath != null && message.fromcssPath != "") {
                    // console.log("fromele = document.querySelector('" + message.fromcssPath + "');");
                    fromele = document.querySelector(message.fromcssPath);
                }
                if (fromele == null) {
                    var test = JSON.parse(JSON.stringify(message));
                    return test;
                }
            }
            var ele = [];
            if (ele === null && message.zn_id !== null && message.zn_id !== undefined && message.zn_id > -1) {
                message.xPath = '//*[@zn_id="' + message.zn_id + '"]';
            }
            if (ele.length === 0 && message.xPath && fromele == null) {
                //var iterator = document.evaluate(message.xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                var iterator = document.evaluate(message.xPath, document, null, XPathResult.ANY_TYPE, null);
                // console.log("document.evaluate('" + message.xPath + "', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);");
                try {
                    var thisNode = iterator.iterateNext();

                    while (thisNode) {
                        ele.push(thisNode);
                        thisNode = iterator.iterateNext();
                    }
                }
                catch (e) {
                    console.error('Error: Document tree modified during iteration ' + e);
                }
                // console.log(ele);
                if (ele.length === 0) message.xPath = 'false';
                if (ele.length > 0) message.xPath = 'true';
            }
            if (ele.length === 0 && message.cssPath) {
                if (fromele == null) {
                    ele = document.querySelectorAll(message.cssPath);
                    // console.log("document.querySelector('" + message.cssPath + "');");
                } else {
                    ele = fromele.querySelectorAll(message.cssPath);
                    // console.log("fromele.querySelector('" + message.cssPath + "');");
                }
                
                if (ele.length === 0) message.cssPath = 'false';
                if (ele.length > 0) message.cssPath = 'true';
                // console.log(ele);
            }
            message.result = [];
            if (ele.length > 0) {
                try {
                    for (var i = 0; i < ele.length; i++) {
                        var result = {};
                        if (message.data === 'getdom') {
                            result = zeniverse.mapDOM(ele[i], false, true);
                        }
                        else {
                            result = zeniverse.mapDOM(ele[i], false);
                        }
                        try {
                            zeniverse.applyPhysicalCords(result, ele[i]);
                        } catch (e) {
                            console.error(e);
                        }
                        message.result.push(result);
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
            }
            message.result = JSON.stringify(message.result);
            //return simpleStringify(message);
            var test = JSON.parse(JSON.stringify(message));
            return test;
        },
        getelement: function (message) {
            var ele = null;
            if (ele === null && message.zn_id !== null && message.zn_id !== undefined && message.zn_id > -1) {
                message.xPath = '//*[@zn_id="' + message.zn_id + '"]';
            }
            if (ele === null && message.xPath) {
                var xpathEle = document.evaluate(message.xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                // console.log("document.evaluate('" + message.xPath + "', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;");
                if (xpathEle === null) message.xPath = 'false';
                if (xpathEle !== null) message.xPath = 'true';
                ele = xpathEle;
                // console.log(ele);
            }
            if (ele === null && message.cssPath) {
                var cssEle = document.querySelector(message.cssPath);
                // console.log("document.querySelector('" + message.cssPath + "');");
                if (cssEle === null) message.cssPath = 'false';
                if (cssEle !== null) message.cssPath = 'true';
                ele = cssEle;
                // console.log(ele);
            }
            if (ele !== null && ele !== undefined) {
                try {
                    try {
                        zeniverse.applyPhysicalCords(message, ele);
                    } catch (e) {
                        console.error(e);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            if (ele !== null) {
                if (message.data === 'getdom') {
                    message.result = zeniverse.mapDOM(ele, true, true);
                }
                else {
                    message.result = zeniverse.mapDOM(ele, true);
                }
            }
            //return simpleStringify(message);
            var test = JSON.parse(JSON.stringify(message));
            return test;
        },
        updateelementvalue: function (message) {
            var ele = null;
            if (ele === null && message.zn_id !== null && message.zn_id !== undefined && message.zn_id > -1) {
                message.xPath = '//*[@zn_id="' + message.zn_id + '"]';
                var znEle = document.evaluate(message.xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (znEle === null) message.xPath = 'false';
                if (znEle !== null) message.xPath = 'true';
                ele = znEle;
            }
            if (ele === null && message.xPath) {
                var xpathEle = document.evaluate(message.xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (xpathEle === null) message.xPath = 'false';
                if (xpathEle !== null) message.xPath = 'true';
                ele = xpathEle;
            }
            if (ele === null && message.cssPath) {
                var cssEle = document.querySelector(message.cssPath);
                if (cssEle === null) message.cssPath = 'false';
                if (cssEle !== null) message.cssPath = 'true';
                ele = cssEle;
            }
            if (ele) {
                ele.value = message.data;
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("change", false, true);
                ele.dispatchEvent(evt);
            }
            var test = JSON.parse(JSON.stringify(message));
            return test;
        },
        applyPhysicalCords: function (message, ele) {
            var ClientRect = ele.getBoundingClientRect();
            var devicePixelRatio = window.devicePixelRatio || 1;
            var scrollLeft = (((t = document.documentElement) || (t = document.body.parentNode)) && typeof t.scrollLeft === 'number' ? t : document.body).scrollLeft;
            message.x = Math.floor(ClientRect.left);
            message.y = Math.floor(ClientRect.top);
            message.width = Math.floor(ele.offsetWidth);
            message.height = Math.floor(ele.offsetHeight);
            message.uiwidth = Math.round(ele.offsetWidth * devicePixelRatio);
            message.uiheight = Math.round(ele.offsetHeight * devicePixelRatio);
            message.uix = Math.round((ClientRect.left - scrollLeft) * devicePixelRatio);
            message.uiy = Math.round((ClientRect.top * devicePixelRatio) + (window.outerHeight - (window.innerHeight * devicePixelRatio))); //+ (window.outerHeight - window.innerHeight));
            var isAtMaxWidth = screen.availWidth - window.innerWidth === 0;
            if (isAtMaxWidth) {
                var isFirefox = typeof InstallTrigger !== 'undefined';
                if (isFirefox) {
                    message.uix += 8;
                    message.uiy -= 7;
                } else {
                    message.uix += 8;
                    message.uiy += 8;
                }
            } else {
                message.uix += 7;
                message.uiy -= 7;
            }
        },
        getOffset: function (el) {
            var _x = 0;
            var _y = 0;
            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                _x += el.offsetLeft - el.scrollLeft;
                _y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            return { top: _y, left: _x };
        },
        pushEvent: function (action, event) {
            let frame = zeniverse.getFrameName(self);
            if (action === 'keydown') {
                chrome.runtime.sendMessage({ functionName: action, key: String.fromCharCode(event.which) });
            }
            else if (action === 'keyup') {
                chrome.runtime.sendMessage({ functionName: action, key: String.fromCharCode(event.which) });
            }
            else {
                // https://www.jeffersonscher.com/res/resolution.php

                // https://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window

                var message = { functionName: action, frame: frame };
                var targetElement = event.target || event.srcElement;
                if (action === 'mousemove') {
                    //https://stackoverflow.com/questions/49798103/google-chrome-mouseover-event
                    if (targetElement === last_mousemove) return;
                    last_mousemove = targetElement;
                    //if (targetElement !== null) {
                    //    var dom = zeniverse.mapDOM(targetElement, true);
                    //    message.result = dom;
                    //}
                }
                try {
                    zeniverse.applyPhysicalCords(message, targetElement);
                } catch (e) {
                    console.error(e);
                }
                //xPath: UTILS.xPath(targetElement, true), cssPath: UTILS.cssPath(targetElement)
                message.cssPath = UTILS.cssPath(targetElement);
                message.xPath = UTILS.xPath(targetElement, true);
                message.zn_id = zeniverse.getuniqueid(targetElement);
                message.c = targetElement.childNodes.length;
                message.result = zeniverse.mapDOM(targetElement, true);
                chrome.runtime.sendMessage(message);
            }
        },
        getuniqueid: function (element) {
            if (element === null || element === undefined) return null;
            if (element.attributes === null || element.attributes === undefined) return null;
            for (var r = 0; r < element.attributes.length; r++) {
                var name = element.attributes[r].nodeName;
                if (name === 'zn_id') return element.attributes[r].nodeValue;
            }
            if (element === null || element === undefined) return null;
            if (element.attributes === null || element.attributes === undefined) return null;
            ++cachecount;
            element.setAttribute('zn_id', cachecount);
            return cachecount;
        },

        fullPath: function (el) {
            var names = [];
            while (el.parentNode) {
                if (el.id) {
                    names.unshift('#' + el.id);
                    break;
                } else {
                    if (el === el.ownerDocument.documentElement) names.unshift(el.tagName);
                    else {
                        for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
                        names.unshift(el.tagName + ":nth-child(" + c + ")");
                    }
                    el = el.parentNode;
                }
            }
            return names.join(" > ");
        },
        toJSON: function (node, maxiden, ident) {
            if (ident === null || ident === undefined) ident = 0;
            if (maxiden === null || maxiden === undefined) ident = 1;

            node = node || this;
            var obj = {
                nodeType: node.nodeType
            };
            if (node.tagName) {
                obj.tagName = node.tagName.toLowerCase();
            } else
                if (node.nodeName) {
                    obj.nodeName = node.nodeName;
                }
            if (node.nodeValue) {
                obj.nodeValue = node.nodeValue;
            }
            var attrs = node.attributes;
            if (attrs) {
                var length = attrs.length;
                var arr = obj.attributes = new Array(length);
                for (var i = 0; i < length; i++) {
                    attr = attrs[i];
                    arr[i] = [attr.nodeName, attr.nodeValue];
                }
            }
            var childNodes = node.childNodes;
            if (childNodes && ident < maxiden) {
                length = childNodes.length;
                arr = obj.childNodes = new Array(length);
                for (i = 0; i < length; i++) {
                    arr[i] = zeniverse.toJSON(childNodes[i], maxiden, ident + 1);
                }
            }
            return obj;
        },
        toDOM: function (obj) {
            if (typeof obj === 'string') {
                obj = JSON.parse(obj);
            }
            var node, nodeType = obj.nodeType;
            switch (nodeType) {
                case 1: //ELEMENT_NODE
                    node = document.createElement(obj.tagName);
                    var attributes = obj.attributes || [];
                    for (var i = 0, len = attributes.length; i < len; i++) {
                        var attr = attributes[i];
                        node.setAttribute(attr[0], attr[1]);
                    }
                    break;
                case 3: //TEXT_NODE
                    node = document.createTextNode(obj.nodeValue);
                    break;
                case 8: //COMMENT_NODE
                    node = document.createComment(obj.nodeValue);
                    break;
                case 9: //DOCUMENT_NODE
                    node = document.implementation.createDocument();
                    break;
                case 10: //DOCUMENT_TYPE_NODE
                    node = document.implementation.createDocumentType(obj.nodeName);
                    break;
                case 11: //DOCUMENT_FRAGMENT_NODE
                    node = document.createDocumentFragment();
                    break;
                default:
                    return node;
            }
            if (nodeType === 1 || nodeType === 11) {
                var childNodes = obj.childNodes || [];
                for (i = 0, len = childNodes.length; i < len; i++) {
                    node.appendChild(zeniverse.toDOM(childNodes[i]));
                }
            }
            return node;
        },
        mapDOM: function (element, json, mapdom) {
            var maxiden = 40;
            if (mapdom !== true) maxiden = 1;
            if (maxiden === null || maxiden === undefined) maxiden = 20;
            var treeObject = {};
            // If string convert to document Node
            if (typeof element === "string") {
                if (window.DOMParser) {
                    parser = new DOMParser();
                    docNode = parser.parseFromString(element, "text/xml");
                } else { // Microsoft strikes again
                    docNode = new ActiveXObject("Microsoft.XMLDOM");
                    docNode.async = false;
                    docNode.loadXML(element);
                }
                element = docNode.firstChild;
            }
            //Recursively loop through DOM elements and assign properties to object
            function treeHTML(element, object, maxiden, ident) {
                if (ident === null || ident === undefined) ident = 0;
                if (maxiden === null || maxiden === undefined) maxiden = 1;
                zeniverse.getuniqueid(element);
                object["tagName"] = element.tagName;
                if (ident === 0) {
                    object["xPath"] = UTILS.xPath(element, true);
                    object["cssPath"] = UTILS.cssPath(element);
                    if (object["tagName"] !== 'STYLE' && object["tagName"] !== 'SCRIPT' && object["tagName"] !== 'HEAD' && object["tagName"] !== 'HTML') {
                        if (element.innerText !== undefined && element.innerText !== null && element.innerText !== '') {
                            object["innerText"] = element.innerText;
                        }
                    }
                }
                var nodeList = element.childNodes;
                if (nodeList) {
                    if (nodeList.length) {
                        object["content"] = [];
                        for (var i = 0; i < nodeList.length; i++) {
                            if (nodeList[i].nodeType === 3) {
                                if (mapdom !== true) {
                                    if (object["tagName"] !== 'STYLE' && object["tagName"] !== 'SCRIPT' && object["tagName"] !== 'HEAD') {
                                        object["content"].push(nodeList[i].nodeValue);
                                    }
                                }
                            } else {
                                if (ident < maxiden) {
                                    object["content"].push({});
                                    treeHTML(nodeList[i], object["content"][object["content"].length - 1], maxiden, ident + 1);
                                }
                            }
                        }
                    }
                }
                if (element.attributes) {
                    if (element.attributes.length) {
                        var wasDisabled = false;
                        // To read values of disabled objects, we need to undisable them
                        //if (element.disabled === true) {
                        //    console.log('removing disabled!!!!');
                        //    wasDisabled = true;
                        //    //element.disabled == false;
                        //    element.removeAttribute("disabled");
                        //}
                        var attributecount = 0;
                        //object["attributes"] = {};
                        
                        if (element.attributes["zn_id"] == undefined || element.attributes["zn_id"] == null) {
                            var zn_id = zeniverse.getuniqueid(element);
                        }
                        object["zn_id"] = element.attributes["zn_id"].nodeValue;
                        for (var r = 0; r < element.attributes.length; r++) {
                            var name = element.attributes[r].nodeName;
                            var value = element.attributes[r].nodeValue;
                            // value, innertext
                            if (ident === 0) {
                                if (mapdom !== true || name.toLowerCase() === 'zn_id') {
                                    object[name] = value;
                                    ++attributecount;
                                }
                                //if (['zn_id', 'id', 'classname', 'name', 'tagname', 'href', 'src', 'alt', 'clientrects'].includes(name.toLowerCase())) {
                                //    //object["attributes"][name] = value;
                                //    object[name] = value;
                                //    ++attributecount;
                                //}
                            }
                            else if (ident > 0 && mapdom === true) {
                                if (name.toLowerCase() === 'zn_id') {
                                    //object["attributes"][name] = value;
                                    object[name] = value;
                                    ++attributecount;
                                }
                            }
                        }
                        //if (attributecount === 0) delete object["attributes"];
                        if (wasDisabled === true) {
                            if (ident === 0) {
                                //element.disabled == true;
                                element.setAttribute("disabled", "true");
                            }
                        }
                    }
                }
            }
            treeHTML(element, treeObject, maxiden);
            treeObject["value"] = element.value;
            treeObject["isvisible"] = zeniverse.isVisible(element);
            treeObject["display"] = zeniverse.display(element);
            treeObject["isvisibleonscreen"] = zeniverse.isVisibleOnScreen(element);
            treeObject["disabled"] = element.disabled;
            if (treeObject["disabled"] === null || treeObject["disabled"] === undefined) treeObject["disabled"] = false;
            return json ? JSON.stringify(treeObject) : treeObject;
        },
        isVisibleOnScreen: function (elm) {
            var rect = elm.getBoundingClientRect();
            var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
            return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
        },
        isVisible: function (elm) {
            return elm.offsetWidth > 0 && elm.offsetHeight > 0;
        },
        display: function (elm) {
            return window.getComputedStyle(elm, null).getPropertyValue('display');
        },
        getFrameName: function (frame) {
            var frames = parent.frames,
                l = frames.length,
                name = null;
            for (var x = 0; x < l; x++) {
                if (frames[x] === frame) {
                    name = frames[x].name;
                }
            }
            return name;
        },
        screenInfo: function () {
            return {
                screen: {
                    availTop: window.screen.availTop,
                    availLeft: window.screen.availLeft,
                    availHeight: window.screen.availHeight,
                    availWidth: window.screen.availWidth,
                    colorDepth: window.screen.colorDepth,
                    height: window.screen.height,
                    left: window.screen.left,
                    orientation: window.screen.orientation,
                    pixelDepth: window.screen.pixelDepth,
                    top: window.screen.top,
                    width: window.screen.width
                },
                screenX: window.screenX,
                screenY: window.screenY,
                screenLeft: window.screenLeft,
                screenTop: window.screenTop
            };
        }

    };
    document.zeniverse = zeniverse;
    zeniverse.init();



    function simulate(element, eventName) {
        var options = extend(defaultOptions, arguments[2] || {});
        var oEvent, eventType = null;

        for (var name in eventMatchers) {
            if (eventMatchers[name].test(eventName)) { eventType = name; break; }
        }

        if (!eventType)
            throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

        if (document.createEvent) {
            oEvent = document.createEvent(eventType);
            if (eventType == 'HTMLEvents') {
                oEvent.initEvent(eventName, options.bubbles, options.cancelable);
            }
            else {
                oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                    options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
            }
            element.dispatchEvent(oEvent);
        }
        else {
            options.clientX = options.pointerX;
            options.clientY = options.pointerY;
            var evt = document.createEventObject();
            oEvent = extend(evt, options);
            element.fireEvent('on' + eventName, oEvent);
        }
        return element;
    }

    function extend(destination, source) {
        for (var property in source)
            destination[property] = source[property];
        return destination;
    }

    var eventMatchers = {
        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
    }
    var defaultOptions = {
        pointerX: 0,
        pointerY: 0,
        button: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        bubbles: true,
        cancelable: true
    }



    // https://chromium.googlesource.com/chromium/blink/+/master/Source/devtools/front_end/components/DOMPresentationUtils.js
    // https://gist.github.com/asfaltboy/8aea7435b888164e8563
    /*
     * Copyright (C) 2015 Pavel Savshenko
     * Copyright (C) 2011 Google Inc.  All rights reserved.
     * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
     * Copyright (C) 2008 Matt Lilek <webkit@mattlilek.com>
     * Copyright (C) 2009 Joseph Pecoraro
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions
     * are met:
     *
     * 1.  Redistributions of source code must retain the above copyright
     *     notice, this list of conditions and the following disclaimer.
     * 2.  Redistributions in binary form must reproduce the above copyright
     *     notice, this list of conditions and the following disclaimer in the
     *     documentation and/or other materials provided with the distribution.
     * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
     *     its contributors may be used to endorse or promote products derived
     *     from this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
     * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
     * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
     * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
     * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
     * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
     * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */

    var UTILS = {};
    UTILS.xPath = function (node, optimized) {
        if (node.nodeType === Node.DOCUMENT_NODE)
            return "/";
        var steps = [];
        var contextNode = node;
        while (contextNode) {
            var step = UTILS._xPathValue(contextNode, optimized);
            if (!step)
                break; // Error - bail out early.
            steps.push(step);
            if (step.optimized)
                break;
            contextNode = contextNode.parentNode;
        }
        steps.reverse();
        return (steps.length && steps[0].optimized ? "" : "/") + steps.join("/");
    };
    UTILS._xPathValue = function (node, optimized) {
        var ownValue;
        var ownIndex = UTILS._xPathIndex(node);
        if (ownIndex === -1)
            return null; // Error.
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                if (optimized && node.getAttribute("id"))
                    return new UTILS.DOMNodePathStep("//*[@id=\"" + node.getAttribute("id") + "\"]", true);
                ownValue = node.localName;
                break;
            case Node.ATTRIBUTE_NODE:
                ownValue = "@" + node.nodename;
                break;
            case Node.TEXT_NODE:
            case Node.CDATA_SECTION_NODE:
                ownValue = "text()";
                break;
            case Node.PROCESSING_INSTRUCTION_NODE:
                ownValue = "processing-instruction()";
                break;
            case Node.COMMENT_NODE:
                ownValue = "comment()";
                break;
            case Node.DOCUMENT_NODE:
                ownValue = "";
                break;
            default:
                ownValue = "";
                break;
        }
        if (ownIndex > 0)
            ownValue += "[" + ownIndex + "]";
        return new UTILS.DOMNodePathStep(ownValue, node.nodeType === Node.DOCUMENT_NODE);
    };

    UTILS._xPathValue = function (node, optimized) {
        var ownValue;
        var ownIndex = UTILS._xPathIndex(node);
        if (ownIndex === -1)
            return null; // Error.
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                if (optimized && node.getAttribute("id"))
                    return new UTILS.DOMNodePathStep("//*[@id=\"" + node.getAttribute("id") + "\"]", true);
                ownValue = node.localName;
                break;
            case Node.ATTRIBUTE_NODE:
                ownValue = "@" + node.nodename;
                break;
            case Node.TEXT_NODE:
            case Node.CDATA_SECTION_NODE:
                ownValue = "text()";
                break;
            case Node.PROCESSING_INSTRUCTION_NODE:
                ownValue = "processing-instruction()";
                break;
            case Node.COMMENT_NODE:
                ownValue = "comment()";
                break;
            case Node.DOCUMENT_NODE:
                ownValue = "";
                break;
            default:
                ownValue = "";
                break;
        }
        if (ownIndex > 0)
            ownValue += "[" + ownIndex + "]";
        return new UTILS.DOMNodePathStep(ownValue, node.nodeType === Node.DOCUMENT_NODE);
    };
    UTILS._xPathIndex = function (node) {
        // Returns -1 in case of error, 0 if no siblings matching the same expression, <XPath index among the same expression-matching sibling nodes> otherwise.
        function areNodesSimilar(left, right) {
            if (left === right)
                return true;
            if (left.nodeType === Node.ELEMENT_NODE && right.nodeType === Node.ELEMENT_NODE)
                return left.localName === right.localName;
            if (left.nodeType === right.nodeType)
                return true;
            // XPath treats CDATA as text nodes.
            var leftType = left.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : left.nodeType;
            var rightType = right.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : right.nodeType;
            return leftType === rightType;
        }
        var siblings = node.parentNode ? node.parentNode.children : null;
        if (!siblings)
            return 0; // Root node - no siblings.
        var hasSameNamedElements;
        for (var i = 0; i < siblings.length; ++i) {
            if (areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
                hasSameNamedElements = true;
                break;
            }
        }
        if (!hasSameNamedElements)
            return 0;
        var ownIndex = 1; // XPath indices start with 1.
        for (var z = 0; z < siblings.length; ++z) {
            if (areNodesSimilar(node, siblings[z])) {
                if (siblings[z] === node)
                    return ownIndex;
                ++ownIndex;
            }
        }
        return -1; // An error occurred: |node| not found in parent's children.
    };


    function simpleStringify(object) {
        var simpleObject = {};
        for (var prop in object) {
            if (!object.hasOwnProperty(prop)) {
                continue;
            }
            if (typeof object[prop] === 'object') {
                continue;
            }
            if (typeof object[prop] === 'function') {
                continue;
            }
            simpleObject[prop] = object[prop];
        }
        return simpleObject; // returns cleaned up JSON
    }



    UTILS.cssPath = function (node, optimized) {
        if (node.nodeType !== Node.ELEMENT_NODE)
            return "";
        var steps = [];
        var contextNode = node;
        while (contextNode) {
            var step = UTILS._cssPathStep(contextNode, !!optimized, contextNode === node);
            if (!step)
                break; // Error - bail out early.
            steps.push(step);
            if (step.optimized)
                break;
            contextNode = contextNode.parentNode;
        }
        steps.reverse();
        return steps.join(" > ");
    };
    UTILS._cssPathStep = function (node, optimized, isTargetNode) {
        if (node.nodeType !== Node.ELEMENT_NODE)
            return null;

        var id = node.getAttribute("id");
        if (optimized) {
            if (id)
                return new UTILS.DOMNodePathStep(idSelector(id), true);
            var nodeNameLower = node.nodeName.toLowerCase();
            if (nodeNameLower === "body" || nodeNameLower === "head" || nodeNameLower === "html")
                return new UTILS.DOMNodePathStep(node.nodeName.toLowerCase(), true);
        }
        var nodeName = node.nodeName.toLowerCase();

        if (id)
            return new UTILS.DOMNodePathStep(nodeName.toLowerCase() + idSelector(id), true);
        var parent = node.parentNode;
        if (!parent || parent.nodeType === Node.DOCUMENT_NODE)
            return new UTILS.DOMNodePathStep(nodeName.toLowerCase(), true);
        function prefixedElementClassNames(node) {
            var classAttribute = node.getAttribute("class");
            if (!classAttribute)
                return [];

            return classAttribute.split(/\s+/g).filter(Boolean).map(function (name) {
                // The prefix is required to store "__proto__" in a object-based map.
                return "$" + name;
            });
        }
        function idSelector(id) {
            return "#" + escapeIdentifierIfNeeded(id);
        }
        function escapeIdentifierIfNeeded(ident) {
            if (isCSSIdentifier(ident))
                return ident;
            var shouldEscapeFirst = /^(?:[0-9]|-[0-9-]?)/.test(ident);
            var lastIndex = ident.length - 1;
            return ident.replace(/./g, function (c, i) {
                return shouldEscapeFirst && i === 0 || !isCSSIdentChar(c) ? escapeAsciiChar(c, i === lastIndex) : c;
            });
        }
        function escapeAsciiChar(c, isLast) {
            return "\\" + toHexByte(c) + (isLast ? "" : " ");
        }
        function toHexByte(c) {
            var hexByte = c.charCodeAt(0).toString(16);
            if (hexByte.length === 1)
                hexByte = "0" + hexByte;
            return hexByte;
        }
        function isCSSIdentChar(c) {
            if (/[a-zA-Z0-9_-]/.test(c))
                return true;
            return c.charCodeAt(0) >= 0xA0;
        }
        function isCSSIdentifier(value) {
            return /^-?[a-zA-Z_][a-zA-Z0-9_-]*$/.test(value);
        }
        var prefixedOwnClassNamesArray = prefixedElementClassNames(node);
        var needsClassNames = false;
        var needsNthChild = false;
        var ownIndex = -1;
        var siblings = parent.children;
        for (var i = 0; (ownIndex === -1 || !needsNthChild) && i < siblings.length; ++i) {
            var sibling = siblings[i];
            if (sibling === node) {
                ownIndex = i;
                continue;
            }
            if (needsNthChild)
                continue;
            if (sibling.nodeName.toLowerCase() !== nodeName.toLowerCase())
                continue;

            needsClassNames = true;
            var ownClassNames = prefixedOwnClassNamesArray;
            var ownClassNameCount = 0;
            for (var name in ownClassNames)
                ++ownClassNameCount;
            if (ownClassNameCount === 0) {
                needsNthChild = true;
                continue;
            }
            var siblingClassNamesArray = prefixedElementClassNames(sibling);
            for (var j = 0; j < siblingClassNamesArray.length; ++j) {
                var siblingClass = siblingClassNamesArray[j];
                if (ownClassNames.indexOf(siblingClass))
                    continue;
                delete ownClassNames[siblingClass];
                if (!--ownClassNameCount) {
                    needsNthChild = true;
                    break;
                }
            }
        }

        var result = nodeName.toLowerCase();
        if (isTargetNode && nodeName.toLowerCase() === "input" && node.getAttribute("type") && !node.getAttribute("id") && !node.getAttribute("class"))
            result += "[type=\"" + node.getAttribute("type") + "\"]";
        if (needsNthChild) {
            result += ":nth-child(" + (ownIndex + 1) + ")";
        } else if (needsClassNames) {
            for (var prefixedName in prefixedOwnClassNamesArray)
                // for (var prefixedName in prefixedOwnClassNamesArray.keySet())
                result += "." + escapeIdentifierIfNeeded(prefixedOwnClassNamesArray[prefixedName].substr(1));
        }

        return new UTILS.DOMNodePathStep(result, false);
    };
    UTILS.DOMNodePathStep = function (value, optimized) {
        this.value = value;
        this.optimized = optimized || false;
    };
    UTILS.DOMNodePathStep.prototype = {
        toString: function () {
            return this.value;
        }
    };

}