import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  middleName: {
    type: String,
    trim: true,
    maxlength: [50, 'Middle name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  suffix: {
    type: String,
    trim: true,
    maxlength: [10, 'Suffix cannot exceed 10 characters']
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required for onboarding'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  
  // Address Information
  mailingAddress: {
    type: String,
    required: [true, 'Mailing address is required'],
    trim: true,
    maxlength: [200, 'Mailing address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
    trim: true,
    match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid zip code']
  },
  country: {
    type: String,
    default: 'United States',
    trim: true,
    maxlength: [50, 'Country cannot exceed 50 characters']
  },
  
  // Phone Numbers
  phoneMobile: {
    type: String,
    required: [true, 'Mobile phone is required'],
    trim: true,
    match: [/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 'Please enter a valid mobile phone number']
  },
  phoneAlternate: {
    type: String,
    trim: true,
    match: [/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 'Please enter a valid alternate phone number']
  },
  phoneWork: {
    type: String,
    trim: true,
    match: [/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 'Please enter a valid work phone number']
  },
  fax: {
    type: String,
    trim: true,
    match: [/^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 'Please enter a valid fax number']
  },
  
  // Identity Information
  ssn: {
    type: String,
    required: [true, 'SSN is required'],
    trim: true,
    match: [/^\d{9}$/, 'SSN must be exactly 9 digits'],
    select: false // Don't include SSN in queries by default for security
  },
  experianReport: {
    type: String,
    trim: true,
    maxlength: [50, 'Experian report number cannot exceed 50 characters']
  },
  transunionFileNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'TransUnion file number cannot exceed 50 characters']
  },
  
  // Note: Document fields removed for now
  // Will be implemented later when file upload functionality is added
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'archived'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
clientSchema.index({ firstName: 1, lastName: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: -1 });

// Virtual for full name
clientSchema.virtual('fullName').get(function() {
  let fullName = this.firstName;
  if (this.middleName) fullName += ` ${this.middleName}`;
  fullName += ` ${this.lastName}`;
  if (this.suffix) fullName += ` ${this.suffix}`;
  return fullName;
});

// Ensure virtual fields are serialized
clientSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to format phone numbers
clientSchema.pre('save', function(next) {
  // Format phone numbers to remove all non-digit characters except +
  const formatPhone = (phone) => {
    if (!phone) return phone;
    return phone.replace(/[^\d+]/g, '');
  };
  
  this.phoneMobile = formatPhone(this.phoneMobile);
  this.phoneAlternate = formatPhone(this.phoneAlternate);
  this.phoneWork = formatPhone(this.phoneWork);
  this.fax = formatPhone(this.fax);
  
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;