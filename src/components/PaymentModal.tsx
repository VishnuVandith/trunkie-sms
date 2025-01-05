import React, { useState } from 'react';
import { payFees } from '@/lib/actions';

interface PaymentModalProps {
  feeId: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ feeId, onClose, onPaymentSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(value.replace(/(.{4})/g, '$1 ').trim());
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(value);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
      setExpiry(value.slice(0, 2) + '/' + value.slice(2));
    } else {
      setExpiry(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Assume payment is successful
    const formData = new FormData();
    formData.append('id', feeId.toString());
    const result = await payFees(formData);
    if (result.success) {
      onPaymentSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Payment Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={19}
              placeholder="**** **** **** ****"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">CVV</label>
            <input
              type="password"
              value={cvv}
              onChange={handleCvvChange}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={3}
              placeholder="***"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Expiry</label>
            <input
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={5}
              placeholder="MM/YY"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Pay</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
