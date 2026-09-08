
const express = require('express');

const {
  body,
  validationResult
} = require('express-validator');

const {
  protect
} = require('../middleware/auth');

const authController =
  require('../controllers/authController');

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword
} = authController;

const router = express.Router();

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
| POST /api/auth/register
| Public
|
| Fields:
| name
| email
| password
| confirmPassword
|--------------------------------------------------------------------------
*/

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 50 })
      .withMessage(
        'Name cannot be more than 50 characters'
      ),

    body('email')
      .trim()
      .isEmail()
      .withMessage(
        'Please provide a valid email'
      )
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage(
        'Password must be at least 6 characters'
      ),

    body('confirmPassword')
      .notEmpty()
      .withMessage(
        'Confirm password is required'
      )
      .isLength({ min: 6 })
      .withMessage(
        'Confirm password must be at least 6 characters'
      ),

    body('confirmPassword').custom(
      (confirmPassword, { req }) => {
        if (
          confirmPassword !==
          req.body.password
        ) {
          throw new Error(
            'Password and confirm password do not match'
          );
        }

        return true;
      }
    )
  ],
  (req, res) => {
    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return register(req, res);
  }
);

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
| POST /api/auth/login
| Public
|
| Fields:
| email
| password
|--------------------------------------------------------------------------
*/

router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage(
        'Please provide a valid email'
      )
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage(
        'Password is required'
      )
  ],
  (req, res) => {
    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return login(req, res);
  }
);

/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
| GET /api/auth/me
| Private
|--------------------------------------------------------------------------
*/

router.get(
  '/me',
  protect,
  getMe
);

/*
|--------------------------------------------------------------------------
| UPDATE PROFILE
|--------------------------------------------------------------------------
| PUT /api/auth/update-profile
| Private
|--------------------------------------------------------------------------
|
| Only name is allowed.
|--------------------------------------------------------------------------
*/

router.put(
  '/update-profile',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage(
        'Name cannot be empty'
      )
      .isLength({ max: 50 })
      .withMessage(
        'Name cannot be more than 50 characters'
      )
  ],
  (req, res) => {
    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return updateProfile(req, res);
  }
);

/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
| POST /api/auth/change-password
| Private
|
| Fields:
| currentPassword
| newPassword
| confirmPassword
|--------------------------------------------------------------------------
*/

router.post(
  '/change-password',
  protect,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage(
        'Current password is required'
      ),

    body('newPassword')
      .notEmpty()
      .withMessage(
        'New password is required'
      )
      .isLength({ min: 6 })
      .withMessage(
        'New password must be at least 6 characters'
      ),

    body('confirmPassword')
      .notEmpty()
      .withMessage(
        'Confirm password is required'
      ),

    body('confirmPassword').custom(
      (confirmPassword, { req }) => {
        if (
          confirmPassword !==
          req.body.newPassword
        ) {
          throw new Error(
            'New password and confirm password do not match'
          );
        }

        return true;
      }
    )
  ],
  (req, res) => {
    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return changePassword(req, res);
  }
);

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
| POST /api/auth/logout
| Private
|--------------------------------------------------------------------------
*/

router.post(
  '/logout',
  protect,
  logout
);

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
| POST /api/auth/forgot-password
| Public
|--------------------------------------------------------------------------
*/

router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage(
        'Email is required'
      )
      .isEmail()
      .withMessage(
        'Please provide a valid email'
      )
      .normalizeEmail()
  ],
  (req, res) => {
    console.log(
      'Forgot password route hit'
    );

    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return forgotPassword(req, res);
  }
);

/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
| POST /api/auth/reset-password
| Public
|
| Fields:
| token
| newPassword
| confirmPassword
|--------------------------------------------------------------------------
*/

router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage(
        'Token is required'
      ),

    body('newPassword')
      .notEmpty()
      .withMessage(
        'New password is required'
      )
      .isLength({ min: 6 })
      .withMessage(
        'New password must be at least 6 characters'
      ),

    body('confirmPassword')
      .notEmpty()
      .withMessage(
        'Confirm password is required'
      ),

    body('confirmPassword').custom(
      (confirmPassword, { req }) => {
        if (
          confirmPassword !==
          req.body.newPassword
        ) {
          throw new Error(
            'New password and confirm password do not match'
          );
        }

        return true;
      }
    )
  ],
  (req, res) => {
    const errors =
      validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return resetPassword(req, res);
  }
);

module.exports = router;
