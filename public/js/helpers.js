var register = function(Handlebars) {
    var helpers = { // add all helpers as key: value pairs
        // an example of listfood helper to iterate over
        // food items and display these in the page
        listsnack: function (snacks) { 
            var ret ="<ul>";

            for (var i = 0, j = snacks.length; i < j; i++) {
                var snackName = snacks[i].name.slice(0,1).toUpperCase() + snacks[i].name.slice(1);
                ret = ret + 
                    "<a href=\"/customer/menu/" + snacks[i].name + "\">" +
                        "<li> " +
                            "<section id=\"oneFood-picture\">" +
                                "<img class=\"browsePage\" src=\"https://source.unsplash.com/" + snacks[i].image + "\"" + "alt=\"hosted by Unsplash\">" +
                            "</section>" +
                            "<section id=\"foodBrowse\">" +
                                snackName + 
                                "<br>$" + snacks[i].price + 
                            "</section>" +
                        "</li>" +
                    "</a>&nbsp;"
                    
            }

            return ret + "</ul>";
		},

        onesnack: function (snack){
            var snackName = snack.name.slice(0,1).toUpperCase() + snack.name.slice(1);
            ret = 
                "<a href=\"/customer/menu\">" + "<h1>" + snackName + "</h1>" + "</a>" +
                "<section id=\"oneFood-details\">" +
                    "<section id=\"oneFood-picture\">" +
                        "<img class=\"detailsPage\" src=\"https://source.unsplash.com/" + snack.image + "\"" + "alt=\"hosted by Unsplash\">" +
                    "</section>" +
                    "<section id=\"oneFood-text\">" +
                        "<p id=\"description\">" +
                            snack.description + "<br><br>" +
                            "Price: $" + snack.price +
                        "</p>" +
                    "</section>" +
                "</section>"
            return ret;
        },
    };
  
    if (Handlebars && typeof Handlebars.registerHelper === "function") {
      // register helpers
      // for each helper defined above (we have only one, listfood)
      for (var prop in helpers) {
          // we register helper using the registerHelper method
          Handlebars.registerHelper(prop, helpers[prop]);
      }
    } else {
        // just return helpers object if we can't register helpers here
        return helpers;
    }
  
  };
  
  // export helpers to be used in our express app
  module.exports.register = register;
  module.exports.helpers = register(null);    