import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength:[3,'Username atleast 3 characters']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase:true
    },
    password: {
        type: String,
        required: true,
        minLength:[6,'Password must be atleast 6 characters']
    },
    profileImageUrl:{
        type: String,
        default: null
    },
    
},
{timestamps: true});
// pre hook to hash password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         return next();
//     }
//     try{
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     }catch(err){
//         next(err);
//     }
// });
userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
  return isPasswordCorrect;
};

const User=mongoose.model("User", userSchema);

export default User;