const validate = (schema) => {
  return async (req, res, next) => {
    try {
      req.validatedData = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  };
};

export default validate;
