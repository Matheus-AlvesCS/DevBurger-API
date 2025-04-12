import Stripe from "stripe";
import * as yup from "yup";
import "dotenv/config";

const calculateOrderAmount = (items) => {
  const total = items.reduce((acc, current) => {
    return acc + current.price * current.quantity;
  }, 0);

  return total;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class CreatePaymentIntentController {
  async store(request, response) {
    const productsSchema = yup.object({
      products: yup
        .array()
        .required()
        .of(
          yup.object({
            id: yup.number().required(),
            quantity: yup.number().required(),
            price: yup.number().required(),
          })
        ),
    });

    try {
      productsSchema.validateSync(request.body, { abortEarly: false });
    } catch (err) {
      return response.status(400).json({ error: err.errors });
    }

    const { products } = request.body;

    const amount = calculateOrderAmount(products);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "brl",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    response.json({
      clientSecret: paymentIntent.client_secret,
      dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
    });
  }
}

export default new CreatePaymentIntentController();
