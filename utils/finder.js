const AppError = require('./AppError');

exports.findResourceById = async (req, model, resourceId) => {
  if (!req.params[resourceId]) throw new AppError('Resource not found', 400);

  const resource = await model.findByPk(req.params[resourceId]);

  if (!resource) {
    throw new AppError('Entered resource id not found', 404);
  }

  return resource;
};
