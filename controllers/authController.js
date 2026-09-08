const {
  generateToken,
  generateRefreshToken
} = require('../middleware/auth');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const User = require('../models/User');

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
| POST /api/auth/register
| Public
|
| ONLY:
| name
| email
| password
| confirmPassword
|--------------------------------------------------------------------------
*/

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | REQUIRED FIELDS
    |--------------------------------------------------------------------------
    */

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Name, email, password and confirm password are required'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PASSWORD MATCH
    |--------------------------------------------------------------------------
    */

    if (
      password !==
      confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Password and confirm password do not match'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PASSWORD LENGTH
    |--------------------------------------------------------------------------
    */

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error:
          'Password must be at least 6 characters'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE EMAIL
    |--------------------------------------------------------------------------
    */

    const normalizedEmail =
      email.trim().toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING USER
    |--------------------------------------------------------------------------
    */

    const userExists =
      await User.findOne({
        email: normalizedEmail
      });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error:
          'User already exists with this email'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE USER
    |--------------------------------------------------------------------------
    */

    const newUser =
      await User.create({
        name: name.trim(),

        email: normalizedEmail,

        password,

        confirmPassword,

        role: 'user',

        isBlocked: false,

        isActive: true
      });

    /*
    |--------------------------------------------------------------------------
    | GENERATE TOKEN
    |--------------------------------------------------------------------------
    */

    const token =
      generateToken(
        newUser._id.toString()
      );

    const refreshToken =
      generateRefreshToken(
        newUser._id.toString()
      );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message:
        'Registration successful',

      data: {
        user: {
          id:
            newUser._id.toString(),

          name:
            newUser.name,

          email:
            newUser.email,

          role:
            newUser.role
        },

        token,

        refreshToken
      }
    });
  } catch (error) {
    console.error(
      'Register error:',
      error
    );

    /*
    |--------------------------------------------------------------------------
    | MONGOOSE VALIDATION ERROR
    |--------------------------------------------------------------------------
    */

    if (
      error.name ===
      'ValidationError'
    ) {
      const errors =
        Object.values(
          error.errors
        ).map(
          (err) =>
            err.message
        );

      return res.status(400).json({
        success: false,
        error:
          errors.join(', ')
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DUPLICATE EMAIL
    |--------------------------------------------------------------------------
    */

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error:
          'User already exists with this email'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
| POST /api/auth/login
| Public
|
| ONLY:
| email
| password
|--------------------------------------------------------------------------
*/

exports.login = async (
  req,
  res
) => {
  try {
    const {
      email,
      password
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | REQUIRED FIELDS
    |--------------------------------------------------------------------------
    */

    if (
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Email and password are required'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE EMAIL
    |--------------------------------------------------------------------------
    */

    const normalizedEmail =
      email.trim().toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | FIND USER
    |--------------------------------------------------------------------------
    */

    const user =
      await User.findOne({
        email:
          normalizedEmail
      }).select(
        '+password'
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        error:
          'Invalid credentials'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | BLOCK CHECK
    |--------------------------------------------------------------------------
    */

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        error:
          'Your account has been blocked. Please contact administrator.'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ACTIVE CHECK
    |--------------------------------------------------------------------------
    */

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error:
          'Your account is inactive. Please contact administrator.'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | PASSWORD CHECK
    |--------------------------------------------------------------------------
    */

    const isPasswordMatch =
      await user.matchPassword(
        password
      );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error:
          'Invalid credentials'
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE LOGIN INFORMATION
    |--------------------------------------------------------------------------
    */

    user.lastLogin =
      new Date();

    user.loginHistory.push({
      date: new Date(),

      ipAddress:
        req.ip ||
        req.headers[
          'x-forwarded-for'
        ] ||
        '',

      userAgent:
        req.get(
          'user-agent'
        ) || ''
    });

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | GENERATE TOKEN
    |--------------------------------------------------------------------------
    */

    const token =
      generateToken(
        user._id.toString()
      );

    const refreshToken =
      generateRefreshToken(
        user._id.toString()
      );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message:
        'Login successful',

      data: {
        user: {
          id:
            user._id.toString(),

          name:
            user.name,

          email:
            user.email,

          role:
            user.role
        },

        token,

        refreshToken
      }
    });
  } catch (error) {
    console.error(
      'Login error:',
      error
    );

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
| GET /api/auth/me
| Private
|--------------------------------------------------------------------------
*/

exports.getMe = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        error:
          'User not found'
      });
    }

    return res.status(200).json({
      success: true,

      data: {
        user: {
          id:
            user._id.toString(),

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          isActive:
            user.isActive,

          isBlocked:
            user.isBlocked,

          lastLogin:
            user.lastLogin,

          registrationDate:
            user.registrationDate
        }
      }
    });
  } catch (error) {
    console.error(
      'Get user error:',
      error
    );

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
| PUT /api/auth/update-profile
| Private
|
| ONLY NAME
|--------------------------------------------------------------------------
*/

exports.updateProfile =
  async (
    req,
    res
  ) => {
    try {
      const {
        name
      } = req.body;

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          error:
            'User not found'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE NAME ONLY
      |--------------------------------------------------------------------------
      */

      if (
        name !== undefined
      ) {
        user.name =
          name.trim();
      }

      await user.save();

      return res.status(200).json({
        success: true,

        message:
          'Profile updated successfully',

        data: {
          user: {
            id:
              user._id.toString(),

            name:
              user.name,

            email:
              user.email,

            role:
              user.role
          }
        }
      });
    } catch (error) {
      console.error(
        'Update profile error:',
        error
      );

      return res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
| POST /api/auth/change-password
| Private
|--------------------------------------------------------------------------
*/

exports.changePassword =
  async (
    req,
    res
  ) => {
    try {
      const {
        currentPassword,
        newPassword,
        confirmPassword
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | REQUIRED
      |--------------------------------------------------------------------------
      */

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Current password, new password and confirm password are required'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | NEW PASSWORD LENGTH
      |--------------------------------------------------------------------------
      */

      if (
        newPassword.length <
        6
      ) {
        return res.status(400).json({
          success: false,
          error:
            'New password must be at least 6 characters'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PASSWORD MATCH
      |--------------------------------------------------------------------------
      */

      if (
        newPassword !==
        confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          error:
            'New password and confirm password do not match'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | FIND USER
      |--------------------------------------------------------------------------
      */

      const user =
        await User.findById(
          req.user.id
        ).select(
          '+password'
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          error:
            'User not found'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CURRENT PASSWORD
      |--------------------------------------------------------------------------
      */

      const isMatch =
        await user.matchPassword(
          currentPassword
        );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error:
            'Current password is incorrect'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | SET NEW PASSWORD
      |--------------------------------------------------------------------------
      */

      user.password =
        newPassword;

      user.confirmPassword =
        confirmPassword;

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          'Password changed successfully'
      });
    } catch (error) {
      console.error(
        'Change password error:',
        error
      );

      return res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
| POST /api/auth/logout
| Private
|--------------------------------------------------------------------------
*/

exports.logout = async (
  req,
  res
) => {
  try {
    return res.status(200).json({
      success: true,
      message:
        'Logged out successfully'
    });
  } catch (error) {
    console.error(
      'Logout error:',
      error
    );

    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
| POST /api/auth/forgot-password
| Public
|--------------------------------------------------------------------------
*/

exports.forgotPassword =
  async (
    req,
    res
  ) => {
    try {
      const {
        email
      } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error:
            'Please provide email address'
        });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      /*
      |--------------------------------------------------------------------------
      | FIND USER
      |--------------------------------------------------------------------------
      */

      const user =
        await User.findOne({
          email:
            normalizedEmail
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          error:
            'No user found with this email'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | ADMIN CHECK
      |--------------------------------------------------------------------------
      */

      if (
        user.role ===
        'admin'
      ) {
        return res.status(403).json({
          success: false,
          error:
            'Admin users cannot use forgot password. Please contact system administrator.'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE RESET TOKEN
      |--------------------------------------------------------------------------
      */

      const resetToken =
        crypto
          .randomBytes(32)
          .toString('hex');

      const resetTokenExpiry =
        new Date(
          Date.now() +
            60 *
              60 *
              1000
        );

      user.resetToken =
        resetToken;

      user.resetTokenExpiry =
        resetTokenExpiry;

      await user.save({
        validateBeforeSave:
          false
      });

      /*
      |--------------------------------------------------------------------------
      | EMAIL TRANSPORTER
      |--------------------------------------------------------------------------
      */

      const transporter =
        nodemailer.createTransport({
          service: 'gmail',

          auth: {
            user:
              process.env.EMAIL_USER ||
              'vanisystems@gmail.com',

            pass:
              process.env.EMAIL_PASS ||
              'your-app-password'
          }
        });

      /*
      |--------------------------------------------------------------------------
      | RESET LINK
      |--------------------------------------------------------------------------
      */

      const resetLink =
        `${
          process.env.FRONTEND_URL ||
          'http://localhost:5173'
        }/reset-password?token=${resetToken}`;

      /*
      |--------------------------------------------------------------------------
      | EMAIL CONTENT
      |--------------------------------------------------------------------------
      */

      const mailOptions = {
        from:
          process.env.EMAIL_USER ||
          'vanisystems@gmail.com',

        to:
          user.email,

        subject:
          'Password Reset Request - Vani E-Commerce',

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            "
          >

            <h2>
              Password Reset Request
            </h2>

            <p>
              Hello ${user.name},
            </p>

            <p>
              We received a request to reset
              your password for your Vani
              E-Commerce account.
            </p>

            <p>
              Click the button below to reset
              your password:
            </p>

            <a
              href="${resetLink}"
              style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                margin: 16px 0;
              "
            >
              Reset Password
            </a>

            <p>
              Or copy and paste this link
              in your browser:
            </p>

            <p
              style="
                word-break: break-all;
                color: #666;
              "
            >
              ${resetLink}
            </p>

            <p>
              <strong>
                This link will expire
                in 1 hour.
              </strong>
            </p>

            <p>
              If you didn't request a
              password reset, please ignore
              this email.
            </p>

            <p>
              Best regards,<br>
              Vani E-Commerce Team
            </p>

          </div>
        `
      };

      /*
      |--------------------------------------------------------------------------
      | SEND EMAIL
      |--------------------------------------------------------------------------
      */

      try {
        await transporter.sendMail(
          mailOptions
        );

        return res.status(200).json({
          success: true,

          message:
            'Password reset link sent to your email'
        });
      } catch (
        mailError
      ) {
        console.warn(
          'Email sending failed:',
          mailError.message
        );

        /*
        |--------------------------------------------------------------------------
        | LOCAL BYPASS
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({
          success: true,

          message:
            'Password reset link generated (Local Bypass Active)',

          token:
            resetToken,

          debugLink:
            resetLink
        });
      }
    } catch (error) {
      console.error(
        'Forgot password error:',
        error
      );

      return res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
| POST /api/auth/reset-password
| Public
|--------------------------------------------------------------------------
*/

exports.resetPassword =
  async (
    req,
    res
  ) => {
    try {
      const {
        token,
        newPassword,
        confirmPassword
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | REQUIRED
      |--------------------------------------------------------------------------
      */

      if (
        !token ||
        !newPassword ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Token, new password and confirm password are required'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PASSWORD LENGTH
      |--------------------------------------------------------------------------
      */

      if (
        newPassword.length <
        6
      ) {
        return res.status(400).json({
          success: false,
          error:
            'New password must be at least 6 characters'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PASSWORD MATCH
      |--------------------------------------------------------------------------
      */

      if (
        newPassword !==
        confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          error:
            'New password and confirm password do not match'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | FIND USER
      |--------------------------------------------------------------------------
      */

      const user =
        await User.findOne({
          resetToken:
            token,

          resetTokenExpiry: {
            $gt: new Date()
          }
        }).select(
          '+resetToken +resetTokenExpiry +password'
        );

      if (!user) {
        return res.status(400).json({
          success: false,
          error:
            'Invalid or expired reset token'
        });
      }

      /*
      |--------------------------------------------------------------------------
      | SET NEW PASSWORD
      |--------------------------------------------------------------------------
      */

      user.password =
        newPassword;

      user.confirmPassword =
        confirmPassword;

      /*
      |--------------------------------------------------------------------------
      | CLEAR RESET TOKEN
      |--------------------------------------------------------------------------
      */

      user.resetToken =
        null;

      user.resetTokenExpiry =
        null;

      /*
      |--------------------------------------------------------------------------
      | SAVE
      |--------------------------------------------------------------------------
      */

      await user.save();

      return res.status(200).json({
        success: true,

        message:
          'Password reset successfully'
      });
    } catch (error) {
      console.error(
        'Reset password error:',
        error
      );

      return res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };
