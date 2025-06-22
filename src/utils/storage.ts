import { supabase } from './supabase';

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export const storageService = {
  uploadUserAvatar: async (file: File, userId: string): Promise<UploadResult> => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { url: null, error: 'Please select a valid image file' };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        return { url: null, error: 'Image must be smaller than 5MB' };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Uploading avatar to:', filePath);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return { url: null, error: `Upload failed: ${error.message}` };
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        return { url: null, error: 'Failed to get public URL for uploaded image' };
      }

      console.log('Public URL generated:', urlData.publicUrl);
      return { url: urlData.publicUrl, error: null };

    } catch (error) {
      console.error('Avatar upload error:', error);
      return { 
        url: null, 
        error: error instanceof Error ? error.message : 'Unknown upload error' 
      };
    }
  },

  deleteUserAvatar: async (avatarUrl: string): Promise<{ error: string | null }> => {
    try {
      // Extract file path from URL
      const url = new URL(avatarUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // Get 'avatars/filename'

      console.log('Deleting avatar:', filePath);

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return { error: `Failed to delete old avatar: ${error.message}` };
      }

      console.log('Avatar deleted successfully');
      return { error: null };

    } catch (error) {
      console.error('Avatar deletion error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown deletion error' 
      };
    }
  }
};