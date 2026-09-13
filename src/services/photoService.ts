/**
 * Photo Service for HealSeed Meal Photos
 * 
 * - Handles client-side resizing and compression to prevent localStorage quota exhaustion.
 * - Modularized to easily swap to Firebase Storage (/users/{uid}/mealPhotos/{date}.jpg) in future updates.
 */

/**
 * Resize and compress user-selected meal photo to a light-weight JPEG Data URL
 * @param file Image file from camera or photo library
 * @param maxDimension Max width or height (default: 800px)
 * @param quality JPEG compression quality (0.0 to 1.0, default: 0.75)
 */
export async function compressAndConvertToBase64(
  file: File,
  maxDimension = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Prepared hook for future Firebase Storage integration:
 * e.g. upload to `/users/{uid}/mealPhotos/{date}_{timestamp}.jpg`
 */
export async function uploadMealPhotoToFirebaseStorage(
  _userId: string,
  _date: string,
  file: File
): Promise<string> {
  // 1. Current Phase: High-speed local compression & base64 storage
  return compressAndConvertToBase64(file);

  // 2. Future Firebase Storage Phase:
  // const storageRef = ref(storage, `users/${userId}/mealPhotos/${date}_${Date.now()}.jpg`);
  // const snapshot = await uploadBytes(storageRef, file);
  // return await getDownloadURL(snapshot.ref);
}
