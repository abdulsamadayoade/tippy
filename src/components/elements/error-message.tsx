export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="-mt-0.75 mb-3 rounded-[10px] bg-danger-soft px-3 py-2.25 text-center text-xs text-danger dark:bg-red-400/15 dark:text-red-300"
      role="alert">
      {children}
    </p>
  );
}
