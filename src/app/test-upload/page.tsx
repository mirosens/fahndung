import SimpleCloudinaryUpload from "~/components/media/SimpleCloudinaryUpload";

export default function TestUploadPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Cloudinary Upload Test</h1>
      <div className="flex justify-center">
        <SimpleCloudinaryUpload />
      </div>
    </div>
  );
}
