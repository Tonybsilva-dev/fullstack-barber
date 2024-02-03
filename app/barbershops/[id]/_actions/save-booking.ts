"use server";

// Importações necessárias
import { google } from 'googleapis';
import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirect: 'YOUR_REDIRECT_URL',
};

const oauth2Client = new google.auth.OAuth2(
  googleConfig.clientId,
  googleConfig.clientSecret,
  googleConfig.redirect
);

const getGoogleAuthURL = () => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
};

interface SaveBookingParams {
  barbershopId: string;
  serviceId: string;
  userId: string;
  date: Date;
}

export const saveBookings = async (params: SaveBookingParams) => {
  await db.booking.create({
    data: {
      serviceId: params.serviceId,
      userId: params.userId,
      date: params.date,
      barbershopId: params.barbershopId
    },
  });

  revalidatePath("/");
  revalidatePath("/bookings");
};
