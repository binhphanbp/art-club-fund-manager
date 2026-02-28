'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';
import { createContribution } from '@/app/actions/contribution';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Plus, Upload, ImageIcon, Loader2, CheckCircle, X, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface UploadFundFormProps {
  currentWeek: number;
  isAlreadySubmitted: boolean;
  currentWeekStatus: 'paid' | 'pending' | 'not-paid';
  userId: string;
}

const WEEKLY_AMOUNT = 20000;

export function UploadFundForm({
  currentWeek,
  isAlreadySubmitted,
  currentWeekStatus,
  userId,
}: UploadFundFormProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [weeksCount, setWeeksCount] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const totalAmount = weeksCount * WEEKLY_AMOUNT;

  // Compress image to under 500KB
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
    };

    try {
      setIsCompressing(true);
      setUploadProgress('Đang nén ảnh...');
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } finally {
      setIsCompressing(false);
    }
  };

  // Upload image to Supabase Storage
  const uploadToSupabase = async (file: File): Promise<string> => {
    setUploadProgress('Đang tải ảnh lên...');

    const fileExt = 'jpg';
    const fileName = `${userId}/W${currentWeek}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
    }

    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 10MB');
      return;
    }

    try {
      const compressedFile = await compressImage(file);
      setSelectedFile(compressedFile);
      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);
      setUploadProgress('');
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Không thể xử lý ảnh. Vui lòng thử ảnh khác.');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn ảnh chứng minh');
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadToSupabase(selectedFile);

      setUploadProgress('Đang lưu thông tin...');
      const result = await createContribution({
        week: `Tuần ${currentWeek}`,
        imageUrl,
        amount: totalAmount,
        weeksCount,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const weeksCreated = result.weeksCreated ?? 1;
      const msg =
        weeksCreated > 1
          ? `Đã nộp minh chứng cho ${weeksCreated} tuần! Admin sẽ xét duyệt sớm 🎶`
          : 'Nộp minh chứng thành công! Chờ Admin duyệt nhé 🎶';

      toast.success(msg, {
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      });

      setIsDrawerOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress('');
      setWeeksCount(1);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleDrawerChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress('');
      setWeeksCount(1);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isLoading = isCompressing || isUploading;

  return (
    <Drawer open={isDrawerOpen} onOpenChange={handleDrawerChange}>
      <DrawerTrigger asChild>
        <Button
          disabled={isAlreadySubmitted}
          className={`w-full sm:w-auto h-14 px-8 rounded-2xl font-semibold text-base shadow-lg transition-all duration-300 ${
            isAlreadySubmitted
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25 hover:shadow-purple-500/40'
          }`}
        >
          <Plus className="w-5 h-5 mr-2" />
          {isAlreadySubmitted
            ? `Tuần ${currentWeek} - ${currentWeekStatus === 'paid' ? 'Đã nộp' : 'Đang chờ duyệt'}`
            : `Nộp Quỹ Tuần ${currentWeek}`}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl font-bold flex items-center gap-2">
            💰 Nộp Quỹ Tuần {currentWeek}
          </DrawerTitle>
          <DrawerDescription>
            Tải lên ảnh chứng minh đã chuyển khoản
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          {/* Upload area */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isLoading}
            />
            <motion.div
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                previewUrl
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-border hover:border-purple-500/50 hover:bg-purple-500/5'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <AnimatePresence mode="wait">
                {previewUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl object-cover shadow-lg"
                      />
                      {!isLoading && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(0)}KB)
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto"
                    >
                      <ImageIcon className="w-8 h-8 text-purple-400" />
                    </motion.div>
                    <div>
                      <p className="text-foreground font-medium">Chọn ảnh chuyển khoản</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG (tối đa 10MB, sẽ tự động nén)</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Progress indicator */}
          {uploadProgress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-purple-400"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress}
            </motion.div>
          )}

          {/* Weeks selector (excess payment) */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-foreground">Số tuần muốn nộp</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setWeeksCount(n)}
                  className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all border ${
                    weeksCount === n
                      ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'bg-muted text-muted-foreground border-border hover:border-purple-500/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {weeksCount > 1 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-amber-400 flex items-center gap-1"
              >
                ✨ Hệ thống sẽ tự động tách thành {weeksCount} bản ghi cho các tuần chưa nộp
              </motion.p>
            )}
          </div>

          {/* Amount info */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {weeksCount > 1 ? `${weeksCount} tuần × 20.000đ` : 'Số tiền:'}
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {totalAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* Bank info hint */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-400 text-center">
              💡 Chuyển khoản đến STK: <strong>0123456789</strong> - Ngân hàng ABC
              <br />
              Nội dung: <strong>CLB NT - [Họ tên]</strong>
            </p>
          </div>
        </div>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="w-full h-12 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {uploadProgress || 'Đang xử lý...'}
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                {weeksCount > 1 ? `Gửi (${weeksCount} tuần)` : 'Gửi xác nhận'}
              </>
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full h-12 rounded-xl" disabled={isLoading}>
              Hủy
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

  isAlreadySubmitted: boolean;
  currentWeekStatus: 'paid' | 'pending' | 'not-paid';
  userId: string;
}

export function UploadFundForm({
  currentWeek,
  isAlreadySubmitted,
  currentWeekStatus,
  userId,
}: UploadFundFormProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Compress image to under 500KB
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5, // 500KB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
    };

    try {
      setIsCompressing(true);
      setUploadProgress('Đang nén ảnh...');

      const compressedFile = await imageCompression(file, options);

      console.log('Original size:', (file.size / 1024).toFixed(2), 'KB');
      console.log(
        'Compressed size:',
        (compressedFile.size / 1024).toFixed(2),
        'KB',
      );

      return compressedFile;
    } finally {
      setIsCompressing(false);
    }
  };

  // Upload image to Supabase Storage
  const uploadToSupabase = async (file: File): Promise<string> => {
    setUploadProgress('Đang tải ảnh lên...');

    const fileExt = 'jpg'; // Always save as jpg after compression
    const fileName = `${userId}/W${currentWeek}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 10MB');
      return;
    }

    try {
      // Compress the image
      const compressedFile = await compressImage(file);

      setSelectedFile(compressedFile);
      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);
      setUploadProgress('');
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Không thể xử lý ảnh. Vui lòng thử ảnh khác.');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn ảnh chứng minh');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const imageUrl = await uploadToSupabase(selectedFile);

      // Create contribution record via Server Action
      setUploadProgress('Đang lưu thông tin...');
      const result = await createContribution({
        week: `Tuần ${currentWeek}`,
        imageUrl,
        amount: 20000,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Success!
      toast.success('Nộp minh chứng thành công! Chờ Admin duyệt nhé 🎶', {
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      });

      // Reset form and close drawer
      setIsDrawerOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress('');

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  // Reset form when drawer closes
  const handleDrawerChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (!open) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isLoading = isCompressing || isUploading;

  return (
    <Drawer open={isDrawerOpen} onOpenChange={handleDrawerChange}>
      <DrawerTrigger asChild>
        <Button
          disabled={isAlreadySubmitted}
          className={`w-full sm:w-auto h-14 px-8 rounded-2xl font-semibold text-base shadow-lg transition-all duration-300 ${
            isAlreadySubmitted
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25 hover:shadow-purple-500/40'
          }`}
        >
          <Plus className="w-5 h-5 mr-2" />
          {isAlreadySubmitted
            ? `Tuần ${currentWeek} - ${currentWeekStatus === 'paid' ? 'Đã nộp' : 'Đang chờ duyệt'}`
            : `Nộp Quỹ Tuần ${currentWeek}`}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl font-bold flex items-center gap-2">
            💰 Nộp Quỹ Tuần {currentWeek}
          </DrawerTitle>
          <DrawerDescription>
            Tải lên ảnh chứng minh đã chuyển khoản 20.000đ
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Upload area */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isLoading}
            />
            <motion.div
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                previewUrl
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-border hover:border-purple-500/50 hover:bg-purple-500/5'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <AnimatePresence mode="wait">
                {previewUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-xl object-cover shadow-lg"
                      />
                      {!isLoading && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile?.name} (
                      {(selectedFile!.size / 1024).toFixed(0)}KB)
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto"
                    >
                      <ImageIcon className="w-8 h-8 text-purple-400" />
                    </motion.div>
                    <div>
                      <p className="text-foreground font-medium">
                        Chọn ảnh chuyển khoản
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG (tối đa 10MB, sẽ tự động nén)
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Progress indicator */}
          {uploadProgress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-purple-400"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress}
            </motion.div>
          )}

          {/* Amount info */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Số tiền:</span>
              <span className="text-lg font-bold text-emerald-400">
                20.000đ
              </span>
            </div>
          </div>

          {/* Bank info hint */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-400 text-center">
              💡 Chuyển khoản đến STK: <strong>0123456789</strong> - Ngân hàng
              ABC
              <br />
              Nội dung: <strong>CLB NT - [Họ tên]</strong>
            </p>
          </div>
        </div>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="w-full h-12 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {uploadProgress || 'Đang xử lý...'}
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Gửi xác nhận
              </>
            )}
          </Button>
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl"
              disabled={isLoading}
            >
              Hủy
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
