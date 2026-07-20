export const ERROR_PRODUCT_IMAGE_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'PRODUCT_IMAGE_NOT_FOUND',
  message: 'Product image not found',
};

export const ERROR_PRODUCT_IMAGE_PRIMARY_REQUIRED = {
  statusCode: 400,
  errorCode: 'PRODUCT_IMAGE_PRIMARY_REQUIRED',
  message: 'Exactly one product image must be marked as primary',
};

export const ERROR_PRODUCT_IMAGE_CANNOT_DELETE_LAST_IMAGE = {
  statusCode: 400,
  errorCode: 'PRODUCT_IMAGE_CANNOT_DELETE_LAST_IMAGE',
  message: 'A product must have at least one image',
};
