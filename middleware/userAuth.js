// import jwt from "jsonwebtoken";

// const userAuth = async (req, res, next) => {
//   const { token } = req.cookies;

//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Not Authorized. Login Again!" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (decoded && decoded.id) {
//       req.user = {
//         id: decoded.id,
//         role: decoded.role,
//       };
//       next();
//     } else {
//       return res
//         .status(401)
//         .json({ success: false, message: "Invalid token. Login Again!" });
//     }
//   } catch (error) {
//     return res.status(401).json({ success: false, message: "Token verification failed" });
//   }
// };

import jwt from "jsonwebtoken"

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Login Again!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Log the decoded token to verify userId

    if (decoded && decoded.id) {
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      next();
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token. Login Again!" });
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ success: false, message: "Token verification failed" });
  }
};

export default userAuth;
