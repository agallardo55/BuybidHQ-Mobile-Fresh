import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface FeedbackRequest {
  type: "bug" | "feedback" | "request";
  message: string;
  userEmail?: string;
  userName?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, userEmail, userName }: FeedbackRequest = await req.json();

    // Validate input
    if (!type || !message) {
      return new Response(
        JSON.stringify({ error: "Type and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get type label
    const typeLabels = {
      bug: "Bug Report",
      feedback: "Feedback",
      request: "Feature Request",
    };
    const typeLabel = typeLabels[type] || type;

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "BuybidHQ Feedback <noreply@buybidhq.com>",
        to: ["adam@cmigpartners.com"],
        subject: `[${typeLabel}] New Submission from BuybidHQ`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #1e293b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
                .label { font-weight: 600; color: #475569; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; margin-bottom: 8px; }
                .value { background-color: white; padding: 12px; border-radius: 4px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
                .message { background-color: white; padding: 20px; border-radius: 4px; border: 1px solid #e2e8f0; white-space: pre-wrap; }
                .type-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                .type-bug { background-color: #fecaca; color: #991b1b; }
                .type-feedback { background-color: #bfdbfe; color: #1e40af; }
                .type-request { background-color: #d9f99d; color: #3f6212; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 24px;">New ${typeLabel}</h1>
                </div>
                <div class="content">
                  <div>
                    <div class="label">Type</div>
                    <div class="value">
                      <span class="type-badge type-${type}">${typeLabel}</span>
                    </div>
                  </div>

                  ${
                    userName
                      ? `
                  <div>
                    <div class="label">Submitted By</div>
                    <div class="value">${userName}</div>
                  </div>
                  `
                      : ""
                  }

                  ${
                    userEmail
                      ? `
                  <div>
                    <div class="label">User Email</div>
                    <div class="value">${userEmail}</div>
                  </div>
                  `
                      : ""
                  }

                  <div>
                    <div class="label">Message</div>
                    <div class="message">${message}</div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
