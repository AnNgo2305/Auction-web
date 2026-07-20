export const ERROR_PRODUCT_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'PRODUCT_NOT_FOUND',
  message: 'Product not found',
};

export const ERROR_CATEGORIES_NOT_FOUND = {
  statusCode: 400,
  errorCode: 'CATEGORIES_NOT_FOUND',
  message: 'One or more categories do not exist',
};

export const ERROR_CANNOT_UPDATE_PRODUCT = {
  statusCode: 400,
  errorCode: 'CANNOT_UPDATE_PRODUCT',
  message: 'Product cannot be updated in its current status',
};

export const ERROR_CANNOT_SET_PRODUCT_STATUS = {
  statusCode: 400,
  errorCode: 'CANNOT_SET_PRODUCT_STATUS',
  message: 'This product status cannot be set manually',
};

export const ERROR_PRODUCT_ACCESS_DENIED = {
  statusCode: 403,
  errorCode: 'PRODUCT_ACCESS_DENIED',
  message: 'You do not have permission to access this product',
};

export const ERROR_PRODUCT_STATUS_TRANSITION_NOT_ALLOWED = {
  statusCode: 400,
  errorCode: 'PRODUCT_STATUS_TRANSITION_NOT_ALLOWED',
  message: 'Product status transition is not allowed',
};

export const MAX_PRODUCT_IMAGES = 10;
export const MAX_PRODUCT_DOCUMENTS = 10;
