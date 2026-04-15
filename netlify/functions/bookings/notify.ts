import { Handler } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, phone, service, date, time, notes } = JSON.parse(event.body || "{}");
    const notificationEmail = process.env.NOTIFICATION_EMAIL;

    if (!notificationEmail) {
      return { 
        statusCode: 200, 
        body: JSON.stringify({ status: "skipped", reason: "no_notification_email" }) 
      };
    }

    if (!process.env.RESEND_API_KEY) {
      return { 
        statusCode: 200, 
        body: JSON.stringify({ status: "skipped", reason: "no_api_key" }) 
      };
    }

    const { data, error } = await resend.emails.send({
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
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success", data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
