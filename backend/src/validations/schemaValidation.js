import { z } from "zod";

// ==================== DENTIST VALIDATIONS ====================

// Create Dentist Schema
export const createDentistSchema = z.object({
  body: z.object({
    practiceName: z.string().min(1, "Practice name is required").max(100, "Practice name must be less than 100 characters"),
    email: z.string().email("Invalid email format"),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});

// Update Dentist Schema
export const updateDentistSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Dentist ID is required")
  }),
  body: z.object({
    practiceName: z.string().min(1, "Practice name is required").max(100, "Practice name must be less than 100 characters"),
    email: z.string().email("Invalid email format"),
    phone: z.string().optional(),
    address: z.string().optional()
  })
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters")
  })
});

// Get Dentist by ID Schema
export const getDentistByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Dentist ID is required")
  })
});

// Delete Dentist Schema
export const deleteDentistSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Dentist ID is required")
  })
});

// Get All Dentists Query Schema
export const getAllDentistsQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    cursor: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional().transform(val => {
      if (val === "All" || val === "all") return undefined;
      return val;
    }),
    practiceName: z.string().optional()
  })
});

// Get Dentist Stats Query Schema
export const getDentistStatsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional().transform(val => {
      if (val === "All" || val === "all") return undefined;
      return val;
    }),
    practiceName: z.string().optional()
  })
});

// Get Practice Names Query Schema
export const getPracticeNamesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined)
  })
});

// ==================== PARTNER VALIDATIONS ====================

// Create Partner Schema
export const createPartnerSchema = z.object({
  body: z.object({
    businessType: z.string().min(1, "Business type is required").max(50, "Business type must be less than 50 characters"),
    contactName: z.string().min(1, "Contact name is required").max(100, "Contact name must be less than 100 characters"),
    email: z.string().email("Invalid email format"),
    typeOfBusiness: z.string().min(1, "Type of business is required").max(100, "Type of business must be less than 100 characters")
  })
});

// Get My Partners Query Schema
export const getMyPartnersQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    cursor: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional().transform(val => {
      if (val === "All" || val === "all") return undefined;
      return val;
    }),
    companyName: z.string().optional()
  })
});

// Delete Partner Schema
export const deletePartnerSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Partner ID is required")
  })
});

// Update Partner Status Schema
export const updatePartnerStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Partner ID is required")
  }),
  body: z.object({
    status: z.enum(["active", "inactive", "pending"], {
      errorMap: () => ({ message: "Status must be one of: active, inactive, pending" })
    })
  })
});

// Get Partner Stats Query Schema
export const getPartnerStatsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional().transform(val => {
      if (val === "All" || val === "all") return undefined;
      return val;
    }),
    companyName: z.string().optional()
  })
});

// Get Company Names Query Schema
export const getCompanyNamesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined)
  })
});

// ==================== PATIENT VALIDATIONS ====================

// Create Patient Schema
export const createPatientSchema = z.object({
  body: z.object({
    patientName: z.string().min(1, "Patient name is required").max(100, "Patient name must be less than 100 characters"),
    email: z.string().email("Invalid email format"),
    phoneNumber: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    address: z.string().optional()
  })
});

// Get My Patients Query Schema
export const getMyPatientsQuerySchema = z.object({
  query: z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    cursor: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional().transform(val => {
      if (val === "All" || val === "all") return undefined;
      return val;
    }),
    patientName: z.string().optional()
  })
});

// Delete Patient Schema
export const deletePatientSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Patient ID is required")
  })
});

// Update Patient Status Schema
export const updatePatientStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Patient ID is required")
  }),
  body: z.object({
    status: z.enum(["active", "inactive", "pending"], {
      errorMap: () => ({ message: "Status must be one of: active, inactive, pending" })
    })
  })
});

// Get Patient Stats Query Schema
export const getPatientStatsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional().transform(val => {
      if (val === "All" || val === "all") return undefined;
      return val;
    }),
    patientName: z.string().optional()
  })
});

// Get Patient Names Query Schema
export const getPatientNamesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined)
  })
});
