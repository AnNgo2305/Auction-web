export const ERROR_PRODUCT_NOT_FOUND = {
  statusCode: 404,
  errorCode: 'PRODUCT_NOT_FOUND',
  message: 'Product not found',
};

export const ERROR_NO_PRODUCTS_PROVIDED = {
  statusCode: 400,
  errorCode: 'NO_PRODUCTS_PROVIDED',
  message: 'No products provided',
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

export const ERROR_PRODUCT_STOCK_INSUFFICIENT = (productId: string) => ({
  statusCode: 400,
  message: `Insufficient stock for product ${productId}`,
  errorCode: 'INSUFFICIENT_PRODUCT_STOCK',
});

export const ERROR_PRODUCT_NOT_AVAILABLE = (productName: string) => ({
  statusCode: 404,
  message: `Product not available: ${productName}`,
  errorCode: 'PRODUCT_NOT_AVAILABLE',
});
