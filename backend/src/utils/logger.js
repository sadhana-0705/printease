const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get current date for log file naming
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Get timestamp for log entries
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Write log to file
const writeLog = (level, message, meta = {}) => {
  const logFile = path.join(logsDir, `${getCurrentDate()}.log`);
  
  const logEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...meta
  };

  const logLine = JSON.stringify(logEntry) + '\n';

  // Append to log file asynchronously
  fs.appendFile(logFile, logLine, (err) => {
    if (err) console.error('Failed to write log:', err);
  });

  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    const consoleMessage = `[${level}] ${message}`;
    if (level === LOG_LEVELS.ERROR) {
      console.error(consoleMessage, meta);
    } else if (level === LOG_LEVELS.WARN) {
      console.warn(consoleMessage, meta);
    } else {
      console.log(consoleMessage, meta);
    }
  }
};

// Error logger
exports.logError = (message, error, req = null) => {
  const meta = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  };

  if (req) {
    meta.request = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
  }

  writeLog(LOG_LEVELS.ERROR, message, meta);
};

// Warning logger
exports.logWarn = (message, meta = {}) => {
  writeLog(LOG_LEVELS.WARN, message, meta);
};

// Info logger
exports.logInfo = (message, meta = {}) => {
  writeLog(LOG_LEVELS.INFO, message, meta);
};

// Debug logger
exports.logDebug = (message, meta = {}) => {
  writeLog(LOG_LEVELS.DEBUG, message, meta);
};

// Request logging middleware
exports.requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip
    };

    if (res.statusCode >= 500) {
      exports.logError(`HTTP ${res.statusCode}`, new Error(res.statusText || 'Internal Server Error'), req);
    } else if (res.statusCode >= 400) {
      exports.logWarn(`HTTP ${res.statusCode}`, logData);
    } else {
      exports.logInfo('Request completed', logData);
    }
  });

  next();
};

// Global error handler middleware
exports.errorHandler = (err, req, res, next) => {
  // Log the error
  exports.logError('Unhandled error', err, req);

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      message: `Duplicate value for field: ${field}`
    });
  }

  // MongoDB cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: `File upload error: ${err.message}`
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
