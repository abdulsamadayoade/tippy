type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-xl font-semibold tracking-tight text-main-heading">
        {title}
      </h1>
      <p className="text-muted-text">{description}</p>
    </header>
  );
}
