// const {
//   generateToken,
//   generateRefreshToken
// } = require('../middleware/auth');

// const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');

// const User = require('../models/User');

// /*
// |--------------------------------------------------------------------------
// | REGISTER
// |--------------------------------------------------------------------------
// | POST /api/auth/register
// | Public
// |
// | ONLY:
// | name
// | email
// | password
// | confirmPassword
// |--------------------------------------------------------------------------
// */

// exports.register = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       confirmPassword
//     } = req.body;

//     /*
//     |--------------------------------------------------------------------------
//     | REQUIRED FIELDS
//     |--------------------------------------------------------------------------
//     */

//     if (
//       !name ||
//       !email ||
//       !password ||
//       !confirmPassword
//     ) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'Name, email, password and confirm password are required'
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | PASSWORD MATCH
//     |--------------------------------------------------------------------------
//     */

//     if (
//       password !==
//       confirmPassword
//     ) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'Password and confirm password do not match'
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | PASSWORD LENGTH
//     |--------------------------------------------------------------------------
//     */

//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'Password must be at least 6 characters'
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | NORMALIZE EMAIL
//     |--------------------------------------------------------------------------
//     */

//     const normalizedEmail =
//       email.trim().toLowerCase();

//     /*
//     |--------------------------------------------------------------------------
//     | CHECK EXISTING USER
//     |--------------------------------------------------------------------------
//     */

//     const userExists =
//       await User.findOne({
//         email: normalizedEmail
//       });

//     if (userExists) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'User already exists with this email'
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | CREATE USER
//     |--------------------------------------------------------------------------
//     */

//     const newUser =
//       await User.create({
//         name: name.trim(),

//         email: normalizedEmail,

//         password,

//         confirmPassword,

//         role: 'user',

//         isBlocked: false,

//         isActive: true
//       });

//     /*
//     |--------------------------------------------------------------------------
//     | GENERATE TOKEN
//     |--------------------------------------------------------------------------
//     */

//     const token =
//       generateToken(
//         newUser._id.toString()
//       );

//     const refreshToken =
//       generateRefreshToken(
//         newUser._id.toString()
//       );

//     /*
//     |--------------------------------------------------------------------------
//     | RESPONSE
//     |--------------------------------------------------------------------------
//     */

//     return res.status(201).json({
//       success: true,

//       message:
//         'Registration successful',

//       data: {
//         user: {
//           id:
//             newUser._id.toString(),

//           name:
//             newUser.name,

//           email:
//             newUser.email,

//           role:
//             newUser.role
//         },

//         token,

//         refreshToken
//       }
//     });
//   } catch (error) {
//     console.error(
//       'Register error:',
//       error
//     );

//     /*
//     |--------------------------------------------------------------------------
//     | MONGOOSE VALIDATION ERROR
//     |--------------------------------------------------------------------------
//     */

//     if (
//       error.name ===
//       'ValidationError'
//     ) {
//       const errors =
//         Object.values(
//           error.errors
//         ).map(
//           (err) =>
//             err.message
//         );

//       return res.status(400).json({
//         success: false,
//         error:
//           errors.join(', ')
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | DUPLICATE EMAIL
//     |--------------------------------------------------------------------------
//     */

//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'User already exists with this email'
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | LOGIN
// |--------------------------------------------------------------------------
// | POST /api/auth/login
// | Public
// |
// | ONLY:
// | email
// | password
// |--------------------------------------------------------------------------
// */

// exports.login = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       email,
//       password
//     } = req.body;

//     /*
//     |--------------------------------------------------------------------------
//     | REQUIRED FIELDS
//     |--------------------------------------------------------------------------
//     */

//     if (
//       !email ||
//       !password
//     ) {
//       return res.status(400).json({
//         success: false,
//         error:
//           'Email and password are required'
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | NORMALIZE EMAIL
//     |--------------------------------------------------------------------------
//     */

//     const normalizedEmail =
//       email.trim().toLowerCase();

//     /*
//     |--------------------------------------------------------------------------
//     | FIND USER
//     |--------------------------------------------------------------------------
//     */

//     const user =
//       await User.findOne({
//         email:
//           normalizedEmail
//       }).select(
//         '+password'
//       );

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         error:
//           'Invalid credentials'
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | BLOCK CHECK
//     |--------------------------------------------------------------------------
//     */

//     if (user.isBlocked) {
//       return res.status(403).json({
//         success: false,
//         error:
//           'Your account has been blocked. Please contact administrator.'
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | ACTIVE CHECK
//     |--------------------------------------------------------------------------
//     */

//     if (!user.isActive) {
//       return res.status(403).json({
//         success: false,
//         error:
//           'Your account is inactive. Please contact administrator.'
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | PASSWORD CHECK
//     |--------------------------------------------------------------------------
//     */

//     const isPasswordMatch =
//       await user.matchPassword(
//         password
//       );

//     if (!isPasswordMatch) {
//       return res.status(401).json({
//         success: false,
//         error:
//           'Invalid credentials'
//       });
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | UPDATE LOGIN INFORMATION
//     |--------------------------------------------------------------------------
//     */

//     user.lastLogin =
//       new Date();

//     user.loginHistory.push({
//       date: new Date(),

//       ipAddress:
//         req.ip ||
//         req.headers[
//           'x-forwarded-for'
//         ] ||
//         '',

//       userAgent:
//         req.get(
//           'user-agent'
//         ) || ''
//     });

//     await user.save();

//     /*
//     |--------------------------------------------------------------------------
//     | GENERATE TOKEN
//     |--------------------------------------------------------------------------
//     */

//     const token =
//       generateToken(
//         user._id.toString()
//       );

//     const refreshToken =
//       generateRefreshToken(
//         user._id.toString()
//       );

//     /*
//     |--------------------------------------------------------------------------
//     | RESPONSE
//     |--------------------------------------------------------------------------
//     */

//     return res.status(200).json({
//       success: true,

//       message:
//         'Login successful',

//       data: {
//         user: {
//           id:
//             user._id.toString(),

//           name:
//             user.name,

//           email:
//             user.email,

//           role:
//             user.role
//         },

//         token,

//         refreshToken
//       }
//     });
//   } catch (error) {
//     console.error(
//       'Login error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | GET CURRENT USER
// |--------------------------------------------------------------------------
// | GET /api/auth/me
// | Private
// |--------------------------------------------------------------------------
// */

// exports.getMe = async (
//   req,
//   res
// ) => {
//   try {
//     const user =
//       await User.findById(
//         req.user.id
//       );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error:
//           'User not found'
//       });
//     }

//     return res.status(200).json({
//       success: true,

//       data: {
//         user: {
//           id:
//             user._id.toString(),

//           name:
//             user.name,

//           email:
//             user.email,

//           role:
//             user.role,

//           isActive:
//             user.isActive,

//           isBlocked:
//             user.isBlocked,

//           lastLogin:
//             user.lastLogin,

//           registrationDate:
//             user.registrationDate
//         }
//       }
//     });
//   } catch (error) {
//     console.error(
//       'Get user error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | UPDATE PROFILE
// |--------------------------------------------------------------------------
// | PUT /api/auth/update-profile
// | Private
// |
// | ONLY NAME
// |--------------------------------------------------------------------------
// */

// exports.updateProfile =
//   async (
//     req,
//     res
//   ) => {
//     try {
//       const {
//         name
//       } = req.body;

//       const user =
//         await User.findById(
//           req.user.id
//         );

//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           error:
//             'User not found'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | UPDATE NAME ONLY
//       |--------------------------------------------------------------------------
//       */

//       if (
//         name !== undefined
//       ) {
//         user.name =
//           name.trim();
//       }

//       await user.save();

//       return res.status(200).json({
//         success: true,

//         message:
//           'Profile updated successfully',

//         data: {
//           user: {
//             id:
//               user._id.toString(),

//             name:
//               user.name,

//             email:
//               user.email,

//             role:
//               user.role
//           }
//         }
//       });
//     } catch (error) {
//       console.error(
//         'Update profile error:',
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         error: 'Server error'
//       });
//     }
//   };

// /*
// |--------------------------------------------------------------------------
// | CHANGE PASSWORD
// |--------------------------------------------------------------------------
// | POST /api/auth/change-password
// | Private
// |--------------------------------------------------------------------------
// */

// exports.changePassword =
//   async (
//     req,
//     res
//   ) => {
//     try {
//       const {
//         currentPassword,
//         newPassword,
//         confirmPassword
//       } = req.body;

//       /*
//       |--------------------------------------------------------------------------
//       | REQUIRED
//       |--------------------------------------------------------------------------
//       */

//       if (
//         !currentPassword ||
//         !newPassword ||
//         !confirmPassword
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             'Current password, new password and confirm password are required'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | NEW PASSWORD LENGTH
//       |--------------------------------------------------------------------------
//       */

//       if (
//         newPassword.length <
//         6
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             'New password must be at least 6 characters'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | PASSWORD MATCH
//       |--------------------------------------------------------------------------
//       */

//       if (
//         newPassword !==
//         confirmPassword
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             'New password and confirm password do not match'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | FIND USER
//       |--------------------------------------------------------------------------
//       */

//       const user =
//         await User.findById(
//           req.user.id
//         ).select(
//           '+password'
//         );

//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           error:
//             'User not found'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | CURRENT PASSWORD
//       |--------------------------------------------------------------------------
//       */

//       const isMatch =
//         await user.matchPassword(
//           currentPassword
//         );

//       if (!isMatch) {
//         return res.status(401).json({
//           success: false,
//           error:
//             'Current password is incorrect'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | SET NEW PASSWORD
//       |--------------------------------------------------------------------------
//       */

//       user.password =
//         newPassword;

//       user.confirmPassword =
//         confirmPassword;

//       await user.save();

//       return res.status(200).json({
//         success: true,
//         message:
//           'Password changed successfully'
//       });
//     } catch (error) {
//       console.error(
//         'Change password error:',
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         error: 'Server error'
//       });
//     }
//   };

// /*
// |--------------------------------------------------------------------------
// | LOGOUT
// |--------------------------------------------------------------------------
// | POST /api/auth/logout
// | Private
// |--------------------------------------------------------------------------
// */

// exports.logout = async (
//   req,
//   res
// ) => {
//   try {
//     return res.status(200).json({
//       success: true,
//       message:
//         'Logged out successfully'
//     });
//   } catch (error) {
//     console.error(
//       'Logout error:',
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       error: 'Server error'
//     });
//   }
// };

// /*
// |--------------------------------------------------------------------------
// | FORGOT PASSWORD
// |--------------------------------------------------------------------------
// | POST /api/auth/forgot-password
// | Public
// |--------------------------------------------------------------------------
// */

// exports.forgotPassword =
//   async (
//     req,
//     res
//   ) => {
//     try {
//       const {
//         email
//       } = req.body;

//       if (!email) {
//         return res.status(400).json({
//           success: false,
//           error:
//             'Please provide email address'
//         });
//       }

//       const normalizedEmail =
//         email
//           .trim()
//           .toLowerCase();

//       /*
//       |--------------------------------------------------------------------------
//       | FIND USER
//       |--------------------------------------------------------------------------
//       */

//       const user =
//         await User.findOne({
//           email:
//             normalizedEmail
//         });

//       if (!user) {
//         return res.status(404).json({
//           success: false,
//           error:
//             'No user found with this email'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | ADMIN CHECK
//       |--------------------------------------------------------------------------
//       */

//       if (
//         user.role ===
//         'admin'
//       ) {
//         return res.status(403).json({
//           success: false,
//           error:
//             'Admin users cannot use forgot password. Please contact system administrator.'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | CREATE RESET TOKEN
//       |--------------------------------------------------------------------------
//       */

//       const resetToken =
//         crypto
//           .randomBytes(32)
//           .toString('hex');

//       const resetTokenExpiry =
//         new Date(
//           Date.now() +
//             60 *
//               60 *
//               1000
//         );

//       user.resetToken =
//         resetToken;

//       user.resetTokenExpiry =
//         resetTokenExpiry;

//       await user.save({
//         validateBeforeSave:
//           false
//       });

//       /*
//       |--------------------------------------------------------------------------
//       | EMAIL TRANSPORTER
//       |--------------------------------------------------------------------------
//       */

//       const transporter =
//         nodemailer.createTransport({
//           service: 'gmail',

//           auth: {
//             user:
//               process.env.EMAIL_USER ||
//               'vanisystems@gmail.com',

//             pass:
//               process.env.EMAIL_PASS ||
//               'your-app-password'
//           }
//         });

//       /*
//       |--------------------------------------------------------------------------
//       | RESET LINK
//       |--------------------------------------------------------------------------
//       */

//       const resetLink =
//         `${
//           process.env.FRONTEND_URL ||
//           'http://localhost:5173'
//         }/reset-password?token=${resetToken}`;

//       /*
//       |--------------------------------------------------------------------------
//       | EMAIL CONTENT
//       |--------------------------------------------------------------------------
//       */

//       const mailOptions = {
//         from:
//           process.env.EMAIL_USER ||
//           'vanisystems@gmail.com',

//         to:
//           user.email,

//         subject:
//           'Password Reset Request - Vani E-Commerce',

//         html: `
//           <div
//             style="
//               font-family: Arial, sans-serif;
//               max-width: 600px;
//               margin: 0 auto;
//               padding: 20px;
//             "
//           >

//             <h2>
//               Password Reset Request
//             </h2>

//             <p>
//               Hello ${user.name},
//             </p>

//             <p>
//               We received a request to reset
//               your password for your Vani
//               E-Commerce account.
//             </p>

//             <p>
//               Click the button below to reset
//               your password:
//             </p>

//             <a
//               href="${resetLink}"
//               style="
//                 display: inline-block;
//                 padding: 12px 24px;
//                 background-color: #007bff;
//                 color: white;
//                 text-decoration: none;
//                 border-radius: 4px;
//                 margin: 16px 0;
//               "
//             >
//               Reset Password
//             </a>

//             <p>
//               Or copy and paste this link
//               in your browser:
//             </p>

//             <p
//               style="
//                 word-break: break-all;
//                 color: #666;
//               "
//             >
//               ${resetLink}
//             </p>

//             <p>
//               <strong>
//                 This link will expire
//                 in 1 hour.
//               </strong>
//             </p>

//             <p>
//               If you didn't request a
//               password reset, please ignore
//               this email.
//             </p>

//             <p>
//               Best regards,<br>
//               Vani E-Commerce Team
//             </p>

//           </div>
//         `
//       };

//       /*
//       |--------------------------------------------------------------------------
//       | SEND EMAIL
//       |--------------------------------------------------------------------------
//       */

//       try {
//         await transporter.sendMail(
//           mailOptions
//         );

//         return res.status(200).json({
//           success: true,

//           message:
//             'Password reset link sent to your email'
//         });
//       } catch (
//         mailError
//       ) {
//         console.warn(
//           'Email sending failed:',
//           mailError.message
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | LOCAL BYPASS
//         |--------------------------------------------------------------------------
//         */

//         return res.status(200).json({
//           success: true,

//           message:
//             'Password reset link generated (Local Bypass Active)',

//           token:
//             resetToken,

//           debugLink:
//             resetLink
//         });
//       }
//     } catch (error) {
//       console.error(
//         'Forgot password error:',
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         error: 'Server error'
//       });
//     }
//   };

// /*
// |--------------------------------------------------------------------------
// | RESET PASSWORD
// |--------------------------------------------------------------------------
// | POST /api/auth/reset-password
// | Public
// |--------------------------------------------------------------------------
// */

// exports.resetPassword =
//   async (
//     req,
//     res
//   ) => {
//     try {
//       const {
//         token,
//         newPassword,
//         confirmPassword
//       } = req.body;

//       /*
//       |--------------------------------------------------------------------------
//       | REQUIRED
//       |--------------------------------------------------------------------------
//       */

//       if (
//         !token ||
//         !newPassword ||
//         !confirmPassword
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             'Token, new password and confirm password are required'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | PASSWORD LENGTH
//       |--------------------------------------------------------------------------
//       */

//       if (
//         newPassword.length <
//         6
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             'New password must be at least 6 characters'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | PASSWORD MATCH
//       |--------------------------------------------------------------------------
//       */

//       if (
//         newPassword !==
//         confirmPassword
//       ) {
//         return res.status(400).json({
//           success: false,
//           error:
//             'New password and confirm password do not match'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | FIND USER
//       |--------------------------------------------------------------------------
//       */

//       const user =
//         await User.findOne({
//           resetToken:
//             token,

//           resetTokenExpiry: {
//             $gt: new Date()
//           }
//         }).select(
//           '+resetToken +resetTokenExpiry +password'
//         );

//       if (!user) {
//         return res.status(400).json({
//           success: false,
//           error:
//             'Invalid or expired reset token'
//         });
//       }

//       /*
//       |--------------------------------------------------------------------------
//       | SET NEW PASSWORD
//       |--------------------------------------------------------------------------
//       */

//       user.password =
//         newPassword;

//       user.confirmPassword =
//         confirmPassword;

//       /*
//       |--------------------------------------------------------------------------
//       | CLEAR RESET TOKEN
//       |--------------------------------------------------------------------------
//       */

//       user.resetToken =
//         null;

//       user.resetTokenExpiry =
//         null;

//       /*
//       |--------------------------------------------------------------------------
//       | SAVE
//       |--------------------------------------------------------------------------
//       */

//       await user.save();

//       return res.status(200).json({
//         success: true,

//         message:
//           'Password reset successfully'
//       });
//     } catch (error) {
//       console.error(
//         'Reset password error:',
//         error
//       );

//       return res.status(500).json({
//         success: false,
//         error: 'Server error'
//       });
//     }
//   };




const {
  generateToken,
  generateRefreshToken
} = require('../middleware/auth');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const User = require('../models/User');

// =====================================================
// HELPER: HTML ESCAPE
// =====================================================

const escapeHtml = (value = '') => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return entities[char];
  });
};

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword
    } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password and confirm password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password and confirm password do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({
      email: normalizedEmail
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      confirmPassword,
      role: 'user',
      isBlocked: false,
      isActive: true
    });

    const token = generateToken(
      newUser._id.toString()
    );

    const refreshToken = generateRefreshToken(
      newUser._id.toString()
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Register error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(
        err => err.message
      );

      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been blocked. Please contact administrator.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your account is inactive. Please contact administrator.'
      });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();

    user.loginHistory.push({
      date: new Date(),
      ipAddress:
        req.ip ||
        req.headers['x-forwarded-for'] ||
        '',
      userAgent: req.get('user-agent') || ''
    });

    await user.save();

    const token = generateToken(
      user._id.toString()
    );

    const refreshToken = generateRefreshToken(
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =====================================================
// GET CURRENT USER
// GET /api/auth/me
// =====================================================

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isBlocked: user.isBlocked,
          lastLogin: user.lastLogin,
          registrationDate: user.registrationDate
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =====================================================
// UPDATE PROFILE
// PUT /api/auth/update-profile
// =====================================================

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// POST /api/auth/change-password
// =====================================================

exports.changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password, new password and confirm password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password and confirm password do not match'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    user.confirmPassword = confirmPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =====================================================
// LOGOUT
// POST /api/auth/logout
// =====================================================

exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// =====================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =====================================================

exports.forgotPassword = async (req, res) => {
  let user = null;

  try {
    const { email } = req.body;

    // REQUIRED EMAIL

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide email address'
      });
    }

    // NORMALIZE EMAIL

    const normalizedEmail = email.trim().toLowerCase();

    // FIND USER

    user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with this email'
      });
    }

    // ADMIN CHECK

    if (user.role === 'admin') {  
      return res.status(403).json({
        success: false,
        error: 'Admin users cannot use forgot password. Please contact system administrator.'
      });
    }

    // EMAIL CONFIGURATION CHECK

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('EMAIL_USER or EMAIL_PASS is missing');

      return res.status(500).json({
        success: false,
        error: 'Email configuration is missing on server'
      });
    }

    // FRONTEND URL CHECK

    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ).replace(/\/+$/, '');

    // CREATE RESET TOKEN

    const resetToken = crypto.randomBytes(32).toString('hex');

    const resetTokenExpiry = new Date(
      Date.now() + 60 * 60 * 1000
    );

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await user.save({
      validateBeforeSave: false
    });

    // GMAIL SMTP TRANSPORTER

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',

      port: Number(process.env.EMAIL_PORT) || 587,

      secure: Number(process.env.EMAIL_PORT) === 465,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // VERIFY SMTP CONNECTION

    try {
      await transporter.verify();

      console.log('======================================');
      console.log('GMAIL SMTP VERIFIED SUCCESSFULLY');
      console.log('======================================');

    } catch (smtpError) {
      console.error('Gmail SMTP verification failed:', smtpError.message);

      user.resetToken = null;
      user.resetTokenExpiry = null;

      await user.save({
        validateBeforeSave: false
      });

      return res.status(500).json({
        success: false,
        error: 'Gmail SMTP connection failed. Check EMAIL_USER and EMAIL_PASS.'
      });
    }

    // GENERATE RESET LINK

    const resetLink =
      `${frontendUrl}/reset-password?token=${resetToken}`;

    // EMAIL CONTENT

    const safeName = escapeHtml(user.name || 'User');

    const mailOptions = {
      from: {
        name: 'Vani Systems',
        address: process.env.EMAIL_USER
      },

      to: user.email,

      subject: 'Password Reset Request - Vani Systems',

      text: `
Hello ${user.name || 'User'},

We received a request to reset your password.

Open this link to reset your password:

${resetLink}

This link expires in 1 hour.

If you did not request this, ignore this email.

Vani Systems Team
      `,

      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>

        <body style="
          margin:0;
          padding:20px;
          background:#f4f6f9;
          font-family:Arial,sans-serif;
        ">

          <div style="
            max-width:600px;
            margin:20px auto;
            background:#ffffff;
            padding:30px;
            border-radius:10px;
            border:1px solid #e5e7eb;
          ">

            <h2 style="color:#102a43;">
              Password Reset Request
            </h2>

            <p>Hello ${safeName},</p>

            <p>
              We received a request to reset your password
              for your Vani Systems account.
            </p>

            <p>
              Click the button below to reset your password:
            </p>

            <div style="margin:30px 0;">

              <a href="${resetLink}" style="
                display:inline-block;
                background:#0759d6;
                color:#ffffff;
                padding:14px 25px;
                border-radius:6px;
                text-decoration:none;
                font-weight:bold;
              ">
                Reset Password
              </a>

            </div>

            <p>
              If the button does not work, copy this link:
            </p>

            <p style="
              word-break:break-all;
              background:#f3f4f6;
              padding:12px;
              border-radius:5px;
              color:#0759d6;
            ">
              ${resetLink}
            </p>

            <p>
              <strong>This link expires in 1 hour.</strong>
            </p>

            <p>
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:25px 0;">

            <p style="color:#777;">
              Best regards,<br>
              Vani Systems Team
            </p>

          </div>

        </body>
        </html>
      `
    };

    // SEND EMAIL

    console.log('\n========== PASSWORD RESET EMAIL ==========');

    console.log('Sender:', process.env.EMAIL_USER);
    console.log('Recipient:', user.email);
    console.log('SMTP Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');

    let mailResult;

    try {
      mailResult = await transporter.sendMail(mailOptions);

    } catch (mailError) {
      console.error('EMAIL SENDING FAILED:', mailError.message);

      user.resetToken = null;
      user.resetTokenExpiry = null;

      await user.save({
        validateBeforeSave: false
      });

      return res.status(500).json({
        success: false,
        error: 'Unable to send password reset email. Please check Gmail SMTP configuration.'
      });
    }

    // DELIVERY DIAGNOSTICS

    console.log('Message ID:', mailResult.messageId);
    console.log('Accepted:', mailResult.accepted);
    console.log('Rejected:', mailResult.rejected);
    console.log('SMTP Response:', mailResult.response);
    console.log('Envelope:', mailResult.envelope);

    console.log('==========================================\n');

    const acceptedEmails = (mailResult.accepted || []).map(
      item => String(item.address || item).toLowerCase()
    );

    const rejectedEmails = (mailResult.rejected || []).map(
      item => String(item.address || item).toLowerCase()
    );

    const recipientAccepted = acceptedEmails.includes(
      user.email.toLowerCase()
    );

    const recipientRejected = rejectedEmails.includes(
      user.email.toLowerCase()
    );

    if (!recipientAccepted || recipientRejected) {
      console.error('Recipient was not accepted by SMTP');

      user.resetToken = null;
      user.resetTokenExpiry = null;

      await user.save({
        validateBeforeSave: false
      });

      return res.status(500).json({
        success: false,
        error: 'Email recipient was not accepted by Gmail'
      });
    }

    // SUCCESS

    console.log('PASSWORD RESET EMAIL ACCEPTED BY GMAIL');

    return res.status(200).json({
      success: true,
      message: 'Password reset email accepted by Gmail SMTP'
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    // CLEANUP RESET TOKEN IF REQUEST FAILED

    if (user) {
      try {
        user.resetToken = null;
        user.resetTokenExpiry = null;

        await user.save({
          validateBeforeSave: false
        });

      } catch (cleanupError) {
        console.error(
          'Reset token cleanup error:',
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Server error while processing forgot password'
    });
  }
};

// =====================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// =====================================================

exports.resetPassword = async (req, res) => {
  try {
    const {
      token,
      newPassword,
      confirmPassword
    } = req.body;

    // REQUIRED FIELDS

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token, new password and confirm password are required'
      });
    }

    // PASSWORD LENGTH

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    // PASSWORD MATCH

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password and confirm password do not match'
      });
    }

    // FIND USER WITH VALID RESET TOKEN

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: {
        $gt: new Date()
      }
    }).select(
      '+resetToken +resetTokenExpiry +password +confirmPassword'
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // UPDATE PASSWORD

    user.password = newPassword;
    user.confirmPassword = confirmPassword;

    // CLEAR RESET TOKEN

    user.resetToken = null;
    user.resetTokenExpiry = null;

    // SAVE USER

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};





