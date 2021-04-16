// link to the temporary menu model
const menu = require('../models/menu')

// handle request to get the menu
const getMenu = (req, res) => {
    res.send(menu)
}

// export the controller functions
module.exports = {
    getMenu
}
