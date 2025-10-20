import Joi from 'joi';

// Custom validation functions
const isValidSSN = (value, helpers) => {
  // Normalize and validate SSN; accept formatted inputs like 123-45-6789
  const cleanSSN = String(value).replace(/\D/g, '');
  if (cleanSSN.length !== 9) {
    return helpers.error('any.invalid');
  }
  // Reject obviously invalid all-zero inputs
  if (/^0{9}$/.test(cleanSSN)) {
    return helpers.error('any.invalid');
  }
  // Return normalized value (digits only)
  return cleanSSN;
};

const isValidDateOfBirth = (value, helpers) => {
  const dob = new Date(value);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  if (age < 18 || age > 120) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Client creation schema
export const createClientSchema = Joi.object({
  // Personal Information
  firstName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  
  middleName: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'Middle name cannot exceed 50 characters'
    }),
  
  lastName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  
  suffix: Joi.string()
    .max(10)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'Suffix cannot exceed 10 characters'
    }),
  
  // Contact Information
  email: Joi.string()
    .email()
    .min(1)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required for onboarding',
      'string.min': 'Email is required for onboarding',
      'string.email': 'Please enter a valid email address'
    }),
  
  dateOfBirth: Joi.string()
    .custom(isValidDateOfBirth)
    .required()
    .messages({
      'any.invalid': 'Age must be between 18 and 120 years'
    }),
  
  // Address Information
  mailingAddress: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.empty': 'Mailing address is required',
      'string.min': 'Mailing address is required',
      'string.max': 'Mailing address cannot exceed 200 characters'
    }),
  
  city: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'City is required',
      'string.min': 'City is required',
      'string.max': 'City cannot exceed 50 characters'
    }),
  
  state: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'State is required',
      'string.min': 'State is required',
      'string.max': 'State cannot exceed 50 characters'
    }),
  
  zipCode: Joi.string()
    .pattern(/^\d{5}(-\d{4})?$/)
    .trim()
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid zip code'
    }),
  
  country: Joi.string()
    .max(50)
    .trim()
    .default('United States')
    .required()
    .messages({
      'string.max': 'Country cannot exceed 50 characters'
    }),
  
  // Phone numbers
  phoneMobile: Joi.string()
    .pattern(/^\+?1?[-\.\s]?\(?([0-9]{3})\)?[-\.\s]?([0-9]{3})[-\.\s]?([0-9]{4})$/)
    .trim()
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid mobile phone number'
    }),
  
  fax: Joi.string()
    .pattern(/^\+?1?[-\.\s]?\(?([0-9]{3})\)?[-\.\s]?([0-9]{3})[-\.\s]?([0-9]{4})$/)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid fax number'
    }),
  
  // Identity Information
  ssn: Joi.string()
    .custom(isValidSSN)
    .trim()
    .required()
    .messages({
      'any.invalid': 'Please enter a valid SSN'
    }),
  
  experianReport: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'Experian report number cannot exceed 50 characters'
    }),
  
  transunionFileNumber: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'TransUnion file number cannot exceed 50 characters'
    }),

  // Dispute schedule fields removed
});

// Client update schema (all fields optional except ID)
export const updateClientSchema = Joi.object({
  firstName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'First name is required',
      'string.max': 'First name cannot exceed 50 characters'
    }),
  
  middleName: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'Middle name cannot exceed 50 characters'
    }),
  
  lastName: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'Last name is required',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  
  suffix: Joi.string()
    .max(10)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'Suffix cannot exceed 10 characters'
    }),
  
  email: Joi.string()
    .email()
    .min(1)
    .lowercase()
    .trim()
    .optional()
    .messages({
      'string.min': 'Email is required for onboarding',
      'string.email': 'Please enter a valid email address'
    }),
  
  dateOfBirth: Joi.string()
    .custom(isValidDateOfBirth)
    .optional()
    .messages({
      'any.invalid': 'Age must be between 18 and 120 years'
    }),
  
  mailingAddress: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .optional()
    .messages({
      'string.min': 'Mailing address is required',
      'string.max': 'Mailing address cannot exceed 200 characters'
    }),
  
  city: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'City is required',
      'string.max': 'City cannot exceed 50 characters'
    }),
  
  state: Joi.string()
    .min(1)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'State is required',
      'string.max': 'State cannot exceed 50 characters'
    }),
  
  zipCode: Joi.string()
    .pattern(/^\d{5}(-\d{4})?$/)
    .trim()
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid zip code'
    }),
  
  country: Joi.string()
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.max': 'Country cannot exceed 50 characters'
    }),
  
  // Phone numbers
  phoneMobile: Joi.string()
    .pattern(/^\+?1?[-\.\s]?\(?([0-9]{3})\)?[-\.\s]?([0-9]{3})[-\.\s]?([0-9]{4})$/)
    .trim()
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid mobile phone number'
    }),
  
  fax: Joi.string()
    .pattern(/^\+?1?[-\.\s]?\(?([0-9]{3})\)?[-\.\s]?([0-9]{3})[-\.\s]?([0-9]{4})$/)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid fax number'
    }),
  ssn: Joi.string()
    .custom(isValidSSN)
    .trim()
    .optional()
    .messages({
      'any.invalid': 'Please enter a valid SSN'
    }),
  
  experianReport: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'Experian report number cannot exceed 50 characters'
    }),
  
  transunionFileNumber: Joi.string()
    .max(50)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'TransUnion file number cannot exceed 50 characters'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive', 'pending', 'archived')
    .optional(),

  // Dispute schedule fields removed
});

// Query parameters schema for listing clients
export const clientQuerySchema = Joi.object({
  page: Joi.string()
    .pattern(/^\d+$/)
    .default('1')
    .messages({
      'string.pattern.base': 'Page must be a positive integer'
    }),
  
  limit: Joi.string()
    .pattern(/^\d+$/)
    .default('10')
    .messages({
      'string.pattern.base': 'Limit must be a positive integer'
    }),
  
  search: Joi.string()
    .max(100)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive', 'pending', 'archived')
    .optional(),
  
  sortBy: Joi.string()
    .valid('firstName', 'lastName', 'email', 'createdAt', 'updatedAt')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        status: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }
    
    req.body = value;
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        status: false,
        message: 'Query validation failed',
        errors: errorMessages
      });
    }
    
    // Store validated query params in a custom property instead of modifying req.query
    req.validatedQuery = value;
    next();
  };
};

// Account creation schema
export const createAccountSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  bureau: Joi.string()
    .valid('Experian', 'Equifax', 'TransUnion')
    .required()
    .messages({
      'any.only': 'Bureau must be one of: Experian, Equifax, TransUnion',
      'any.required': 'Bureau is required'
    }),
  
  accountData: Joi.object({
    accountName: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'Account name is required',
        'string.min': 'Account name is required',
        'string.max': 'Account name cannot exceed 100 characters'
      }),
    
    accountNumber: Joi.string()
      .min(1)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'Account number is required',
        'string.min': 'Account number is required',
        'string.max': 'Account number cannot exceed 50 characters'
      }),
    
    balance: Joi.number()
      .min(0)
      .optional()
      .messages({
        'number.min': 'Balance cannot be negative'
      }),
    
    dateOpened: Joi.date()
      .iso()
      .max('now')
      .optional()
      .messages({
        'date.format': 'Date opened must be a valid date',
        'date.max': 'Date opened cannot be in the future'
      }),
    
    status: Joi.string()
      .valid('Positive', 'Negative')
      .optional()
      .messages({
        'any.only': 'Status must be either Positive or Negative'
      })
  }).required()
    .messages({
      'any.required': 'Account data is required'
    })
});