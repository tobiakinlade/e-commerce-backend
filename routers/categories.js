const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

// Getting all categories
router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    }
    res.send(categoryList);
});

// Getting a category by id
router.get('/:id', async(req,res)=>{
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    }
    res.status(200).send(category);
})

// posting to the database
router.post(`/`, async (req, res) => {
    let newCategory = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });
    newCategory = await newCategory.save(); // wait to check if newCategory is ready then save it to the database

    // If there was an error in creating a new category
    if(!newCategory){
        return res.status(404).send('The category cannot be created')
    }
    // If data is present in the post request
    res.send(newCategory)
});

// Updating a category
router.put('/:id',async (req, res)=> {
    const updateCategory = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true}
    )

    if(!updateCategory)
        return res.status(400).send('the category cannot be updated!')

    res.send(updateCategory);
})


// Deleting by id
router.delete('/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id).then(category =>{
        if(category) {
            return res.status(200).json({success: true, message: 'category deleted successfully!'})
        } else {
            return res.status(404).json({success: false , message: "category not found!"})
        }
    }).catch(err=>{
        return res.status(500).json({success: false, error: err})
    })
})

module.exports =router;
