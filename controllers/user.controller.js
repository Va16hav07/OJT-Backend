let {validationResult}=require('express-validator')
const bcrypt=require('bcryptjs')
let userModel=require("../db/models/user.js")
const mongoose = require('mongoose');

const jwt=require('jsonwebtoken')
require('dotenv').config();


let signinUser=async (req,res)=>{
let errors=validationResult(req);
let body=req.body
if(!errors.isEmpty())
{
    return res.status(400).json({success:false,message:errors[0].msg})
}
let user= await userModel.findOne({email:body.email})
if(!user)
{
    return res.status(404).json({success:false,message:"User not found"})
}

// Check if the user is banned
if(user.status === "banned") {
    return res.status(403).json({success: false, message: "Your account has been banned. Please contact support."});
}

const isMatch = await bcrypt.compare(body.password, user.password);
if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
}


else{
    const payload={
        userId:user._id,
        type:user.type,  // Make sure we include the correct type
        name:user.name
      }
      const tokenSecret=process.env.TOKEN_SECRET
    
      jwt.sign(payload, tokenSecret, { expiresIn: 3600 }, (err, token) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Error" });
        }
        return res.status(200).json({ 
          success: true, 
          token: token, 
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            type: user.type,  // Include type in response
            status: user.status || 'active'  // Include status in response
          }
        });
      });
      

}

}

let signupUser = async (req, res) => {
    let errors = validationResult(req);
    let body = req.body
    if(errors && errors.length)
    {
        return res.status(400).json({success:false, message:errors[0].msg});
    }

    let existingUser = await userModel.findOne({email:body.email})

    if(existingUser)
    {
        return res.status(404).json({success:false, message:"User already exists"});
    }

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    
    let newUser = new userModel({
        name: body.name,
        email: body.email,
        password: hashedPassword,
        phone: body.phone,
        type: body.type || 'customer',  // Default to customer if not specified
        status: 'active'
    });
    
    await newUser.save();
    return res.status(201).json({success:true, message:"User created successfully"});
}

let updateUser=async (req,res)=>{
    let email=req.params.email;
    let user= await userModel.findOne({email:email})
        if(!user){
            return res.status(404).send({success:false,"message":"User not found"})
        }
        let newPhone=req.body.phone;
        let newName=req.body.name;
     
        if(newName&&newName!=='')
        {
           await userModel.updateOne({email},{$set:{name:newName}})
        }
        if(newPhone&&newPhone!="")
            {
                await userModel.updateOne({email},{$set:{phone:newPhone}})
            }

            
        res.status(200).json({success:true,"message":"User updated successfully"})   


}


let deleteUser=async (req,res)=>{
 
let email=req.params.email;
let user=await userModel.findOne({email:email})
if(!user)
{
    return res.status(404).send({success:false,"message":"User not found"})
}
await userModel.deleteOne({email})
res.status(200).json({success:true,"message":"User deleted successfully"})

}

// Get user addresses
const getUserAddresses = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Return addresses with IDs and format for frontend
        const addresses = user.addresses.map(addr => ({
            id: addr._id,
            label: addr.label,
            type: addr.type,
            address: addr.address,
            phone: addr.phone,
            isDefault: addr._id.toString() === (user.defaultAddressId?.toString() || '')
        }));
        
        return res.status(200).json({
            success: true,
            addresses
        });
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching addresses"
        });
    }
};

// Add a new address
const addUserAddress = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: errors.array()
            });
        }
        
        const userId = req.userId;
        const { label, type, address, phone } = req.body;
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Create new address
        const newAddress = {
            label,
            type: type || 'Home',
            address,
            phone
        };
        
        user.addresses.push(newAddress);
        
        // If this is the first address, set as default
        if (user.addresses.length === 1) {
            user.defaultAddressId = user.addresses[0]._id;
        }
        
        await user.save();
        
        // Get the saved address with its ID
        const savedAddress = user.addresses[user.addresses.length - 1];
        
        return res.status(201).json({
            success: true,
            message: "Address added successfully",
            address: {
                id: savedAddress._id,
                label: savedAddress.label,
                type: savedAddress.type,
                address: savedAddress.address,
                phone: savedAddress.phone,
                isDefault: savedAddress._id.toString() === (user.defaultAddressId?.toString() || '')
            }
        });
    } catch (error) {
        console.error('Error adding address:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while adding address"
        });
    }
};

// Update address
const updateUserAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { addressId } = req.params;
        const { label, type, address, phone } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Find the address to update
        const addressToUpdate = user.addresses.id(addressId);
        if (!addressToUpdate) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }
        
        // Update fields
        if (label) addressToUpdate.label = label;
        if (type) addressToUpdate.type = type;
        if (address) addressToUpdate.address = address;
        if (phone) addressToUpdate.phone = phone;
        
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address: {
                id: addressToUpdate._id,
                label: addressToUpdate.label,
                type: addressToUpdate.type,
                address: addressToUpdate.address,
                phone: addressToUpdate.phone,
                isDefault: addressToUpdate._id.toString() === (user.defaultAddressId?.toString() || '')
            }
        });
    } catch (error) {
        console.error('Error updating address:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating address"
        });
    }
};

// Delete address
const deleteUserAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { addressId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if the address exists before trying to delete it
        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );
        
        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }
        
        // Check if this is the default address
        const isDefault = user.defaultAddressId && 
                         user.defaultAddressId.toString() === addressId;
        
        // Remove the address using the proper method for MongoDB arrays
        user.addresses.splice(addressIndex, 1);
        
        // If this was the default address and there are other addresses, set a new default
        if (isDefault && user.addresses.length > 0) {
            user.defaultAddressId = user.addresses[0]._id;
        } else if (user.addresses.length === 0) {
            user.defaultAddressId = undefined;
        }
        
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting address"
        });
    }
};

// Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { addressId } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address ID"
            });
        }
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if address exists
        const addressExists = user.addresses.id(addressId);
        if (!addressExists) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }
        
        // Set as default
        user.defaultAddressId = addressId;
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: "Default address set successfully"
        });
    } catch (error) {
        console.error('Error setting default address:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while setting default address"
        });
    }
};

module.exports={
    updateUser,
    deleteUser,
    signinUser,
    signupUser,
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultAddress
}