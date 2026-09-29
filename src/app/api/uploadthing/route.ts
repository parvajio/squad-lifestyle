import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { createRouteHandler } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 6 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'ADMIN') {
        console.error('UploadThing middleware: unauthorized upload attempt');
        throw new UploadThingError({ code: 'FORBIDDEN', message: 'Unauthorized: admin login required' });
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
