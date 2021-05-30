var register = function(Handlebars) {
    // add all helpers as key: value pairs
    var helpers = {

        // iterate over food items and display it on the page
        listsnack: function (snacks) { 
            var ret ="<ul>"

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

            return ret + "</ul>"
		},

        onesnack: function (snack) {
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
                        "<form method='post' action='/order/'>" + 
                            "<label for='qty'>Quantity</label>"+
                            "<input name='qty' id='qty' name='qty' value='1'>"+
                            "<button type='submit'>Add To Order</button>"+
                        "</form>"+
                    "</section>" +
                "</section>"
            return ret
        },

        is_equal: function (a, b) {
            return a === b
        },

        json: function (context) {
            return encodeURIComponent(JSON.stringify(context))
        },

    }
  
    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        // register helpers
        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop])
        }
    } else {
        // just return helpers object if we can't register helpers here
        return helpers
    }
  
}
  
// export helpers to be used in our express app
module.exports.register = register
module.exports.helpers = register(null)
