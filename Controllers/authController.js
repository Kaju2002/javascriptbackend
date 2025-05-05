import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../Models/userModel.js";
import transporter from "../config/nodemailer.js";
import { OAuth2Client } from "google-auth-library";


const client = new OAuth2Client("199057955312-fqp1amhvvkpcda3ljm404emqlsgcn0fb.apps.googleusercontent.com");

export const register = async(req,res) =>{

    const {name ,email , password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Please fill all fields" });
      }

    try {
        const existingUser = await userModel.findOne({ email });

        if(existingUser){
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({name,email,password:hashedPassword});
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          const mailOptions ={
            from : process.env.SENDER_EMAIL,
            to : email,
            subject : "Welcome to Kajanthan",
            html : `Welcome to Kajanthan Website. Your Account has been created successfully with email id : ${email}.`
          }

          await transporter.sendMail(mailOptions);
          return res.status(201).json({ success: true, message: "Registration successful" });

    } catch (error) {
            return res.status(500).json({success:false,message:error.message});
    }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
console.log(token)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("Login Request:", req.body);
    console.log("User Found:", user);
    console.log("Password Match:", isMatch);

    return res.status(200).json({success:true,message:"Login successful", user: {
      id: user._id,
      name: user.name
  }});
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};




// export const googleLogin = async (req, res) => {
//   const { token } = req.body;

//   if (!token) {
//     return res.status(400).json({ success: false, message: "Token is required" });
//   }

//   try {
//     // Verify the token with Google OAuth2 client
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: "199057955312-4cvv1fd7vonckv916sv61cfq8oj01i5a.apps.googleusercontent.com",
//     });

//     // Get the payload from the token
//     const payload = ticket.getPayload();
//     const { email, name, picture } = payload;

//     // Check if user exists in the database
//     let user = await userModel.findOne({ email });
    
//     if (!user) {
//       // Create new user if not found
//       user = await userModel.create({ name, email, avatar: picture });
//     }

//     // Optionally: Create a JWT token and send it to the frontend
//     const token = jwt.sign({ userId: user._id }, "your_jwt_secret", { expiresIn: "1h" });

//     // Send the token back to the client, or set a session
//     req.session.user = user;

//     res.status(200).json({
//       success: true,
//       message: "Google login successful",
//       user,
//       token,  // Optional: JWT for frontend authentication
//     });
//   } catch (error) {
//     console.error("Google Login Error", error);
    
//     // Specific error handling based on the error code
//     if (error.message === "Token used too late") {
//       return res.status(400).json({ success: false, message: "The token has expired" });
//     }
    
//     res.status(401).json({ success: false, message: "Google login failed" });
//   }
// };


export const googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token is required" });
  }

  try {
    // Verify the token with Google OAuth2 client
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "199057955312-fqp1amhvvkpcda3ljm404emqlsgcn0fb.apps.googleusercontent.com", // Replace with your Google client ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await userModel.findOne({ email });

    if (!user) {
      // Create new user if not found
      user = await userModel.create({ name, email, avatar: picture });
    }

    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user,
      token: authToken,  // Optional: JWT for frontend authentication
    });
  } catch (error) {
    console.error("Google Login Error", error);
    return res.status(401).json({ success: false, message: "Google login failed" });
  }
};


  export const logout =async (req, res) => {

    try {
        
        res.clearCookie("token",{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.status(200).json({success:true,message:"Logout successful"})
    } catch (error) {
        return res.status(500).json({success:false,message:error.message})
    }
}

export const isAuthenticated = async (req, res) => {
  try {
    // Simulate some logic that could potentially throw an error
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error occurred:", error);  // This will log any error
    return res.status(500).json({ success: false, message: error.message });
  }
};



//Send verify otp to the user email
export const sendVerifyOtp = async (req, res) => {
  try {

    const {userId} = req.body;

    const user = await userModel.findById(userId);

    if(user.isAccountVerified){
      return res.status(404).json({success:false,message:"Account Already Verified"})
    }
    

   const otp = String(Math.floor(100000 + Math.random() * 900000))

   user.verifyOtp = otp;
   user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

   await user.save();

   const mailOptions ={
    from : process.env.SENDER_EMAIL,
    to : user.email,
    subject : "Account Verification OTP", 
   // html : `Your OTP is ${otp}. Verify your account Using this OTP.`,
    html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
  }

  await transporter.sendMail(mailOptions); 

   return res.status(200).json({success:true,message:"OTP sent successfully"})


    
  } catch (error) {
    return res.status(500).json({success:false,message:error.message})
  }
}


export const verifyEmail = async (req, res) => {

  const {userId,otp} = req.body;

  if(!userId || !otp){
    return res.status(400).json({success:false,message:"Please fill all fields"})
  }

  try {

    const user = await userModel.findById(userId);

    if(!user){
      return res.status(404).json({success:false,message:"User not found"})
    }if(user.verifyOtp === '' || user.verifyOtp !== otp){
      return res.status(400).json({success:false,message:"Invalid OTP"})
    }


    if(user.verifyOtpExpireAt < Date.now()){
      return res.status(400).json({success:false,message:"OTP Expired"})
    }
    
    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.status(200).json({success:true,message:"Account Verified Successfully"})
  } catch (error) {
    return res.status(500).json({success:false,message:error.message})

  }


}




export const sendResetOtp = async (req, res) => {

  const {email} = req.body;

  if(!email){
    return res.status(400).json({success:false,message:"Email is required"})
  }

  try {

    const user = await userModel.findOne({email});

    if(!user){
      return res.status(404).json({success:false,message:"User not found"})
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))


    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
 
    await user.save();
 
    const mailOptions ={
     from : process.env.SENDER_EMAIL,
     to : user.email,
     subject : "Password Reset OTP", 
    // html : `Your OTP for reset password is ${otp}. Reset your password Using this OTP.`,
     html:  PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
   }
 
   await transporter.sendMail(mailOptions); 
 
    return res.status(200).json({success:true,message:"OTP Send Your Email"})

    
  } catch (error) {
    return res.status(500).json({success:false,message:error.message})

  }
}


export const resetPassword = async (req, res) => {

  const {email,otp,newPassword} = req.body;

  if(!email || !otp || !newPassword){
    return res.status(400).json({success:false,message:"Email ,OTP , New Password is required"})
  }

  try {

    const user = await userModel.findOne({email});

    if(!user){
      return res.status(404).json({success:false,message:"User not found"})
    }

    if(user.resetOtp === '' || user.resetOtp !== otp){
      return res.status(400).json({success:false,message:"Invalid OTP"})
    }


    if(user.resetOtpExpireAt < Date.now()){
      return res.status(400).json({success:false,message:"OTP Expired"})
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;
 
    await user.save();
 
    return res.status(200).json({success:true,message:"Password Reset Successfully"})
    
  } catch (error) {
    return res.status(500).json({success:false,message:error.message})

  }
}
