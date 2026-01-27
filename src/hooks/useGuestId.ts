import { useState, useEffect } from 'react';

const GUEST_ID_KEY = 'connect4_guest_id';

export const useGuestId = () => {
  const [guestId, setGuestId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(GUEST_ID_KEY, id);
    }
    setGuestId(id);
  }, []);

  return guestId;
};
