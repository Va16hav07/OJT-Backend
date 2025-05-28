const mongoose=require('mongoose')

const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Home', 'Office', 'Other'],
        default: 'Home'
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
}, { _id: true });

let userSchema=new mongoose.Schema({
    
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
    },
    type: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active'
    },
    addresses: [addressSchema],
    defaultAddressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'addresses'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    googleId: { 
        type: String,
        sparse: true  // Allows multiple null values
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
})

const userModel=mongoose.model("User",userSchema);

module.exports=userModel