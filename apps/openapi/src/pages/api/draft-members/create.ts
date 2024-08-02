import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    res.status(201).json({
      success: true,
    });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
