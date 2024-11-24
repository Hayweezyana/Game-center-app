const Stripe = require('stripe');
const stripe = Stripe('sk_test_51QABgb2MJKCBkMkWYD3DZMT6uOAjVZ9jInl3YBdNqOtGyr9Qixq4Ut4NgOsq0qj7wtrgNPaZtVxkEzVqazcKHMZZ00YtctKwSV');
const db = require('./config/db'); // Adjust path as needed

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/payment/stripe', async (req, res) => {
  const { amount, email } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: 'usd',
      receipt_email: email,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});
