export class ProductCategoryDto {
  categoryId: string;
  name: string;
  color: string;
}

export class GetMyProductCategoriesResponseDto {
  categories: ProductCategoryDto[];
}
