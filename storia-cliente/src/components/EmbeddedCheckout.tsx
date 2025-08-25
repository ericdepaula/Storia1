import React from 'react';
import { useEffect, useRef } from 'react';
import { loadStripe, StripeEmbeddedCheckout } from '@stripe/stripe-js';

const stripePromise = loadStripe("pk_test_51RkvOuPphAIQfHkywezXbIGIPmdgWi8skWkaWeOiwXPN7x7SOD1Yfzq3JwWsJsHXXOxTLQVA9UYZmDjuGRbVj2jj00L5wqYil2");

// 1. Atualize a interface de props
interface EmbeddedCheckoutProps {
  clientSecret: string;
  onPaymentSuccess: () => void; // Adicione esta linha
}

const EmbeddedCheckout: React.FC<EmbeddedCheckoutProps> = ({ clientSecret, onPaymentSuccess }) => {
  const checkoutRef = useRef<StripeEmbeddedCheckout | null>(null);

  useEffect(() => {
    if (!clientSecret) {
      return;
    }

    const initializeAndMount = async () => {
      const stripe = await stripePromise;
      if (!stripe) {
        console.error("Stripe.js não carregou.");
        return;
      }

      const checkoutDiv = document.getElementById('checkout');
      if (checkoutDiv) {
        checkoutDiv.innerHTML = '';
      }

      checkoutRef.current = await stripe.initEmbeddedCheckout({
        clientSecret,
      });

      checkoutRef.current.mount('#checkout');
    };

    initializeAndMount();

    return () => {
      if (checkoutRef.current) {
        checkoutRef.current.destroy();
      }
    };
  }, [clientSecret, onPaymentSuccess]); // 3. Adicione onPaymentSuccess às dependências

  return <div id="checkout" className="w-full h-full" />;
};

export default EmbeddedCheckout;