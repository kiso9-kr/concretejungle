import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { firebaseClient } from './firebase-client';
import type { StoredImage } from './types';

const MAX_SIZE = 2000; // 긴 변 기준 최대 픽셀
const KEEP_ORIGINAL_BYTES = 1024 * 1024;

// 업로드 전에 큰 사진을 줄여서 저장 공간과 로딩 시간을 아껴요.
async function shrink(file: File): Promise<Blob> {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file; // 움짤/벡터는 그대로
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // 브라우저가 못 읽는 형식은 원본 업로드
  }
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= KEEP_ORIGINAL_BYTES) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff'; // 투명 배경은 흰색으로
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  return blob && blob.size < file.size ? blob : file;
}

export async function uploadImage(
  file: File,
  folder: string,
  onStatus?: (status: string) => void,
): Promise<StoredImage> {
  onStatus?.('이미지 처리 중…');
  const blob = await shrink(file);
  const ext = blob.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() ?? 'img');
  const path = `images/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const fileRef = ref(firebaseClient().storage, path);
  const task = uploadBytesResumable(fileRef, blob, { contentType: blob.type || file.type });
  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onStatus?.(`이미지 업로드 중… ${percent}%`);
      },
      reject,
      resolve,
    );
  });
  onStatus?.('이미지 주소 확인 중…');
  return { url: await getDownloadURL(fileRef), path };
}

export async function deleteImages(images: StoredImage[]): Promise<void> {
  const { storage } = firebaseClient();
  await Promise.allSettled(images.filter((img) => img.path).map((img) => deleteObject(ref(storage, img.path))));
}
