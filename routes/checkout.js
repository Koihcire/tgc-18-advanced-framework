const express = require('express');
const { checkIfAuthenticated } = require('../middlewares');
const router = express.Router();
const CartServices = require('../services/cart');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY) //require stripe will return a function, call immediately and pass in secret key

router.get('/', checkIfAuthenticated ,async function(req,res){
    //step1: create a line item
    //each item in the shopping cart is a line item
    const items = await CartServices.getCart(req.session.user.id);

    let lineItems = [];
    let meta = []; //store for each product id how many the user is buying (quantity). line items structure has no place to put productid
    for (let item of items) {
        //each key in line item is fixed by stripe
        const eachLineItem = {
            'name': item.related('product').get('name'),
            'amount': item.related('product').get('cost'),
            'quantity': item.get('quantity'),
            'currency': 'SGD'
        }
        //check if there is an image
        if (item.related('product').get('image_url')) {
            //stripe expects images to be an array
            eachLineItem.images = [item.related('product').get('image_url')];
            lineItems.push(eachLineItem);
        }

        meta.push({
            'product_id' : item.get('product_id'),
            'quantity': item.get('quantity')
        })
    }

    //step2: create a stripe payment
    //the meta data must be a string
    let metaData = JSON.stringify(meta);
    const payment = {
        payment_method_types: ['card', 'paynow', 'grabpay'], //check stripe documentation for diff payment options
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_SUCCESS_URL,
        //in metadata, keys are up to us but value must be a string
        metadata: {
            'orders': metaData,
            'user_id': req.session.user.id
        }
    }

    //step3: register the payment session
    let stripeSession = await Stripe.checkout.sessions.create(payment)
    

    //step 4: user stripe to pay
    //credit card information (no, ccv) can NEVER reach our server
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // 4. Get the ID of the session
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})

router.get('/success', function (req,res){
    res.send('payment success')
})

router.get('/cancelled', function (req,res){
    res.send('payment failed')
})


//webhook for stripe
//has to be post - 1. we are changing the db based on payment info 2. stripe decides
router.post('/process_payment', express.raw({type: 'application/json'}), async function (req,res){
    console.log("process started")
    let payload = req.body; //payment info is indside req.body
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET; //each webhook will have one endpoint secret to ensure stripe is the one sending information to us
    let sigHeader = req.headers["stripe-signature"]; //when stripe send us the info, there will be a signature in the header
    let event = null;
    //try to extract out the information and ensures that it comes from stripe
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
        console.log(event)
        if (event.type == 'checkout.session.completed' || event.type == 'checkout.session.async_payment_succeeded') {
            console.log(event.data.object)
            const metaData = JSON.parse(event.data.object.metadata.orders);
            console.log(metaData)
            //need to send a reply back to stripe or stripe will keep retrying
            res.send({
                'success': true
            })
        };
        //get receipt and payment mode
        if (event.type == 'charge.succeeded'){
            const chargeData = event.data.object
            console.log(chargeData);
            res.send({
                'success': true
            })
        }; 
    } catch(e) {
        res.sendStatus(500)
        res.send({
            'error': e.message
        })
        console.log(e.message)
    }
})

module.exports = router;