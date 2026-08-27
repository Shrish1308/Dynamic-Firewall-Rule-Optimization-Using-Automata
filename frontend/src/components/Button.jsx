export function Button({ variant = 'primary', size, icon: Icon, children, className = '', ...props }) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...props}>
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}
