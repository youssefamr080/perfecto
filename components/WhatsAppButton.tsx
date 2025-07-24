'use client';

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  const whatsappNumber = '201034207175';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center p-3 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      aria-label="اطلب عبر الواتساب"
    >
      <FaWhatsapp className="w-8 h-8 text-white" />
    </a>
  );
};

export default WhatsAppButton;
