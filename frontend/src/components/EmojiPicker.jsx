import { useEffect, useRef } from 'react';
import 'emoji-picker-element';

export default function EmojiPicker({ onSelect, visible, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !visible) return;

    const picker = document.createElement('emoji-picker');
    picker.classList.add('light');
    picker.setAttribute('style', '--num-columns: 8;');
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(picker);

    const handler = (e) => {
      const emoji = e.detail?.unicode;
      if (emoji) onSelect(emoji);
    };
    picker.addEventListener('emoji-click', handler);

    const clickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener('click', clickOutside);

    return () => {
      picker.removeEventListener('emoji-click', handler);
      document.removeEventListener('click', clickOutside);
    };
  }, [visible, onSelect, onClose]);

  if (!visible) return null;

  return (
    <div className="emoji-picker-wrapper" ref={containerRef} />
  );
}
