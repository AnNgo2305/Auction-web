export const CREATE_PRODUCT_ERROR_MESSAGES: Record<string, string> = {
  CLASS_VALIDATION_FAILED:
    'Please check the product information and try again.',

  CATEGORIES_NOT_FOUND:
    'One or more selected categories no longer exist. Please refresh and try again.',

  PRODUCT_NAME_ALREADY_EXISTS:
    'You already have a product with this name. Please choose a different name.',

  DEFAULT:
    'Something went wrong while creating your product. Please try again.',
} as const;

export const DELETE_PRODUCT_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND:
    'We couldn’t find this product. It may have already been deleted.',

  PRODUCT_ACCESS_DENIED: 'You do not have permission to delete this product.',

  DEFAULT:
    'Something went wrong while deleting your product. Please try again.',
} as const;

export const DELETE_PRODUCTS_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: 'One or more selected products could not be found.',

  PRODUCT_ACCESS_DENIED:
    'You do not have permission to delete one or more selected products.',

  DEFAULT:
    'Something went wrong while deleting the selected products. Please try again.',
} as const;

export const PRODUCT_STATUS_ACTION_ERROR_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: "We couldn't find this product. It may have been deleted.",

  PRODUCT_ACCESS_DENIED: "You don't have permission to modify this product.",

  PRODUCT_STATUS_TRANSITION_NOT_ALLOWED:
    'This product cannot be changed to the selected status.',

  DEFAULT:
    'Something went wrong while updating the product status. Please try again.',
} as const;
