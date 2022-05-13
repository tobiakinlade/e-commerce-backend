const {User} = require('../models/user')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Getting all users
// The -password argument will exclude the hash password when getting the users
router.get(`/`, async (req, res) =>{
    const allUsers = await User.find().select('-passwordHash');

    if(!allUsers) {
        res.status(500).json({success: false})
    }
    res.send(allUsers);
})

// Getting a single user by it id
// The -password argument will exclude the hash password when getting the user
router.get('/:id', async(req,res)=>{
    const singleUser = await User.findById(req.params.id).select('-passwordHash');

    if(!singleUser) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    }
    res.status(200).send(singleUser);
})

// creating a new user to the database
// bcrypt is used to hash the password received from the user
router.post('/register', async (req,res)=>{
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    newUser= await newUser.save();

    if(!newUser)
        return res.status(400).send('the user cannot be created!')

    res.send(newUser);
});

// Updating a single user
router.put('/:id',async (req, res)=> {


    const updateUser = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: req.body.password,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true}
    )

    if(!updateUser)
        return res.status(400).send('the user cannot be updated!')

    res.send(updateUser);
});

router.post('/login', async (req,res) => {
    const userLogin = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!userLogin) {
        return res.status(400).send('The user not found');
    }

    // This will compare the user with his/her hash password
    if(userLogin && bcrypt.compareSync(req.body.password, userLogin.passwordHash)) {
        // When the user is authenticated, it will generate a token for the user
        const token = jwt.sign(
            {
                userId: userLogin.id,
                isAdmin: userLogin.isAdmin
            },
            secret,
            {expiresIn: '1w'}
        )

        res.status(200).send({userLogin: userLogin.email , token: token})
    } else {
        res.status(400).send('password is wrong!');
    }


});

router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'user deleted successfully!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
        return res.status(500).json({success: false, error: err})
    })
})


router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments((count) => count)

    if(!userCount) {
        res.status(500).json({success: false})
    }
    res.send({
        userCount: userCount
    });
})

module.exports = router
