const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/)
    .withMessage('Password must contain at least one special character'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),
  body('role')
    .optional()
    .isIn(['USER', 'STORE_OWNER'])
    .withMessage('Invalid role'),
  body('store_name')
    .if(body('role').equals('STORE_OWNER'))
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters'),
  body('gstin')
    .if(body('role').equals('STORE_OWNER'))
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z0-9]{1}[0-9A-Z]{1}$/i)
    .withMessage('GSTIN must be a valid 15-character Goods and Services Tax Identification Number (e.g. 27AAPFU0939F1ZV)'),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validatePasswordUpdate = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/)
    .withMessage('Password must contain at least one special character'),
  handleValidationErrors,
];

const validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/)
    .withMessage('Password must contain at least one special character'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),
  body('role')
    .isIn(['ADMIN', 'USER', 'STORE_OWNER'])
    .withMessage('Role must be ADMIN, USER, or STORE_OWNER'),
  handleValidationErrors,
];

const validateCreateStore = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters'),
  handleValidationErrors,
];

const validateRating = [
  body('store_id')
    .notEmpty()
    .withMessage('Store ID is required')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  handleValidationErrors,
];

module.exports = {
  validateSignup,
  validateLogin,
  validatePasswordUpdate,
  validateCreateUser,
  validateCreateStore,
  validateRating,
};
