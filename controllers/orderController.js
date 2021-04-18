const mongoose = require("mongoose")
const Vendor = mongoose.model("Vendor")
const Order = mongoose.model("Order")

const queryOrder = async (req, res) => {
    const order = Order.findOne({"orderId": req.params.orderId})
    try{
        if (order === null){
            res.status(404)
            res.send("No Order Found") 
        }
        return res.send(order)
    }catch (err){
        res.status(400)
        res.send("Database Query Error")
    }
}
const updateOrder = async (req, res) => {
    const new_order = req.body   // construct changed order object from body of POST
  
    try {
      const order = await order.findOne( {"orderId": req.body.orderId} )  // check that an order with this Id already exists
      if (!order) {    // if order is not already in database, return an error
        res.status(400)
        return res.send("order not found in database")
      }
  
      Object.assign(order, new_order)   // replace properties that are listed in the POST body
      let result = await order.save()    // save updated order to database
      return res.send(result)             // return saved order to sender
  
      } catch (err) {   // error detected
          res.status(400)
          return res.send("Database update failed")
      }
  }
  
  // add an order (POST)
  const addOrder = async (req, res) => {
    const order = new Order(req.body)   // construct a new order object from body of POST
    try {
        if (order === null){
            res.status(404)
            res.send("Invalid Vendor ID")
        }
        let result = await order.save()  // save new order object to database
        return res.send(result)           // return saved object to sender
    } catch (err) {   // error detected
        res.status(400)
        return res.send("Database insert failed")
    }
  }
  module.exports = {
      queryOrder,
      updateOrder,
      addOrder
  }