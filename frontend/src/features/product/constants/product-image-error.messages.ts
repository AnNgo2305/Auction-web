export const DELETE_PRODUCT_IMAGE_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_IMAGE_NOT_FOUND: 'Product image not found.',
  PRODUCT_ACCESS_DENIED: 'You do not have permission to modify this product.',
  PRODUCT_NOT_FOUND: 'Product not found.',
  PRODUCT_IMAGE_CANNOT_DELETE_LAST_IMAGE:
    'A product must have at least one image.',
  DEFAULT: 'Failed to delete product image.',
} as const;

export const DELETE_PRODUCT_IMAGES_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_IMAGE_NOT_FOUND: 'Product image not found.',
  PRODUCT_ACCESS_DENIED: 'You do not have permission to modify this product.',
  PRODUCT_NOT_FOUND: 'Product not found.',
  PRODUCT_IMAGE_CANNOT_DELETE_ALL_IMAGES: 'Cannot delete all product images.',
  DEFAULT: 'Failed to delete product images.',
} as const;

export const SET_PRIMARY_PRODUCT_IMAGE_ERROR_MESSAGES: Record<string, string> =
  {
    PRODUCT_IMAGE_NOT_FOUND: 'Product image not found.',
    PRODUCT_ACCESS_DENIED: 'You do not have permission to modify this product.',
    PRODUCT_NOT_FOUND: 'Product not found.',
    PRODUCT_IMAGE_ALREADY_PRIMARY:
      'The selected image is already the primary image.',
    DEFAULT: 'Failed to set primary product image.',
  } as const;

export const UPDATE_PRODUCT_IMAGES_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_ACCESS_DENIED: 'You do not have permission to modify this product.',
  PRODUCT_NOT_FOUND: 'Product not found.',
  PRODUCT_IMAGE_PRIMARY_REQUIRED:
    'Exactly one product image must be marked as primary.',
  DEFAULT: 'Failed to update product images.',
} as const;
