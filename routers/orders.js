const {Order} = require('../models/order')
const express = require('express');
const {OrderItem} = require("../models/orderItem");
const router = express.Router();

// Api request to get the list of orders and show the user information to the Admin panel and the order is sorted by date
router.get(`/`, async (req, res) => {
    const listOrder = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});
    if(!listOrder) {
        res.status(500).json({success: false})
    }
    res.send(listOrder)
});

// Getting a single order
router.get(`/:id`, async (req, res) =>{
    const singleOrder = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems', populate: {
                path : 'product', populate: 'category'}
        });

    if(!singleOrder) {
        res.status(500).json({success: false})
    }
    res.send(singleOrder);
})

router.post('/', async (req,res)=>{
    // This will loop through the order items
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        // saving the new order Item in the database
        newOrderItem = await newOrderItem.save();
        //This will return only the id of the new order item
        return newOrderItem._id;
    }))
    const orderItemsIdsResolved =  await orderItemsIds;

    //
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    // Getting the sum in an array
    const totalPrice = totalPrices.reduce((a,b) => a +b , 0);

    let newOrder = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    newOrder = await newOrder.save();

    if(!newOrder)
        return res.status(400).send('the order cannot be created!')

    res.send(newOrder);
});

// Updating the status single order
router.put('/:id',async (req, res)=> {
    const updateOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )

    if(!updateOrder)
        return res.status(400).send('the order cannot be updated!')

    res.send(updateOrder);
});

// Deleting a single order
router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "order not found!"})
        }
    }).catch(err=>{
        return res.status(500).json({success: false, error: err})
    })
});

// Getting total sales for the Admin
router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
});

// count order
router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments((count) => count)

    if(!orderCount) {
        res.status(500).json({success: false})
    }
    res.send({
        orderCount: orderCount
    });
});

// Getting order history by a user
// It will populate the ordered products from the newest to the oldest
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderHistory = await Order.find({user: req.params.userid}).populate({
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'}
    }).sort({'dateOrdered': -1});

    if(!userOrderHistory) {
        res.status(500).json({success: false})
    }
    res.send(userOrderHistory);
})

module.exports = router
