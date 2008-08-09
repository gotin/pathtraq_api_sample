// ==UserScript==
// @name           pathtraq_sample
// @namespace      http://gomaxfire.dnsdojo.com/
// @require        http://jqueryjs.googlecode.com/files/jquery-1.2.6.js
// @require        http://flot.googlecode.com/files/jquery.flot-0.1.pack.js
// @require        http://github.com/gotin/chain/tree/master%2Fchain.js?raw=true
// @require        http://github.com/gotin/gm_utils/tree/master%2Futil.js?raw=true
// @description    simple sample of pathtraq api
// @include        *
// ==/UserScript==

var urls = {};
"basic next prev".split(" ").forEach(function(type){urls[type] = pathtraq_url(type);});
urls.chart = "http://api.pathtraq.com/page_chart&url=" + document.location.href;

var actions = make_actions(urls);

var action_map = {
  "S-n":{action:"prev", title:"after web pages"},
  "S-enter":{action:"basic",title:"popular pages in this site"},
  "S-p":{action:"next", title:"previous web pages"},
  "S-c":{action:"chart", title:"access chart"}
};

var container = null;

for(var phrase in action_map){
  (function(phrase){
     var action = action_map[phrase];
     var action_title = action.title;
     Keybind.add(phrase,
                 function(){
                   actions[action.action](
                     action_title,
                     function(data){
                       view(action_title, data);
                     }
                   );
                 });
   })(phrase);
}
Keybind.add("S-escape",
            function(){
              container && ($rm(container), (container=null));

            });

function chart(data){
  var graph = [];
  var plots = data.plots;
  var step = data.step;
  for(var i=0,l=plots.length;i<l;i++){
    graph.push([i*step,plots[i]]);
  }
  var div = $div();
  $.plot($(div),[graph]);
  $add(container, div);
}


function view(action_title, data){
  if(action_title=="chart") return chart(data);
  if(!data) {no_data(); return; }
  var title = data.title;
  var link = data.link;
  var items = data.items;
  if(!items||!items.length){no_data();return; }
  var div = $add($div({}),
                 $add($div({},{backgroundColor:"#FFF", margin:"2px", padding:"2px", color:"#000"}),
                      $a({textContent:title, href:link},{color:"#009"}),
                      $text("("+items.length+")")));
  $add(container, div);



  items.forEach(
    function(item){
      with(item){
        $add(div,
             $add($div({},{backgroundColor:"#EEE",color:"#000", margin:"1px 2px", padding:"1px"}),
                  $a({textContent:title, href:link},{color:"#009"}),
                  $text("(" + item["pathtraq:hits"] +")")));
      }
    });

  function no_data(){
    $C()
    (
      function(){
        $add(container, $div({textContent:"no data"}));
      }
    )(
      $C.wait(1000)
    )(
      function(){
        $rm(container);
        container = null;
      }
    )();
  }
}


function make_actions(urls){
  var result = {};
  for(var type in urls){
    result[type] = (function(url){ return function(title, func){check(url, title, func);};})(urls[type]);
  }
  return result;
}

function pathtraq_url(type){
  type.match(/basic/i) && (type = "");
  type && (type.match(/site:$/i) || (type += "site:"));
  type || (type = "");

  return "http://api.pathtraq.com/pages?api=json&m=popular&url=" + type + document.location.href;
}


function check(url, title, func){
  var container = loadStart(title);
  $C.xhr_json(url)(function(data){$rm(container);return data;})(func)();
}


var loadImg = 'data:application/octet-stream;base64,'+
  'R0lGODlhEAAQAPYAAAAAAAEBAQICAgMDAwQEBAUFBQYGBgcHBwkJCQoKCgwMDA0NDQ4ODg8PDxQU'+
  'FB0dHSEhISMjIyQkJCgoKCkpKSsrKy0tLTAwMDIyMjQ0NDU1NTk5OTs7Ozw8PD4+PkBAQFNTU1hY'+
  'WFpaWl9fX2JiYmpqamxsbHJycoGBgZWVlZmZmZqampycnJ2dnZ6enqKioqSkpKioqKqqqqysrK+v'+
  'r7GxsbKysr29vcbGxsrKyuXl5enp6erq6v///wgICAsLCxAQEBUVFRYWFhkZGRsbGx4eHiUlJSoq'+
  'Ki8vLzExMTMzM0NDQ0lJSU9PT1FRUVdXV2BgYGFhYWRkZGVlZWdnZ2hoaHNzc3V1dXh4eHt7e3x8'+
  'fIWFhZGRkbCwsMfHx8nJydbW1tjY2NnZ2dvb293d3d/f3+Li4ubm5ujo6Ozs7BMTEycnJywsLFtb'+
  'W2lpaYODg6urq66urrS0tOvr6+3t7RgYGD8/P25ubq2trbOzs9XV1eDg4Jubm6OjowAAAAAAACH/'+
  'C05FVFNDQVBFMi4wAwEAAAAh/i1NYWRlIGJ5IEtyYXNpbWlyYSBOZWpjaGV2YSAod3d3LmxvYWRp'+
  'bmZvLm5ldCkAIfkEAQoAAAAsAAAAABAAEAAABoxAgHDIodE4w6RwIHDgej2cQymkpFSjHZRXCQyS'+
  'gpROZ7tBbY7M5btcjWWT0+lR2GgISQxs5lEaCkMBHSUaCFQAAQkCABE1OS0Lhw8hFYyOLgySlIgd'+
  'JpWHiYtCARQXeEkKCUoSLzEXqCQiB0kQLC+VFhaJIiAGSQEQEgENKCgNAAe+hwAEHx+ny9FDQQAh'+
  '+QQBCgAAACwAAAAAEAAQAAAHnYAAgoNAIiJAg4mJAVlmZlkED0QBiT9OT0MzOjpdWmVjU4lOXjkk'+
  'U2FgXGc9PWJEg09fOVQESUgYO6xkD4MMUFVCgwVbaWhWlABBGAqKAAYWRwmUBlg2Uc2CQR9FztXX'+
  '2NrcyUoL2AABBwKJCwzNCD6KPiZX7YMITUwGiQdSJuVGRgL4YLKEQDwEABSYMMHMQAFzAARo0KAO'+
  'okVBgQAAIfkEAQoAAAAsAAAAABAAEAAAB5mAAIKDAhERAoOJih02Nh0ABAOKARASACU5OW4YLCkU'+
  'iRAsLxRHLi4aMDo6KYiCEi8xFwAMCwlwqiqSggJsFwSJHnByUGqCBA0BioJrN3M4HAAfbxbKACc9'+
  '2HHR09XX2ZANrYpFNnTPgwkKygUObA6DB20k6oMGGxm/9SBtCQAPDwAKaLigq94BAAmePOkXqdqu'+
  'ChXEOZwoKBAAIfkEAQoAAAAsAAAAABAAEAAAB5qAAIKDAAYGhIiEDlhYDomDPggASnh4GApPTgmE'+
  'B1ImCgpRUT9QOV5OhD4mVwyEVDlfT4gLrYRCVCR1AYIDC7uJBVM0WUAAGndGj0lgOmUixsiPF3rN'+
  'z72/hAVJXHnEkJKDBVtzaFoEgwZMTeAAbDs9PWQPgwRLTD4AQWpHZ/BiRNkOHbBjJ4GVPWOmPAIQ'+
  'oEiRAAMeEMG28FEgACH5BAEKAAAALAAAAAAQABAAAAaLQIBwSCwaAYTPh3AUGg6ABgrVCEggAaIB'+
  'JEoELBZA5cWCEA8ikoJ4ib0kxcSaSLhQskKBt1kxdbIVIQ9HDC45NRFigkcLLYeJenhFCBolf0MF'+
  'BkUeMzAYdBobBQ8nJxMyOjorA0MDFxkONj09NzapKQJEAwEVPLM7IyopFEcOOLM4DgKsTR00NB1G'+
  'QQAh+QQBCgAAACwAAAAAEAAQAAAHnoAAgoOEhYYAAhoaAoeCBQYACiYmCgAIPoUES0w+AUZGAAsm'+
  'UgeEBkxNCIQMVyaYhD6qhQwLhAIHAY0LSkGCRR+9h1E2WJC/wYbDxQABCUcWkIUKGMEBVmhpWwWD'+
  'QlVQDIMPZD09OxhISQRUOV9Pg0Ri5GdcYGFTJDleToRTY2VaXXTomDHkiZMfhAIQeUAgixkzWXI1'+
  'EgREhAgghgIBACH5BAEKAAAALAAAAAAQABAAAAeYgACCg4SFhgACFRUCh4IDBAAJT08JAAcGhQMX'+
  'GgUADw+RIiCYgwQZG6SCCiQiB4MObA6dhQqVghw4dDaghgINkHE9wieHFm8fAMHDxccAuHM3a4cB'+
  'v4JqI3lwHoQEF4uDAyo6OnAJCwwAFzEvEoMCKeN9Gi4uRxQvLBCEFCl8SW45cpQAIAFCgEyQOtiw'+
  '0aERIQERIjAqFAgAIfkEAQoAAAAsAAAAABAAEAAAB5qAAIKDhIWDAUQPAwFFRQGGglNjZVYJdnYH'+
  'AAYFhERiPT1nR2pBAD5MSwSDD2SgO2yDCE1MBoMEWmhzW5yxPoNAWXlcSbyEAQsDACJlOnoXkEZ3'+
  'GsrMYEnQ0gDANFPFxsiCAXUkVEKFDAuFT185VIQMVya+g05eOVA/UVEKCiZSmYMSOHmiAAMePEoA'+
  'IJgHyQEWLA4gGTJQy1AgADs=';

function loadStart(title){
  container && ($rm(container));
  container = $div({},
                   {
                     position:"fixed",
                     right:"0",
                     bottom:"0",
                     backgroundColor:"#000",
                     fontFamily : "courier new",
                     fontSize: "10pt",
                     padding:"5px",
                     letterSpacing:"0.03em",
                     lineHeight:"1.2em",
                     color:"white",
                     textAlign:"left",
                     zIndex:"9999999"
                   });
  $add(document.body, container);

  container.style.display = "block";
  var div = $div({textContent:title + " posting..."});
  $add(container,
       $add(div,
            $img({src:loadImg})));
  return div;
}