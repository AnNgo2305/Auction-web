export const UPDATE_PRODUCT_ERROR_MESSAGES: Record<string, string> = {
  CLASS_VALIDATION_FAILED:
    'Please check the product information and try again.',
  PRODUCT_NOT_FOUND: 'The product could not be found.',
  CANNOT_UPDATE_PRODUCT:
    'This product cannot be updated in its current status.',
  CANNOT_SET_PRODUCT_STATUS:
    'The selected product status cannot be set manually.',
  PRODUCT_ACCESS_DENIED: 'You do not have permission to update this product.',
  DEFAULT: 'Failed to update product. Please try again later.',
} as const;
