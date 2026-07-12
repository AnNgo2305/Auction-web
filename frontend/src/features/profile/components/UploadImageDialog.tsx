import { useRef, useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import Cropper, { type Area } from 'react-easy-crop';
import * as React from 'react';

type ImageCropType = 'avatar' | 'cover';

interface UploadImageDialogProps {
  /** Controls whether the dialog is open. */
  open: boolean;

  /** Image type */
  cropType?: ImageCropType;

  /** Dialog title displayed in the header. */
  title: string;

  /** Optional description displayed below the title. */
  description?: string;

  /** Indicates whether an upload request is currently in progress. */
  isUploading?: boolean;

  /** Currently selected image file. */
  selectedFile: File | null;

  /** Called when the dialog open state changes. */
  onOpenChange: (open: boolean) => void;

  /** Called when the user selects a new image file. */
  onFileChange: (file: File | null) => void;

  /** Called when the user saves the selected image. */
  onSave: (file: File) => void;
}

export function UploadImageDialog({
  open,
  cropType,
  title,
  description,
  isUploading = false,
  selectedFile,
  onOpenChange,
  onFileChange,
  onSave,
}: UploadImageDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const aspect = cropType === 'cover' ? 20 / 7 : 1;

  /** Creates and resets the preview URL for the selected image. */
  useEffect(() => {
    if (!selectedFile) {
      setImageSrc('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  /** Opens the native file picker. */
  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  /** Handles image file selection and resets the input value. */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileChange(file);
    e.target.value = '';
  };

  /** Handles dialog cancellation by resetting state and closing the dialog. */
  const handleCancel = () => {
    onFileChange(null);
    setImageSrc('');
    setCrop({
      x: 0,
      y: 0,
    });
    setZoom(1);
    setCroppedAreaPixels(null);
    onOpenChange(false);
  };

  /** Handles saving the image, resetting state, and closing the dialog. */
  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !selectedFile) return;
    try {
      const croppedFile = await getCroppedImage(
        imageSrc,
        croppedAreaPixels,
        selectedFile,
      );
      onFileChange(null);
      setImageSrc('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);

      onOpenChange(false);
      onSave(croppedFile);
    } catch (err) {
      console.error('Crop failed', err);
    }
  };

  /** Crop image from canvas and return a File */
  async function getCroppedImage(
    imageSrc: string,
    croppedAreaPixels: Area,
    originalFile: File,
  ): Promise<File> {
    const image = new Image();
    image.src = imageSrc;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas not supported');

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Crop failed');
        const file = new File([blob], originalFile.name, {
          type: originalFile.type,
        });
        resolve(file);
      }, originalFile.type);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold tracking-wide uppercase">
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-muted-foreground/30 rounded-lg border-2 border-dashed px-6 py-10 text-center">
            {selectedFile ? (
              <div className="space-y-4">
                <div className="relative h-80 w-full overflow-hidden rounded-lg">
                  {imageSrc && (
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspect}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(_, croppedAreaPixels) =>
                        setCroppedAreaPixels(croppedAreaPixels)
                      }
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleChooseFile}
                  disabled={isUploading}
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <div className="px-2 py-6 text-center">
                <Upload className="text-muted-foreground mx-auto mb-6 h-14 w-14" />
                <h3 className="text-base font-semibold">
                  Drag and drop your image here
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  or choose an image from your device
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6"
                  onClick={handleChooseFile}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-muted-foreground mt-5 text-center text-xs">
              Supports PNG, JPG, JPEG and WEBP (max 5 MB)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Cancel
          </Button>
          {selectedFile && (
            <Button
              type="button"
              onClick={handleSave}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
