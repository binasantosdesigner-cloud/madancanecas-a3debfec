const MSG = "Olá! Vim pelo site da Madan e quero saber mais sobre os produtos.";
const URL = `https://wa.me/5566984266994?text=${encodeURIComponent(MSG)}`;

export function WhatsAppFloat() {
  return (
    <a
      href={URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Madan no WhatsApp"
      className="group fixed bottom-6 right-6 z-[60] flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
      style={{ backgroundColor: "#25d366" }}
    >
      <svg viewBox="0 0 24 24" fill="white" className="size-7" aria-hidden="true">
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.04 0C5.5 0 .2 5.3.2 11.84a11.8 11.8 0 0 0 1.6 5.94L0 24l6.36-1.66a11.86 11.86 0 0 0 5.68 1.45h.01c6.54 0 11.84-5.3 11.84-11.84 0-3.16-1.23-6.13-3.37-8.47Zm-8.48 18.2h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.8 9.8 0 0 1-1.5-5.2c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.03 6.96 2.89a9.78 9.78 0 0 1 2.88 6.97c0 5.43-4.42 9.84-9.83 9.84Zm5.4-7.37c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100">
        Falar com a Madan
      </span>
    </a>
  );
}