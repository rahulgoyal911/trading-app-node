module.exports = () => (req, res, next) => {
  res.sendCreated = function created(responseObject = {}) {
    return this.status(201).json(responseObject);
  };

  res.sendServerError = function serverError() {
    return this.status(500).json({ message: 'Internal server error' });
  };

  res.sendAlreadyExists = function alreadyExists(responseObject = {}) {
    return this.status(409).json(responseObject);
  };

  res.sendNotFound = function notFound() {
    return this.status(404).send({ message: 'Item not found!' });
  };

  res.sendNotFoundWithMessage = function notFoundWithMessage(responseObject) {
    return this.status(404).json(responseObject);
  };
  next();
};
