import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import EmojiPickerLib, { Theme } from 'emoji-picker-react';
import './EmojiPicker.css';

const PICKER_WIDTH = 352;
const PICKER_HEIGHT = 420;

export default function EmojiPicker({ onSelect, visible, onClose, theme = 'light', anchorRef }) {
  const wrapperRef = useRef(null);

  const position = useCallback(() => {
    const wrapper = wrapperRef.current;
    const anchor = anchorRef?.current;
    const margin = 8;
    if (!wrapper) return;
    if (!anchor) {
      wrapper.style.position = '';
      wrapper.style.top = '';
      wrapper.style.bottom = '';
      wrapper.style.left = '';
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const spaceAbove = rect.top;
    wrapper.style.position = 'fixed';
    wrapper.style.zIndex = '1000';
    wrapper.style.width = `${PICKER_WIDTH}px`;
    let leftPos = Math.max(margin, rect.left - PICKER_WIDTH);
    if (leftPos + PICKER_WIDTH > window.innerWidth - margin) {
      leftPos = window.innerWidth - PICKER_WIDTH - margin;
    }
    wrapper.style.left = `${leftPos}px`;
    if (spaceAbove >= PICKER_HEIGHT + margin) {
      wrapper.style.top = 'auto';
      wrapper.style.bottom = `${window.innerHeight - rect.top + margin}px`;
    } else {
      wrapper.style.bottom = 'auto';
      wrapper.style.top = `${rect.bottom + margin}px`;
    }
  }, [anchorRef]);

  useEffect(() => {
    if (!visible) return;
    position();
    const raf = requestAnimationFrame(position);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [visible, position]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible) return;
    const clickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        !anchorRef?.current?.contains(e.target)
      ) {
        onClose?.();
      }
    };
    const t = setTimeout(() => document.addEventListener('click', clickOutside), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', clickOutside);
    };
  }, [visible, onClose, anchorRef]);

  const handleEmojiClick = useCallback(
    (emojiData) => {
      const emoji = emojiData?.emoji;
      if (emoji) onSelect?.(emoji);
    },
    [onSelect]
  );

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  if (!visible) return null;

  const pickerTheme = theme === 'dark' ? Theme.DARK : Theme.LIGHT;

  const content = (
    <div ref={wrapperRef} className="emoji-picker-portal">
      <EmojiPickerLib
        onEmojiClick={handleEmojiClick}
        theme={pickerTheme}
        width={PICKER_WIDTH}
        height={PICKER_HEIGHT}
        autoFocusSearch={false}
        lazyLoadEmojis
        searchPlaceholder="Search emoji..."
      />
    </div>
  );

  return createPortal(content, document.body);
}
