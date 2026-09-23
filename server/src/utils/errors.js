/**
 * Application error classes for structured error handling.
 */

class AppError extends Error {
  constructor(message, statusCode, errorType) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.name = 'AppError';
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

module.exports = { AppError, DatabaseError, ValidationError, NotFoundError };
