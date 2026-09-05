type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between flex-wrap gap-2">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-main-heading">
          {title}
        </h1>
        <p className="text-muted-text">{description}</p>
      </div>

      {children}
    </header>
  );
}
