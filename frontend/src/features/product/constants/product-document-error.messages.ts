export const DELETE_PRODUCT_DOCUMENT_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_DOCUMENT_NOT_FOUND: 'Product document not found.',
  PRODUCT_ACCESS_DENIED: 'You do not have permission to modify this product.',
  PRODUCT_NOT_FOUND: 'Product not found.',

  DEFAULT: 'Failed to delete product document.',
} as const;

export const DELETE_PRODUCT_DOCUMENTS_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_DOCUMENT_NOT_FOUND: 'One or more product documents were not found.',
  PRODUCT_ACCESS_DENIED: 'You do not have permission to modify this product.',
  PRODUCT_NOT_FOUND: 'Product not found.',

  DEFAULT: 'Failed to delete product documents.',
} as const;

export const UPDATE_PRODUCT_DOCUMENTS_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_ACCESS_DENIED: 'You do not have permission to modify this product.',
  PRODUCT_NOT_FOUND: 'Product not found.',

  DEFAULT: 'Failed to update product documents.',
} as const;
