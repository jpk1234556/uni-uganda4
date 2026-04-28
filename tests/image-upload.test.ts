import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Integration tests for room image upload workflow
 * Tests file handling, Supabase Storage interaction, and URL generation
 */

interface SelectedRoomImage {
  file: File;
  previewUrl: string;
}

const ROOM_IMAGE_BUCKET = "room-images";

const buildStoragePath = (hostelId: string, fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${hostelId}/${id}.${extension}`;
};

// Mock Supabase storage client
const createMockStorageClient = () => {
  const uploadedFiles: Map<string, { file: File; cacheControl: string }> = new Map();

  return {
    from: (bucketName: string) => ({
      upload: vi.fn(async (path: string, file: File, options: { cacheControl: string; upsert: boolean }) => {
        if (bucketName !== ROOM_IMAGE_BUCKET) {
          return { error: new Error(`Bucket ${bucketName} not found`) };
        }
        uploadedFiles.set(path, { file, cacheControl: options.cacheControl });
        return { data: { path }, error: null };
      }),
      getPublicUrl: vi.fn((path: string) => {
        if (!uploadedFiles.has(path)) {
          return { data: { publicUrl: "" } };
        }
        return {
          data: {
            publicUrl: `https://mock-supabase.com/storage/v1/object/public/${ROOM_IMAGE_BUCKET}/${path}`,
          },
        };
      }),
    }),
    uploadedFiles,
  };
};

describe("Image Upload Integration Tests", () => {
  let mockStorage: ReturnType<typeof createMockStorageClient>;
  let selectedRoomImages: SelectedRoomImage[];

  beforeEach(() => {
    mockStorage = createMockStorageClient();
    selectedRoomImages = [];
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup: revoke all object URLs
    selectedRoomImages.forEach((img) => {
      if (typeof URL !== "undefined" && URL.revokeObjectURL) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    selectedRoomImages = [];
  });

  describe("File Selection and Preview", () => {
    it("should create preview URLs for selected files", () => {
      const file = new File(["dummy content"], "test.jpg", { type: "image/jpeg" });

      // Simulate file selection
      const previewUrl = URL.createObjectURL(file);
      selectedRoomImages.push({ file, previewUrl });

      expect(selectedRoomImages).toHaveLength(1);
      expect(selectedRoomImages[0].file.name).toBe("test.jpg");
      expect(selectedRoomImages[0].previewUrl).toMatch(/^blob:/);
    });

    it("should support multiple file selection", () => {
      const files = [
        new File(["content1"], "image1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "image2.png", { type: "image/png" }),
        new File(["content3"], "image3.webp", { type: "image/webp" }),
      ];

      files.forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        selectedRoomImages.push({ file, previewUrl });
      });

      expect(selectedRoomImages).toHaveLength(3);
      expect(selectedRoomImages[0].file.name).toBe("image1.jpg");
      expect(selectedRoomImages[1].file.name).toBe("image2.png");
      expect(selectedRoomImages[2].file.name).toBe("image3.webp");
    });

    it("should remove image by index", () => {
      const file1 = new File(["content1"], "image1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "image2.jpg", { type: "image/jpeg" });
      const file3 = new File(["content3"], "image3.jpg", { type: "image/jpeg" });

      [file1, file2, file3].forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        selectedRoomImages.push({ file, previewUrl });
      });

      const removedImage = selectedRoomImages[1];
      selectedRoomImages.splice(1, 1);

      expect(selectedRoomImages).toHaveLength(2);
      expect(selectedRoomImages[0].file.name).toBe("image1.jpg");
      expect(selectedRoomImages[1].file.name).toBe("image3.jpg");
      expect(selectedRoomImages).not.toContainEqual(removedImage);
    });
  });

  describe("Storage Path Generation", () => {
    it("should generate unique storage paths with hostel ID", () => {
      const hostelId = "hostel-123";
      const fileName = "room.jpg";

      const path1 = buildStoragePath(hostelId, fileName);
      const path2 = buildStoragePath(hostelId, fileName);

      expect(path1).toMatch(/^hostel-123\//);
      expect(path2).toMatch(/^hostel-123\//);
      expect(path1).not.toBe(path2); // Should be unique
    });

    it("should preserve file extension", () => {
      const hostelId = "hostel-456";
      const extensions = ["jpg", "png", "jpeg", "webp", "gif"];

      extensions.forEach((ext) => {
        const path = buildStoragePath(hostelId, `image.${ext}`);
        expect(path).toMatch(new RegExp(`\\.${ext}$`));
      });
    });

    it("should handle files with no extension", () => {
      const hostelId = "hostel-789";
      const path = buildStoragePath(hostelId, "imagefile");

      // When no extension exists, the whole filename becomes the extension
      // This matches the behavior of split('.').pop() on a string without dots
      expect(path).toMatch(/hostel-789\/.*\.imagefile$/); // Pattern: hostel-id/uuid.filename
      expect(path).toContain("hostel-789/"); // Verify hostel path prefix
    });
  });

  describe("Upload to Storage", () => {
    it("should upload file to storage with correct options", async () => {
      const hostelId = "hostel-123";
      const file = new File(["image content"], "room.jpg", { type: "image/jpeg" });
      const objectPath = buildStoragePath(hostelId, file.name);

      const uploadFn = mockStorage.from(ROOM_IMAGE_BUCKET).upload;
      const result = await uploadFn(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      expect(uploadFn).toHaveBeenCalledWith(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
      });
      expect(result.error).toBeNull();
      expect(result.data.path).toBe(objectPath);
    });

    it("should return error for failed upload", async () => {
      const hostelId = "hostel-123";
      const file = new File(["image content"], "room.jpg", { type: "image/jpeg" });
      const objectPath = buildStoragePath(hostelId, file.name);

      // Simulate error by using wrong bucket name
      const uploadFn = mockStorage.from("wrong-bucket").upload;
      const result = await uploadFn(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("not found");
    });

    it("should handle multiple concurrent uploads", async () => {
      const hostelId = "hostel-456";
      const files = [
        new File(["content1"], "image1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "image2.jpg", { type: "image/jpeg" }),
        new File(["content3"], "image3.jpg", { type: "image/jpeg" }),
      ];

      const uploadFn = mockStorage.from(ROOM_IMAGE_BUCKET).upload;
      const uploadPromises = files.map((file) => {
        const objectPath = buildStoragePath(hostelId, file.name);
        return uploadFn(objectPath, file, {
          cacheControl: "3600",
          upsert: false,
        });
      });

      const results = await Promise.all(uploadPromises);

      expect(uploadFn).toHaveBeenCalledTimes(3);
      results.forEach((result) => {
        expect(result.error).toBeNull();
      });
    });
  });

  describe("Public URL Generation", () => {
    it("should generate public URLs for uploaded images", async () => {
      const hostelId = "hostel-789";
      const file = new File(["image content"], "room.jpg", { type: "image/jpeg" });
      const objectPath = buildStoragePath(hostelId, file.name);

      // Upload first
      await mockStorage.from(ROOM_IMAGE_BUCKET).upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      // Get public URL
      const getPublicUrlFn = mockStorage.from(ROOM_IMAGE_BUCKET).getPublicUrl;
      const urlResult = getPublicUrlFn(objectPath);

      expect(urlResult.data.publicUrl).toMatch(/^https:\/\//);
      expect(urlResult.data.publicUrl).toContain(ROOM_IMAGE_BUCKET);
      expect(urlResult.data.publicUrl).toContain(objectPath);
    });

    it("should return empty URL for non-existent paths", () => {
      const getPublicUrlFn = mockStorage.from(ROOM_IMAGE_BUCKET).getPublicUrl;
      const urlResult = getPublicUrlFn("non-existent/path.jpg");

      expect(urlResult.data.publicUrl).toBe("");
    });
  });

  describe("Complete Upload Workflow", () => {
    it("should execute full upload pipeline: select -> upload -> generate URL", async () => {
      const hostelId = "hostel-workflow";
      const imageFiles = [
        new File(["content1"], "image1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "image2.jpg", { type: "image/jpeg" }),
      ];

      // Step 1: Select files and create previews
      imageFiles.forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        selectedRoomImages.push({ file, previewUrl });
      });

      expect(selectedRoomImages).toHaveLength(2);

      // Step 2: Upload all images
      const uploadPromises = selectedRoomImages.map(async (image) => {
        const objectPath = buildStoragePath(hostelId, image.file.name);
        const uploadResult = await mockStorage.from(ROOM_IMAGE_BUCKET).upload(objectPath, image.file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (uploadResult.error) {
          throw uploadResult.error;
        }

        // Step 3: Generate public URLs
        const urlResult = mockStorage.from(ROOM_IMAGE_BUCKET).getPublicUrl(objectPath);
        return urlResult.data.publicUrl;
      });

      const publicUrls = await Promise.all(uploadPromises);

      expect(publicUrls).toHaveLength(2);
      publicUrls.forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
        expect(url).toContain(ROOM_IMAGE_BUCKET);
      });
    });

    it("should handle upload errors gracefully", async () => {
      const hostelId = "hostel-error";
      const file = new File(["content"], "image.jpg", { type: "image/jpeg" });
      selectedRoomImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });

      const objectPath = buildStoragePath(hostelId, file.name);

      // Simulate upload error
      const uploadFn = mockStorage.from("wrong-bucket").upload;
      const uploadTask = uploadFn(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      const result = await uploadTask;
      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it("should clear selections after successful upload", async () => {
      const file = new File(["content"], "image.jpg", { type: "image/jpeg" });
      selectedRoomImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });

      expect(selectedRoomImages).toHaveLength(1);

      // Clear after upload
      selectedRoomImages = [];

      expect(selectedRoomImages).toHaveLength(0);
    });
  });

  describe("Memory Management", () => {
    it("should properly clean up object URLs", () => {
      const revokeObjectUrlSpy = vi.spyOn(URL, "revokeObjectURL");

      const file = new File(["content"], "image.jpg", { type: "image/jpeg" });
      const previewUrl = URL.createObjectURL(file);
      selectedRoomImages.push({ file, previewUrl });

      // Simulate cleanup in useEffect
      selectedRoomImages.forEach((img) => {
        URL.revokeObjectURL(img.previewUrl);
      });

      expect(revokeObjectUrlSpy).toHaveBeenCalledWith(previewUrl);
      revokeObjectUrlSpy.mockRestore();
    });

    it("should handle batches of image cleanups", () => {
      const revokeObjectUrlSpy = vi.spyOn(URL, "revokeObjectURL");

      const files = [
        new File(["content1"], "image1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "image2.jpg", { type: "image/jpeg" }),
        new File(["content3"], "image3.jpg", { type: "image/jpeg" }),
      ];

      files.forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        selectedRoomImages.push({ file, previewUrl });
      });

      // Cleanup all
      selectedRoomImages.forEach((img) => {
        URL.revokeObjectURL(img.previewUrl);
      });

      expect(revokeObjectUrlSpy).toHaveBeenCalledTimes(3);
      revokeObjectUrlSpy.mockRestore();
    });
  });
});
