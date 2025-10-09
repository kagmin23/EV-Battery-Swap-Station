interface PageTemplateProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PageTemplate = ({ title, description, children }: PageTemplateProps) => {
  return (
    <div className="page-container">
      <h1>{title}</h1>
      {description && (
        <div className="page-content">
          <p>{description}</p>
          {children}
        </div>
      )}
    </div>
  );
};

export default PageTemplate;

