'use client';

import { useEffect, useState } from 'react';

const bannerMessages = [
  '🎉 Free shipping on orders over $50',
  '💳 Secure checkout with multiple payment options',
  '🚚 Fast delivery to your doorstep',
  '✨ New arrivals every week',
  '💯 100% authentic products guaranteed',
];

export default function MovingBanner() {
  const [displayText, setDisplayText] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentMessage = bannerMessages[messageIndex];
    const typingSpeed = isDeleting ? 30 : 50;
    const delay = isDeleting ? 20 : 1000;

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentMessage.length) {
        setDisplayText(currentMessage.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(currentMessage.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === currentMessage.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setMessageIndex((messageIndex + 1) % bannerMessages.length);
        setIsDeleting(false);
      }
    }, isDeleting ? typingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, messageIndex]);

  return (
    <div className="w-full bg-gradient-to-r from-primary via-secondary to-primary text-primary-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="text-center text-sm md:text-base font-medium h-6 flex items-center justify-center">
          {displayText}
          <span className="animate-pulse ml-1">|</span>
        </div>
      </div>
    </div>
  );
}
