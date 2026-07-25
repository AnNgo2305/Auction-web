export const CREATE_PRODUCT_CATEGORY_ERROR_MESSAGES: Record<string, string> = {
  CATEGORY_ALREADY_EXISTS:
    'You already have a category with this name. Please choose a different name.',

  DEFAULT:
    'Something went wrong while creating your product category. Please try again.',
} as const;

export const DELETE_PRODUCT_CATEGORY_ERROR_MESSAGES: Record<string, string> = {
  CATEGORY_NOT_FOUND:
    'The product category could not be found. It may have already been deleted.',

  DEFAULT:
    'Something went wrong while deleting the product category. Please try again.',
} as const;

export const DELETE_PRODUCT_CATEGORIES_ERROR_MESSAGES: Record<string, string> =
  {
    CATEGORY_NOT_FOUND:
      'One or more selected product categories could not be found. Please refresh and try again.',

    DEFAULT:
      'Something went wrong while deleting the selected product categories. Please try again.',
  } as const;
