class ConfirmUploadItem {
  key: string;

  exists: boolean;

  size?: number;
}

export class ConfirmUploadResponseDto {
  files: ConfirmUploadItem[];
}
