import { z } from "zod";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;


const ResendResponseSchema = z.object({
  id: z.string()
});

function escapeHtml(text = "") {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendOrderConfirmation({
  orderId,
  order,
  items
}) {

  const customerName = escapeHtml(
    order.customer_name
  );
  
  const subject =
    `Orderbekräftelse #${orderId}`;

  const textItems = items
    .map(
      item =>
        `${item.quantity} x ${item.name} - ${item.price_at_purchase} kr`
    )
    .join("\n");

  const htmlItems = items
    .map(
      item => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${item.quantity}</td>
        <td>${item.price_at_purchase} kr</td>
      </tr>
      `
    )
    .join("");

  const text = `
Hej ${order.customer_name}

Tack för din beställning.

Ordernummer: ${orderId}

Produkter:
${textItems}

Totalt: ${order.total} kr

Med vänliga hälsningar
Shoppen
`;

  const html = `
    <h1>Tack för din beställning ${customerName}!</h1>

    <p>
      Ordernummer:
      <strong>#${orderId}</strong>
    </p>

    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>Produkt</th>
          <th>Antal</th>
          <th>Pris</th>
        </tr>
      </thead>

      <tbody>
        ${htmlItems}
      </tbody>
    </table>

    <p>
      <strong>
        Totalt: ${order.total} kr
      </strong>
    </p>
  `;

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${RESEND_API_KEY}`,

        "Content-Type":
          "application/json",

        "Idempotency-Key":
          `order-confirmation/${orderId}`
      },

      body: JSON.stringify({
        from: EMAIL_FROM,
        to: order.customer_email,
        subject,
        html,
        text
      }),

      signal:
        AbortSignal.timeout(5000)
    }
  );

  const answer =
    await response.json();

  if (!response.ok) {

    console.error(
      "Resend error:",
      answer
    );

    throw new Error(
      answer.message ??
      "Could not send email"
    );
  }

  const parsed =
    ResendResponseSchema
      .safeParse(answer);

  if (!parsed.success) {
    throw new Error(
      "Invalid response from Resend"
    );
  }

  return parsed.data;
}