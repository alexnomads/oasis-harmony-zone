
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Twitter, Instagram, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserService } from '@/lib/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/types/database';

const profileSchema = z.object({
  nickname: z.string()
    .min(3, 'Nickname must be at least 3 characters')
    .max(30, 'Nickname must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores and hyphens are allowed'),
  twitter_handle: z.string().optional(),
  instagram_handle: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserProfile | null;
  onProfileUpdated: (profile: UserProfile) => void;
}

export function EditProfileDialog({ 
  open, 
  onOpenChange, 
  currentProfile, 
  onProfileUpdated 
}: EditProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: currentProfile?.nickname || '',
      twitter_handle: currentProfile?.twitter_handle || '',
      instagram_handle: currentProfile?.instagram_handle || '',
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'Image too large',
          description: 'Please select an image under 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedImage(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      let avatarUrl = currentProfile?.avatar_url;
      
      // Upload new profile picture if selected
      if (selectedImage) {
        avatarUrl = await UserService.uploadProfilePicture(user.id, selectedImage);
      }
      
      // Update profile
      const updatedProfile = await UserService.upsertUserProfile({
        user_id: user.id,
        ...data,
        avatar_url: avatarUrl,
      });
      
      onProfileUpdated(updatedProfile);
      onOpenChange(false);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel className="text-white">Profile Picture</FormLabel>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-zinc-800 overflow-hidden">
                  {(selectedImage || currentProfile?.avatar_url) && (
                    <img
                      src={selectedImage ? URL.createObjectURL(selectedImage) : currentProfile?.avatar_url || ''}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-700"
                  onClick={() => document.getElementById('profile-picture')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nickname</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-zinc-800 border-zinc-700 text-white" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="twitter_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Twitter/X Handle</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                      <Input
                        {...field}
                        className="bg-zinc-800 border-zinc-700 text-white pl-10"
                        placeholder="@username"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram_handle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Instagram Handle</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
                      <Input
                        {...field}
                        className="bg-zinc-800 border-zinc-700 text-white pl-10"
                        placeholder="@username"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-zinc-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                ) : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
