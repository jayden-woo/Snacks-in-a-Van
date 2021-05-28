const mongoose = require("mongoose");
const dayjs = require('dayjs');

// import the models used
const Snack = mongoose.model("Snack");
const OrderLine = mongoose.model("OrderLine");
const Order = mongoose.model("Order");
const Customer = mongoose.model("Customer");
const Vendor = mongoose.model("Vendor");
const User = mongoose.model("User");

// regex for user input validation
// a name can only be alphabetic characters
const re_name = /^[a-zA-Z ]+$/;
// a standard email regex
const re_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
// a username can only contain alphanumeric characters and underscores
const re_username = /^[a-zA-Z0-9_]+$/;
// a password must contain a digit, a special character, a lowercase, an uppercase, and between 8-20 characters
const re_password =
  /^(?=.*\d)(?=.*[.!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,20}$/;


// global constants to be tweaked in the future if needed
// number of vendors to be displayed
const N_VENDORS = 5

// get user type
const getUserType = (req,res) => {
  var userType = req.params
}

// get a list of the closest vendors
const getVendorsList = (req, res) => {
  Vendor.aggregate([
      { 
          $geoNear: {
              // near: req.body.location, 
              near: { type: "Point", coordinates: [ -73.99279 , 40.719296 ] }, 
              distanceField: 'distance', 
              spherical: true, 
              query: { isOnline: true }
          }
      }, {
          $limit: N_VENDORS
      }
  ]).exec( (err, result) => {
      // error occured during query
      if (err) {
          req.session.response.success = false
          req.session.response.errors.push(err)
          req.session.save()
          return res.status(400).json(req.session.response)
      }

      console.log('result', result);
      // return res.status(req.session.status).send(result)
      // edited for frontend
      return res.render('customer/vendorlist', { vendors: result });
  })
}


// log out a user
const logOut = (req, res) => {
  // kill the current session so a new session could be created on next req
  req.session.destroy();
  console.log("Customer has successfully logged out");
  res.redirect('/customer/login')
  return res.status(200).json({ success: true, errors: [] });
};


// get the account details
const getAccount = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userID: req.session.user._id });
    // gather the customer details
    const details = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      username: req.session.user.username,
      email: req.session.user.email,
    };
    // return res.status(req.session.status).send(details);
    res.render('customer/account', {user: details})
    // error occured during query
  } catch (err) {
    req.session.response.success = false;
    req.session.response.errors.push("failed query");
    req.session.save();
    return res.status(400).json(req.session.response);
  }
};

// get the menu from database
const getMenu = async (req, res) => {
  try {
    // const menu = await Snack.find().lean()
    let menu = await Snack.find();

    menu = JSON.parse(JSON.stringify(menu));



    // return res.status(req.session.status).send(menu);
    return res.render('customer/menu', { list: menu, user: req.session.user });
    // error occurred during query
  } catch (err) {
    //req.session.response.success = false
    //req.session.response.errors.push('failed query')
    //req.session.save()
    return res.status(400).json(req.session.response);
  }
};

// get details of one snack from database by its name
const getSnackByName = async (req, res) => {
  try {
    // search for a snack by name
    const snack = await Snack.findById(req.params.id ).lean();
    // snack not found in database
    if (snack === null) {
      req.session.response.success = false;
      req.session.response.errors.push("snack not found");
      req.session.save();
      return res.status(404).json(req.session.response);
    }
    // send back snack details
    return res.render('customer/oneSnack', {
      oneSnack: snack,
      user: req.session.user,
    });
    //return res.status(req.session.status).send(snack)
    // error occurred during query
  } catch (err) {
    req.session.response.success = false;
    req.session.response.errors.push("failed query");
    req.session.save();
    return res.status(400).json(req.session.response);
  }
};

// get all the submitted orders' details
const getOrders = async (req, res) => {
  try {
    // get the logined user 
    const customer = await Customer.findOne( {userID: req.session.user._id} )
    let orders = await Order.find({ customerID: customer._id })
      .populate({
        path: "vendorID",
        populate: {
          path: "userID",
          model: "User",
          select: "username",
        },
      })
      .populate({
        path: "snacks.snackID",
      })
      .lean();

    orders = orders.sort(({ updatedAt: a }, { updatedAt: b }) => b - a);
    return res.status(200).json({ success: true, errors: [], data: orders });
    
    // error occurred during query
  } catch (err) {
    req.session.response.success = false;
    req.session.response.errors.push("failed query");
    req.session.save();
    return res.status(400).json(req.session.response);
  }
};

// sign in with either email or username and password
const logIn = (req, res) => {
  User.findOne(
    { $or: [{ password: req.body.password }, { email: req.body.email }] },
    async function (err, user) {
      // couldn't find user in database
      if (!user || err) {
        console.log("User not found");
        req.session.response.success = false;
        // error message = 'You have entered an invalid username or password'
        req.session.response.errors.push("username/password invalid");
        req.session.save();
        // res.redirect('login')
        return res.status(401).json(req.session.response);
      }
      // check if the user is a customer
      if (await Customer.exists({ userID: user._id })) {
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
        console.log("Customer has successfully logged in");
        // res.redirect('login')
        return res.status(req.session.status).json(req.session.response);
      } else {
        console.log("User is not a customer");
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

// validate the input for correct structures and unique username and email
const validateInput = async (req) => {
  // validate first name
  if (!re_name.test(req.body.firstName)) {
    console.log("FirstName is invalid");
    // error message = 'Your name should only contain spaces, lowercase, and uppercase letters.'
    req.session.response.errors.push("firstName invalid");
  }
  // validate last name
  if (!re_name.test(req.body.lastName)) {
    console.log("LastName is invalid");
    // error message = 'Your name should only contain spaces, lowercase, and uppercase letters.'
    req.session.response.errors.push("lastName invalid");
  }
  // validate username
  if (!re_username.test(req.body.username)) {
    console.log("Username is invalid");
    // error message = 'Your username should only contain numbers, underscores, lowercase, and uppercase letters.'
    req.session.response.errors.push("username invalid");
  }
  // validate email
  if (!re_email.test(req.body.email)) {
    console.log(req.body.email, re_email.test(req.body.email));
    console.log("Email is invalid");
    // error message = 'Please enter a valid email address.'
    req.session.response.errors.push("email invalid");
  }
  // validate password
  if (!re_password.test(req.body.password)) {
    console.log("Password is invalid");
    // error message = 'Your password should contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character, and be between 8 to 20 characters in length.'
    req.session.response.errors.push("password invalid");
  }

  // check if any validation errors occured
  if (req.session.response.errors.length != 0) {
    req.session.status = 400;
    req.session.response.success = false;
    req.session.save();
    return req.session.response.success;
  }

  // check if the email is already in use
  if (await User.findOne({ email: req.body.email })) {
    // check if user is logged in
    if (!req.session.user || req.body.email != req.session.user.email) {
      console.log("Email is taken");
      // error message = 'The email address you have entered is already associated with another account.'
      req.session.response.errors.push("email conflict");
    }
  }
  // check if the username is already in use
  if (await User.findOne({ username: req.body.username })) {
    // check if user is logged in
    if (!req.session.user || req.body.username != req.session.user.username) {
      console.log("Username is taken");
      // error message = 'The username you have entered is already associated with another account.'
      req.session.response.errors.push("username conflict");
    }
  }

  // check if any conflicts occured
  if (req.session.response.errors.length != 0) {
    req.session.status = 409;
    req.session.response.success = false;
  }
  req.session.save();
  return req.session.response.success;
};

// register a new customer
const signUp = async (req, res) => {
  console.log('signUp req', res.body);
  // check if the input is correctly formed and if the username or email is taken
  if (!(await validateInput(req))) {
    // res.redirect('signup')
    return res.status(req.session.status).json(req.session.response);
  }

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

  // create a new customer entry
  const customer = new Customer({
    userID: user._id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  // save customer to database
  customer.save((err) => {
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

// update the details of a customer
const updateDetails = async (req, res) => {
  // check if the input is correctly formed and if the username or email is taken
  if (!(await validateInput(req))) {
    // res.redirect('account')
    return res.status(req.session.status).json(req.session.response);
  }

  const user = await User.findOne({ _id: req.session.user._id });
  // check if old password is supplied
  if (req.body.oldPassword) {
    // check if old password matches
    if (!(await user.comparePassword(req.body.oldPassword))) {
      console.log("Wrong old password");
      req.session.response.success = false;
      req.session.response.errors.push("old password invalid");
      req.session.save();
      return res.status(401).json(req.session.response);
    }
    // updating password
    user.set("password", req.body.password);
    user.save((err) => {
      if (err) throw err;
    });
  }

  // updating username and email
  await User.updateOne(
    { _id: req.session.user._id },
    { username: req.body.username, email: req.body.email }
  );

  // updating first name and last name
  await Customer.updateOne(
    { userID: req.session.user._id },
    { firstName: req.body.firstName, lastName: req.body.lastName }
  );

  // res.redirect('account')
  return res.status(req.session.status).json(req.session.response);
};

const updateAccount = async (req, res) => {
   const { type, firstName, lastName, email, oldPassword, password } = req.body;
   const user = await User.findOne({ _id: req.session.user._id });

   if (type === 'firstName') {
     await Customer.updateOne({ userID: req.session.user._id }, { firstName });
   }

   if (type === 'lastName') {
     await Customer.updateOne({ userID: req.session.user._id }, { lastName });
   }

   if (type === 'email') {
     await User.updateOne({ _id: req.session.user._id }, { email });
   }

   if (type === 'password') {
    if (oldPassword) {
      // check if old password matches
      if (!(await user.comparePassword(oldPassword))) {
        req.session.response.success = false;
        req.session.response.errors.push('old password invalid');
        req.session.save();
        return res.status(401).json(req.session.response);
      }
      // updating password
      user.set('password', password);
      user.save((err) => {
        if (err) throw err;
      });
    }

     await Customer.updateOne(
       { userID: req.session.user._id },
       { firstName: req.body.firstName },
     );
   }



   return res.status(req.session.status).json(req.session.response);
}

// add a snack to a new or unsubmitted order
const addSnackToOrder = async (req, res) => {
  // get the snack to be added and construct the new order line item
  const snack = await Snack.findOne({ name: req.params.snackName });
  const lineItem = new OrderLine({
    snackID: snack._id,
    quantity: req.body.quantity,
  });

  // add to existing order if present
  if (req.session.order) {
    req.session.order.snacks.push(lineItem);
    req.session.order.save();
    // res.redirect('/customer/menu')
    return res.status(req.session.status).json(req.session.response);
  }
  // else construct a new order
  const customer = await Customer.findOne({ userID: req.session.user._id });
  const orderNumber = await Order.countDocuments();
  const order = new Order({
    orderNumber: orderNumber,
    // TEMP uses a random vendor id for now
    // vendorID: req.session.vendor._id,
    vendorID: "6090ad1b432359dbb986ed79",
    customerID: customer._id,
    snacks: [lineItem],
  });
  // save the new order to the orders database
  order.save((err) => {
    if (err) throw err;
  });

  // save the order in the cookies
  req.session.order = order;
  req.session.save();
  // res.redirect('/customer/menu')
  return res.status(req.session.status).json(req.session.response);
}


const confirmOrder = async (req, res) => {
  try{
    console.log('orderlist', req.body.orderlist, req.body);

    // if (!req.session.vendor._id) {
    //   return res.status(422).json("PLease chose a vendor for the order.")
    // }

    if (!req.body.vendorId) {
      return res.status(422).json('PLease chose a vendor for the order.');
    }

    // linetimes a list?
    const { orderlist, price } = req.body;

    const lineItems = [];
    for (i = 0; i < orderlist.length; i++) {
      lineItems.push(
        new OrderLine({
          snackID: orderlist[i].snackId,
          quantity: parseInt(orderlist[i].quantity),
        }),
      );
    }

    const orderNumber = await Order.countDocuments();
    const order = new Order({
      orderNumber: orderNumber,
      vendorID: req.body.vendorId || req.session.vendor._id,
      // vendorID: "6090ad1b432359dbb986ed79",
      customerID: req.session.user._id,
      snacks: lineItems,
      totalPrice: parseInt(price),
    });
    // save the new order to the orders database
    order.save((err) => {
      if (err) throw err;
    });
    return res.status(req.session.status).json(req.session.response);
  } catch (err) {
    return res.status(400).json({error: "Database query failed"})
  }
}

const getOneOrder = async (req, res) => {
  try {
    let order = await Order.findOne({_id: req.params.orderId})
      .populate({
        path: "vendorID",
        populate: {
        path: "userID",
        model: "User",
        select: "username",
        },
      })
      .populate({
        path: "snacks.snackID",
      }).exec( (err, result) => {
        // .lean()

        // Convert string to JSON
        let detail = JSON.parse(JSON.stringify(result));

        // Order status data display conversion
        const statusList = [
          'Ordering',
          'Placed',
          'Cooking',
          'Fulfilled',
          'Picked-Up',
          'Cancelled',
        ];
        const statusIndex = statusList.findIndex((v) => {
          return v === detail.status;
        });
        detail.statusIndex = statusIndex;
        detail.statusList = statusList.map((v, i) => {
          const status =
            i < statusIndex ? 'completed' : i === statusIndex ? 'active' : '';
          return {
            name: v,
            status,
          };
        });

        detail.formartTime = dayjs(detail.updatedAt).format('h:mm a');
        // dayjs('2021-05-25T09:21:22.616Z').format('h:mm a')

        console.log('detail', detail);

        return res.render('customer/orderDetail', { user: req.session.user, detail });
        // return res.status(200).json(result);
      })
    // return res.render("order", { orders: orders, user: req.session.user});
  } catch (err) {
    return res.status(400).json({error: "Database query failed"})
  }
}

const ratingAnOrder = async (req, res) => {
  try {
    // order id in params?
    const {ratingScore, comment} = req.body
    console.log('req.params.orderId', req.params.orderId, req.body);
    const order = await Order.findOne({_id: req.params.orderId})
    if (order == null) {
      return res.status(200).json("Order doesnt exist")
    }
    await Order.updateOne({_id: req.params.orderId}, { $set : {rating: ratingScore, comment: comment}})
    return res.status(200).json({ success: true, errors: [] });
  } catch (err) {
    return res.status(400).json({error: "Database query failed"})
  }
}

// change the order status stored in the cart to cancelled
const cancelOrder = async (req, res) => {
  try {
     console.log('cancelOrder', req.body);
      const order = await Order.findOne({ _id: req.body.orderId });
      console.log('cancelOrder order', order);
      if (order != null) {
          await Order.updateOne({_id: req.body.orderId}, {status: 'Cancelled'})
          return res.status(200).json("Cancelled successfully")
      }
      return res.status(200).json("Order doesnt exist")
  } catch (err) {
      return res.status(400).json({error: "Database query failed"})
  }
}

const updateOrder = async (req,res) => {
  try {
    const {orderId, orderlist, newPrice} = req.body

    console.log('updateOrder', req.body);

    const order = await Order.findOne({ _id: orderId });
    if (order == null) {
        return res.status(400).json("Order doesnt exist")
    }

    let lineItems = []
    for (i=0; i<orderlist.length; i++) {
      lineItems.push(new OrderLine({
        snackID: orderlist[i].snackId, 
        quantity: parseInt(orderlist[i].quantity)
      }))
    }

    await Order.updateOne( {_id: orderId}, {$set: {snacks: lineItems, totalPrice: newPrice}} )
    return res.status(200).json({ success: true, errors: [] });
  } catch (err) {
      return res.status(400).json({error: "Database query failed"})
  }
}




// export the controller functions
module.exports = {
  getVendorsList,
  logOut,
  getAccount,
  getMenu,
  getSnackByName,
  getOrders,
  logIn,
  signUp,
  updateDetails,
  addSnackToOrder,
  confirmOrder,
  updateAccount,
  /////
  cancelOrder,
  ratingAnOrder,
  getOneOrder,
  updateOrder
};