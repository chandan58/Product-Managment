
const productModel = require("../models/productModel")
const awsdk = require("aws-sdk")
const mongoose = require("mongoose")
const aws = require ("../aws/aws.js")




const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'Number' && value.toString().trim().length === 0) return false
    return true
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


// create review.....................................................................
const createProduct = async function (req, res) {
    try {
        let data = req.body;
        if (!(Object.keys(data).length > 0)) {
            return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" });
        }

        const { title, description, price, currencyId, currencyFormat, productImage, style, availableSizes} = data;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "please provide title" });
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "please provide description" });
        }

        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: "price is required" });
        }

        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "currencyId is required" });
        }
        if (!isValid(currencyFormat)) {
            return res.status(400).send({ status: false, message: "please provide currencyFormat" });
        }

        // if (!productImage) {
        //     return res.status(400).send({ status: false, message: "ProductImage is required" });
        // }
        let files = req.files 
   
    if (files && files.length > 0) {
        let productImage = await aws.uploadFile(files[0])    

        let savedData = await productModel.create({ title, description, price, currencyId, currencyFormat, productImage, style, availableSizes});

        return res.status(201).send({ status: true, data: savedData });
    }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

//filter product.............................................
// const filterProduct = async function(req,res){
//     try{
//         let productId = req.query.productId

//     }catch(error){
//         return res.status(500).send({ status: false, message: error.message });
//     }
// }

//get Product................................................
const getProduct = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!(isValid(productId) || isValidObjectId(productId))) {
        return res.status(400).send({ status: false, message: "ProductId is invalid" })}

        const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productDetails) { return res.status(404).send({ status: false, message: "No data found" }) }

        return res.status(200).send({ status: true, message: " Data", data: productDetails })
    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }


}



//update product........................................................

const updateProduct = async function (req, res) {
    try {
        let data = req.body;
        if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" }); }

        let productId = req.params.productId
        if (!(isValid(productId) || isValidObjectId(productId))) {
            return res.status(400).send({ status: false, message: "ProductId is invalid" })
        }

        let ifExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!ifExist) {
            return res.status(404).send({ status: false, msg: "Not Found" })
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId },
            {
                ...data
            },
            { new: true })

        return res.status(200).send({ Status: true, message: "User profile updated", data: updatedProduct })


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}




//delete product................................................

const deleteProduct = async function (req, res) {
    try {

        let deleteProductId = req.params.productId
        if (!(isValid(deleteProductId) || isValidObjectId(deleteProductId))) {
            return res.status(400).send({ status: false, message: "ProductId is invalid" })
        }

        const findProductById = await productModel.findOne({ _id: deleteProductId, isDeleted: false })

        if (!findProductById) {
            return res.status(404).send({ status: false, message: "No product Available,Already deleted" })
        }


        const deleteProductData = await productModel.findOneAndUpdate({ _id: deleteProductId },
            { $set: { isDeleted: true } },
            { new: true })

        if (!deleteProductData) {
            return res.status(404).send({ status: false, msg: "Not Found" })
        }

        return res.status(200).send({ status: true, message: "Product deleted successfullly." })


    }
    catch (error) {
        console.log(error)
       return res.status(500).send({ status: false, message: error.message });
    }


}

module.exports = {createProduct,getProduct,updateProduct,deleteProduct}