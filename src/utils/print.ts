export function triggerPrint(onBlocked?: () => void): void {
  const supportsBeforePrint = 'onbeforeprint' in window;
  let didTrigger = false;

  const handleBeforePrint = () => {
    didTrigger = true;
  };

  if (supportsBeforePrint) {
    window.addEventListener('beforeprint', handleBeforePrint);
  }

  try {
    window.focus();
    window.print();
  } catch {
    if (supportsBeforePrint) {
      window.removeEventListener('beforeprint', handleBeforePrint);
    }
    onBlocked?.();
    return;
  }

  if (supportsBeforePrint) {
    setTimeout(() => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      if (!didTrigger) {
        onBlocked?.();
      }
    }, 500);
  }
}
