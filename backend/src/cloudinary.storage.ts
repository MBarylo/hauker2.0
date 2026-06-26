import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

export const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'hauker/posts',
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'],
  }),
});

export const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'hauker/avatars',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  }),
});

export const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'hauker/banners',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  }),
});
