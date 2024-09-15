// NOTE: firebase-admin does not support destructured imports
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

const globalForFirebaseAdmin = global as typeof globalThis & {
  app: admin.app.App | undefined;
};

const app =
  globalForFirebaseAdmin.app ??
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.BLIND_FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.BLIND_FIREBASE_ADMIN_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n",
      ),
      clientEmail: process.env.BLIND_FIREBASE_ADMIN_CLIENT_EMAIL,
    }),
  });

globalForFirebaseAdmin.app = app;

export const auth = getAuth(app);

export * from "firebase-admin/auth";
