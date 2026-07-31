export const GET_PRODUCT_COMMENTS_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: 'Product not found.',

  DEFAULT: 'Failed to load product comments.',
} as const;

export const CREATE_PRODUCT_COMMENT_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: 'Product not found.',

  DEFAULT: 'Failed to create product comment.',
} as const;

export const UPDATE_PRODUCT_COMMENT_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: 'Product not found.',

  PRODUCT_COMMENT_ACCESS_DENIED:
    'You do not have permission to modify this product comment.',

  DEFAULT: 'Failed to update product comment.',
} as const;

export const DELETE_PRODUCT_COMMENT_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: 'Product not found.',

  PRODUCT_COMMENT_ACCESS_DENIED:
    'You do not have permission to modify this product comment.',

  DEFAULT: 'Failed to delete product comment.',
} as const;
