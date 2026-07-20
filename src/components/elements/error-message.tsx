export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="-mt-0.75 mb-3 rounded-[10px] bg-danger-soft px-3 py-2.25 text-center text-xs text-danger"
      role="alert">
      {children}
    </p>
  );
}
