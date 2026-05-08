import { useState, useRef, useEffect, useCallback } from 'react';
import { CodeIcon, XIcon, SendArrowIcon } from './icons';
import './ShareCodePanel.css';

const LANGUAGES = [
  { value: '', label: 'Plain' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'git', label: 'Git' },
];

function inferCodeLanguage(text) {
  const t = text.trim();
  if (t.length < 14) return '';
  if (/^\s*<!DOCTYPE html|^<html[\s>/]|^<head[\s>]/im.test(t)) return 'html';
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\s+/im.test(t)) return 'sql';
  if (/^\s*(import\s+\w+\s+from|from\s+[\w.]+\s+import|def\s+\w+\s*\(|class\s+\w+\s*:)/m.test(t)) return 'python';
  if (/^\s*(package\s+\w|func\s+\(|type\s+\w+\s+struct)/m.test(t)) return 'go';
  if (/^\s*(fn\s+\w|let\s+mut\s|impl\s|use\s+std::)/m.test(t)) return 'rust';
  if (/^\s*(public\s+class|import\s+java\.)/m.test(t)) return 'java';
  if (/^[\s\n]*\{[\s\S]*"[^"]+"\s*:/m.test(t)) return 'json';
  if (/^\s*(interface\s+\w|type\s+\w+\s*[={<]|\)\s*:\s*\w+)/m.test(t)) return 'typescript';
  if (/^\s*(function\s*\(|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|=>)/m.test(t)) return 'javascript';
  if (/^#!\/bin\/(ba)?sh/m.test(t)) return 'bash';
  if (/^\s*(git\s+(commit|push|pull|checkout|rebase)|^#.*\bbranch\b)/im.test(t)) return 'git';
  return '';
}

export default function ShareCodePanel({ isOpen, onClose, onShare }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const codeInputRef = useRef(null);
  const userPickedLanguageRef = useRef(false);
  const inferDebounceRef = useRef(null);

  const handleClose = useCallback(() => {
    if (inferDebounceRef.current) {
      clearTimeout(inferDebounceRef.current);
      inferDebounceRef.current = null;
    }
    setCode('');
    setLanguage('');
    onClose?.();
  }, [onClose]);

  const handleCodeChange = (e) => {
    const v = e.target.value;
    setCode(v);
    if (inferDebounceRef.current) clearTimeout(inferDebounceRef.current);
    inferDebounceRef.current = setTimeout(() => {
      inferDebounceRef.current = null;
      if (userPickedLanguageRef.current) return;
      setLanguage((lang) => {
        if (lang !== '') return lang;
        const t = v.trim();
        if (t.length < 28) return lang;
        const guess = inferCodeLanguage(t);
        return guess || lang;
      });
    }, 350);
  };

  const handleShare = () => {
    if (inferDebounceRef.current) {
      clearTimeout(inferDebounceRef.current);
      inferDebounceRef.current = null;
    }
    const trimmed = code.trim();
    if (!trimmed) return;
    const langTag = language ? language : '';
    const formatted = `\`\`\`${langTag}\n${trimmed}\n\`\`\``;
    onShare?.(formatted);
    setCode('');
    setLanguage('');
    onClose?.();
  };

  useEffect(() => {
    if (isOpen) {
      userPickedLanguageRef.current = false;
      requestAnimationFrame(() => codeInputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => () => {
    if (inferDebounceRef.current) clearTimeout(inferDebounceRef.current);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="share-code-overlay" onClick={handleClose}>
      <div className="share-code-panel" onClick={(e) => e.stopPropagation()}>
        <div className="share-code-header">
          <div className="share-code-title">
            <CodeIcon size={20} />
            <span>Share Code</span>
          </div>
          <button type="button" onClick={handleClose} className="share-code-close" title="Close">
            <XIcon size={18} />
          </button>
        </div>

        <div className="share-code-body">
          <label className="share-code-label">Paste your code</label>
          <div className="share-code-language-row">
            <select
              value={language}
              onChange={(e) => {
                userPickedLanguageRef.current = true;
                setLanguage(e.target.value);
              }}
              className="share-code-language"
            >
              {LANGUAGES.map((opt) => (
                <option key={opt.value || 'plain'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            ref={codeInputRef}
            className="share-code-input"
            value={code}
            onChange={handleCodeChange}
            placeholder="Paste or type your code here..."
            spellCheck={false}
          />
          <div className="share-code-preview">
            <div className="share-code-preview-label">Preview</div>
            <pre className="share-code-preview-block">
              <code>{code || '(empty)'}</code>
            </pre>
          </div>
        </div>

        <div className="share-code-actions">
          <button
            type="button"
            onClick={handleShare}
            disabled={!code.trim()}
            className="share-code-btn share-code-btn-send"
          >
            <SendArrowIcon size={16} />
            Share to Chat
          </button>
          <button type="button" onClick={handleClose} className="share-code-btn share-code-btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
