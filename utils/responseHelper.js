export const internalServerErrorResponse = (res, data) => {
  return res.status(500).json({
    statusCode: 500,
    message: "Internal Sever Error kindly Check ",
    data: data,
  });
};

export const InvalidDataResponse = (res, message, data) => {
  return res.status(400).json({
    statusCode: 400,
    message: `Invalid ${message}`,
    data: data,
  });
};
export const InvalidAuthorizationResponse = (
  res,
  statusCode,
  message,
  data
) => {
  return res.status(statusCode).json({
    statusCode: statusCode,
    message: `${message}`,
    data: data,
  });
};
export const failedResponse = (res, message, data) => {
  return res.status(404).json({
    statusCode: 404,
    message: `${message}`,
    data: data,
  });
};
export const successResponse = (res, message, data) => {
  return res.status(200).json({
    statusCode: 200,
    message: ` ${message} Successfully`,
    data: data,
  });
};
export const duplicateResponse = (res, message, data) => {
  res.status(409).json({
    statusCode: 409,
    message: `${message} already exist`,
    data,
  });
};
export const checkAllFields = (ipData, requiredField) => {
  return requiredField.every((fields) => ipData[fields]);
};
