import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Resend lazily
  let resend: Resend | null = null;
  const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not set. Email notifications will be skipped.");
      return null;
    }
    if (!resend) {
      resend = new Resend(apiKey);
    }
    return resend;
  };

  // API Route for booking notifications
  app.post("/api/bookings/notify", async (req, res) => {
    const { name, email, phone, service, date, time, address, notes } = req.body;
    const notificationEmail = process.env.NOTIFICATION_EMAIL;

    if (!notificationEmail) {
      console.warn("NOTIFICATION_EMAIL is not set. Skipping email notification.");
      return res.status(200).json({ status: "skipped", reason: "no_notification_email" });
    }

    const resendClient = getResend();
    if (!resendClient) {
      return res.status(200).json({ status: "skipped", reason: "no_api_key" });
    }

    try {
      const { data, error } = await resendClient.emails.send({
        from: "JRBLXNDZ Bookings <onboarding@resend.dev>",
        to: [notificationEmail],
        subject: `New Booking: ${service} - ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border: 1px solid #333;">
            <h1 style="color: #ff0000; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 20px;">New Booking Received</h1>
            <div style="border-left: 4px solid #ff0000; padding-left: 20px; margin-bottom: 30px;">
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
            </div>
            <div style="background: #111; padding: 20px; margin-bottom: 30px;">
              <h2 style="font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 10px;">Client Details</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Address:</strong> 4854 Bathurst Street, Room 410</p>
            </div>
            <div style="background: #111; padding: 20px; border: 1px solid #ff0000; margin-bottom: 30px;">
              <h2 style="font-size: 14px; text-transform: uppercase; color: #ff0000; margin-bottom: 10px;">Arrival Instructions</h2>
              <p style="margin: 0;">To ensure a smooth and private experience, please call me directly when you arrive. We kindly ask that you do not use the buzzer or enter through the front lobby. I will come down to meet you!</p>
            </div>
            ${notes ? `
            <div style="background: #111; padding: 20px;">
              <h2 style="font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 10px;">Notes</h2>
              <p>${notes}</p>
            </div>
            ` : ""}
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ status: "success", data });
    } catch (err) {
      console.error("Failed to send notification:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
