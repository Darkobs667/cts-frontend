import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ isOpen, onClose, title, subtitle, children, size = 'md' }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.button aria-label="Fermer la fenêtre" className="absolute inset-0 cursor-default bg-emerald-950/45 backdrop-blur-sm" onClick={onClose} />
          <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-emerald-300/35 blur-[110px]" />
          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            className={`relative z-10 my-auto w-full ${sizes[size] || sizes.md} overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-2xl shadow-emerald-950/25 outline-none`}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 330, damping: 27 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-emerald-100 bg-gradient-to-br from-emerald-100 via-emerald-50 to-white px-5 py-5 sm:px-7 sm:py-6">
              <div>
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">CTS · Espace sécurisé</p>
                <h2 id="modal-title" className="text-lg font-black text-emerald-950 sm:text-xl">{title}</h2>
                {subtitle && <p className="mt-1 text-xs font-medium text-emerald-800/70">{subtitle}</p>}
              </div>
              <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-950" aria-label="Fermer">
                <X size={17} />
              </button>
            </header>
            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
