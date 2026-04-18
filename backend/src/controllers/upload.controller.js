exports.uploadDocument = async (req, res, next) => {
  try {
    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        type: req.file.mimetype
      }
    });
  } catch (error) {
    next(error);
  }
};
