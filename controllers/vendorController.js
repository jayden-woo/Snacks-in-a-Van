const mongoose = require("mongoose")

// import the models used
const Vendor = mongoose.model("Vendor")
const Order = mongoose.model("Order")
const User = mongoose.model("User")

// TODO: IMPLEMET LOGIN

// sign in with username and password
const logIn = (req, res) => {
    User.findOne(
      { $or: [{ password: req.body.password }, { username: req.body.username}] },
      async function (err, user) {
        // couldn't find user in database
        if (!user || err) {
          console.log("User not found");
          req.session.response.success = false;
          req.session.response.errors.push("username/password invalid");
          req.session.save();
          return res.status(401).json(req.session.response);
        }
        // check if the user is a vendor
        if (await Vendor.exists({ userID: user._id })) {
          if (!(await user.comparePassword(req.body.password))) {
            console.log("Wrong password");
            req.session.response.success = false;
            // error message = 'You have entered an invalid username or password'
            req.session.response.errors.push("username/password invalid");
            req.session.save();
            // res.redirect('login')
            return res.status(401).json(req.session.response);
          }
          req.session.user = user;
          req.session.save();
          console.log("Vendor has successfully logged in");
          // res.redirect('login')
          return res.status(req.session.status).json(req.session.response);
        } else {
          console.log("User is not a vendor");
          req.session.response.success = false;
          // error message = 'You have entered an invalid username or password'
          req.session.response.errors.push("username/password invalid");
          req.session.save();
          // res.redirect('login')
          return res.status(401).json(req.session.response);
        }
      }
    );
};

// register a new vendor
const signUp = async (req, res) => {
    // console.log('signUp req', res.body);
    // // check if the input is correctly formed and if the username or email is taken
    // if (!(await validateInput(req))) {
    //   // res.redirect('signup')
    //   return res.status(req.session.status).json(req.session.response);
    // }
  
    // create a new user
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email.toLowerCase(),
    });
    // save user to database
    user.save((err) => {
      if (err) {
        req.session.response.success = false;
        req.session.response.errors.push(err);
        req.session.save();
        // res.redirect('signup')
        return res.status(400).json(req.session.response);
      }
    });
  
    // create a new vendor entry
    const vendor = new Vendor({
      userID: user._id
    });

    // save vendor to database
    vendor.save((err) => {
      if (err) {
        req.session.response.success = false;
        req.session.response.errors.push(err);
        req.session.save();
        // res.redirect('signup')
        return res.status(400).json(req.session.response);
      }
    });
  
    // res.redirect('login')
    return res.status(req.session.status).json(req.session.response);
};



  


// get all the vendors currently in the database
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find( {}, {_id: false} )
            .populate("userID")
            .lean()
        return res.render("vendor/getAllVendors", {"allVendors": vendors})
    } catch (err) {
        return res.status(400).json({error: "Database query failed"})
    }
}

// get the current status of a vendor 
const getVendorByUserID = async (req, res) => {
    try {
        const vendor = await Vendor.findOne( {"userID": req.params.userID} , {_id: false})
        // no vendor was found in database
        if (vendor === null) { 
            return res.status(404).json({error: "Vendor not found"})
        }
        return res.status(200).send(vendor)
    } catch (err) { 
        return res.status(400).json({error: "Database query failed"})
    }
}

// get a list of all the outstanding orders of a vendor
// need to change order schema?
const getOutstandingOrders = async (req, res) => {
    try {
        // find the list of outstanding orders of a vendor and send it back
        const OutstandingOrders = await Order.find( {"vendorID": req.params.vendorID, $or:[{"status": "Cooking"}, {"status": "Ordering"}, {"status": "Fulfilled"}]} )
        res.send(OutstandingOrders)
    // error occurred during the database query
    } catch (err) {
        res.status(400)
        res.send("Database query failed")
    }
}

// get order information using orderID
const getVendorOrderDetails = async (req, res) => {
    try {
        // use vendorID and orderID to get details
        // use order models to look for the order
        const oneOrderDetail = await Order.find( {"vendorID": req.params.vendorID, "orderNumber": req.params.orderID} )
            // populate allows us to use relational data by "populating" the schema with its relevant data
            .populate("customerID")
            // to reference additional schemas, just use another populate() function
            // to populate within another nested array, simply use array.id
            .populate("snacks.snackID")
            .lean()
        // res.send(oneOrderDetail)
        // renders the hdb page and assigns results of array to variabla "orders"
        res.render("vendor/vendorOrderDetails", {"orders": oneOrderDetail})
    } catch (err) {  
        res.status(400)
        res.send("No order found")
    }
}

// get vendor account details by rendering vendorAccount page
// this retrives from the database relevant information
const getVendorAccount = async (req, res) => {
    try {
        const vendorAccount = await Vendor.find( {"userID": req.params.vendorID} )
            .populate("userID")
            .lean()
        res.render("vendor/vendorAccount", {"account": vendorAccount})
    } catch (err) {
        res.status(400)
        res.send("Vendor information not available")
    }
}



// // add a new vendor
// const addVendor = async (req, res) => {
//     // construct a new vendor object from body of the POST request
//     const vendor = await new Vendor(req.body)
//     // save the new vendor to the vendors database
//     vendor.save( (err, result) => {
//         // error occured during saving of a new vendor
//         if (err) res.send(err)
//         // send back vendor details for checking
//         res.send(result)
//     })
// }


// TEMP create 10 vendors with random locations and ids
// create random mongoIDs
const mongoObjectId = function () {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16)
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase()
}
const addVendor = async (req, res) => {
    const coordinates = [
        [144.953552, -37.816904],   // Location 1
        [144.967131, -37.817651],   //          2
        [144.960535, -37.802159],   //          3
        [144.956983, -37.813893],   //          4
        [144.955188, -37.808538],   //          5
        [144.960482, -37.804329],   //          6
        [144.962324, -37.799144],   //          7
        [144.970075, -37.785843],   //          8
        [144.987312, -37.790795],   //          9
        [144.971927, -37.811552]    //          10
    ]
    for (let i=1; i<=10; i++) {
        let vendor = new Vendor({
            userID: mongoObjectId(), 
            isOnline: [3,6,9].includes(i) ? false : true, 
            location: {
                coordinates: coordinates[i-1]
            }, 
            textAddress: "Location " + i
        })
        vendor.save( (err) => {
            if (err) throw err;
        })
    }
    return res.send(await Vendor.find())
}


// update the status of a vendor
const updateVendor = async (req, res) => {
    var {isOnline, latitude, longitude, textAddress} = req.body
    try {
        // change the status if it is in the request body
        if ("isOnline" in req.body){
            console.log("Changing isOnline to :", isOnline)
            // await Vendor.updateOne({userID: req.session.user._id}, {isOnline: isOnline}) 
            await Vendor.updateOne({ userID: req.params.vendorID }, { isOnline: isOnline })
        }
        // // change the location of the vendor's van if it is in the request body
        // if (latitude && longitude) {
        //     console.log("Changing location to :",latitude, longitude)
        //     await Vendor.updateOne({userID: req.session.user._id}, {latitude:latitude, longitude:longitude}) 
        // }
        if(textAddress) {
            console.log("Changing text address to: ", textAddress)
            // await Vendor.updateOne({userID: req.session.user._id}, {textAddress: textAddress}) 
            await Vendor.updateOne({ userID: req.params.vendorID }, { textAddress: textAddress })
        }
        // send back vendor details for checking
        // res.status(200).send(await Vendor.findOne({userID: req.session.user._id}))
        res.status(200).send("success")
    // error occurred during the database update
    } catch (err) {
        console.log(err)
        res.status(400).json({error: "Database update failed"})
    }
}

// update the status of a current order
const updateOrderStatus = async (req, res) => {
    try {
        if (req.body.status) {
            // change the status of the order 
            console.log("Changing status to", req.body.status)
            await Order.updateOne( {orderNumber: req.params.orderNum}, {status: req.body.status} )
            res.send("Changed Order "+req.params.orderNum+"'s status to "+req.body.status)
        }
    }
    // error occurred during the database update
    catch (err) {
        res.status(400) 
        res.send("Database update failed")
    }
}

// remember to export the functions
module.exports = {
    logIn,
    signUp,
    getAllVendors, 
    getVendorByUserID, 
    getOutstandingOrders, 
    addVendor, 
    updateVendor, 
    updateOrderStatus, 
    getVendorAccount,
    getVendorOrderDetails   
}
