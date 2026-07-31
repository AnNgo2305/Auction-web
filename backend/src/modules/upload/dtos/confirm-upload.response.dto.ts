class ConfirmUploadItem {
  key: string;

  exists: boolean;

  size?: number;

  url?: string;
}

export class ConfirmUploadResponseDto {
  files: ConfirmUploadItem[];
}
