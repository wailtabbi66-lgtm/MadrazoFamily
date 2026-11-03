exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
      return {
        statusCode: 500,
        body: "Webhook is not configured"
      };
    }

    if (!data.gang || !data.radio || !Array.isArray(data.items)) {
      return {
        statusCode: 400,
        body: "Invalid order"
      };
    }

    const message = [
      "🛒 **طلب جديد | MADRAZO FAMILY**",
      `**العصابة:** ${data.gang}`,
      `**الراديو:** ${data.radio}`,
      `**الموقع:** ${data.location || "Cayo Perico"}`,
      "",
      ...data.items.map(item =>
        `• ${item.name}: ${item.quantity} × ${item.unitPrice}$ = ${item.total}$`
      ),
      "",
      `**الإجمالي: ${data.total}$**`
    ].join("\n");

    const discordResponse = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message })
    });

    if (!discordResponse.ok) {
      return {
        statusCode: 502,
        body: "Discord rejected the message"
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Server error"
    };
  }
};