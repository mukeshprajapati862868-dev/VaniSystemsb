const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        'Please provide a valid email'
      ]
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },

    confirmPassword: {
      type: String,
      required: [true, 'Please confirm your password'],
      minlength: [6, 'Confirm password must be at least 6 characters'],
      select: false
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    lastLogin: {
      type: Date,
      default: null
    },

    loginHistory: [
      {
        date: {
          type: Date,
          default: Date.now
        },

        ipAddress: {
          type: String,
          default: ''
        },

        userAgent: {
          type: String,
          default: ''
        }
      }
    ],

    resetToken: {
      type: String,
      default: null,
      select: false
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
      select: false
    },

    registrationDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/*
|--------------------------------------------------------------------------
| PASSWORD HASHING
|--------------------------------------------------------------------------
*/

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  if (
    this.confirmPassword !== undefined &&
    this.password !== this.confirmPassword
  ) {
    throw new Error(
      'Password and confirm password do not match'
    );
  }

  const saltRounds =
    parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

  const salt = await bcrypt.genSalt(saltRounds);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  // Confirm password ko database mein save nahi karna
  this.confirmPassword = undefined;
});

/*
|--------------------------------------------------------------------------
| MATCH PASSWORD
|--------------------------------------------------------------------------
*/

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

/*
|--------------------------------------------------------------------------
| RESET PASSWORD TOKEN
|--------------------------------------------------------------------------
*/

userSchema.methods.getResetPasswordToken = function () {
  const resetToken =
    crypto.randomBytes(32).toString('hex');

  this.resetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetTokenExpiry = new Date(
    Date.now() + 60 * 60 * 1000
  );

  return resetToken;
};

module.exports = mongoose.model(
  'User',
  userSchema
);
