
export const plans = [
  {
    title: "Basic Plan",
    price: 0,
    period: "forever",
    features: [
      "Access to AI Wellness Agent",
      "Basic wellness analytics",
      "Standard support",
      "Access to online community"
    ]
  },
  {
    title: "Pro Plan",
    monthlyPrice: 20,
    yearlyPrice: 192, // 20% discount
    features: [
      "Enhanced AI features",
      "Advanced analytics",
      "IRL Pop-up Access",
      "Priority support"
    ],
    popular: true
  },
  {
    title: "Enterprise",
    features: [
      "Custom AI implementation",
      "Multiple users usage",
      "Dedicated support team",
      "Custom integrations"
    ],
    custom: true
  }
];
