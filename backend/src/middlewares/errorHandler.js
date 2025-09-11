import mongoose from "mongoose";

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";
  
  console.log("Error:", err);

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const errors = {};

    // Handle Yup validation errors
    if (err.inner) {
      err.inner.forEach((validationError) => {
        const { path, message } = validationError;
        errors[path] = message;
      });
    }

    // Handle Mongoose validation errors
    if (err.errors) {
      for (let field in err.errors) {
        const error = err.errors[field];
        if (error instanceof mongoose.Error.CastError) {
          const path = error.path;
          const kind = error.kind;
          errors[field] = `${path} must be ${kind}`;
        } else {
          errors[field] = error.message;
        }
      }
    }

    // Getting the first key-value pair
    const firstError = Object.values(errors)[0];
    return res.status(422).json({ 
      status: false, 
      message: firstError, 
      errors 
    });
  }

  // Handle MongoDB Duplicate Key Error
  if (err.name === "MongoError" && err.code === 11000) {
    statusCode = 400;
    message = "Duplicate key violation. This resource already exists.";
  }

  // Handle MongoDB Server Selection Error
  if (err.name === "MongoServerSelectionError") {
    statusCode = 503;
    message = "Database connection failed. Please try again later.";
  }

  // Handle specific CastError for ObjectId
  if (err.name === "CastError" && err instanceof mongoose.Error.CastError) {
    if (err.kind === "ObjectId") {
      statusCode = 400;
      message = "Invalid resource id";
    }
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // Handle JSON Parsing Errors
  if (err.name === "SyntaxError" && err instanceof SyntaxError) {
    statusCode = 400;
    message = "Invalid JSON format";
  }

  // Handle Type Errors
  if (err.name === "TypeError" && err instanceof TypeError) {
    statusCode = 400;
    message = "Type error occurred";
  }

  // Handle Multer File Upload Errors
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File size too large";
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file field";
  }

  // Handle Rate Limiting Errors
  if (err.status === 429) {
    statusCode = 429;
    message = "Too many requests. Please try again later.";
  }

  // Handle Network Errors
  if (err.code === "ECONNREFUSED") {
    statusCode = 503;
    message = "Service temporarily unavailable";
  }

  // Handle Timeout Errors
  if (err.code === "ETIMEDOUT") {
    statusCode = 408;
    message = "Request timeout";
  }

  // Log error details in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error Stack:", err.stack);
    console.error("Error Details:", {
      name: err.name,
      code: err.code,
      status: err.status,
      message: err.message
    });
  }

  // Send the error response
  res.status(statusCode).json({ 
    status: false, 
    message: message,
    ...(process.env.NODE_ENV === "development" && { 
      stack: err.stack,
      details: err 
    })
  });
};

export default globalErrorHandler; 