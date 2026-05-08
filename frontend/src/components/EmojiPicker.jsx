import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import 'emoji-picker-element';

export default function EmojiPicker({ onSelect, visible, onClose, theme = 'light', anchorRef }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !visible) return;

    const picker = document.createElement('emoji-picker');
    picker.classList.add(theme === 'dark' ? 'dark' : 'light');
    picker.setAttribute('style', '--num-columns: 8;');
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(picker);

    const handler = (e) => {
      const emoji = e.detail?.unicode ?? e.detail?.emoji?.unicode;
      if (emoji) onSelect(emoji);
    };
    picker.addEventListener('emoji-click', handler);

    const clickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target) && !anchorRef?.current?.contains(e.target)) {
        onClose?.();
      }
    };
    const t = setTimeout(() => document.addEventListener('click', clickOutside), 0);

    return () => {
      clearTimeout(t);
      picker.removeEventListener('emoji-click', handler);
      document.removeEventListener('click', clickOutside);
    };
  }, [visible, onSelect, onClose, theme, anchorRef]);

  useEffect(() => {
    if (!visible || !containerRef.current) return;
    const wrapper = containerRef.current;
    const margin = 8;
    const pickerWidth = 352;
    const pickerHeight = 360;

    const position = () => {
      const anchor = anchorRef?.current;
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
      wrapper.style.width = `${pickerWidth}px`;
      wrapper.style.height = `${pickerHeight}px`;
      let leftPos = Math.max(margin, rect.left - pickerWidth);
      if (leftPos + pickerWidth > window.innerWidth - margin) {
        leftPos = window.innerWidth - pickerWidth - margin;
      }
      wrapper.style.left = `${leftPos}px`;
      if (spaceAbove >= pickerHeight + margin) {
        wrapper.style.top = 'auto';
        wrapper.style.bottom = `${window.innerHeight - rect.top + margin}px`;
      } else {
        wrapper.style.bottom = 'auto';
        wrapper.style.top = `${rect.bottom + margin}px`;
      }
    };

    position();
    const raf = requestAnimationFrame(position);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [visible, anchorRef]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  if (!visible) return null;

  const content = <div className="emoji-picker-wrapper" ref={containerRef} />;
  return createPortal(content, document.body);
}
