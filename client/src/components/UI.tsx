import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => (
  <div
    onClick={onClick}
    className={`bg-surface rounded-xl p-6 shadow-soft border border-surfaceLight transition-all ${
      onClick ? 'cursor-pointer hover:shadow-medium hover:border-accent/30' : ''
    } ${className}`}
  >
    {children}
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: number;
}

export const StatCard = ({ label, value, unit, icon, trend }: StatCardProps) => (
  <Card>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="stat-label">{label}</p>
        <div className="flex items-baseline space-x-2 mt-3">
          <p className="stat-value">{value}</p>
          {unit && <p className="text-textSecondary text-lg">{unit}</p>}
        </div>
        {trend !== undefined && (
          <p className={`text-sm mt-2 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </p>
        )}
      </div>
      {icon && <div className="text-accent text-3xl">{icon}</div>}
    </div>
  </Card>
);

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'btn-tertiary',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

interface BadgeProps {
  children: ReactNode;
  variant?: 'accent' | 'secondary' | 'danger' | 'success';
  className?: string;
}

export const Badge = ({ children, variant = 'accent', className = '' }: BadgeProps) => {
  const variantClasses = {
    accent: 'bg-accent/20 text-accent',
    secondary: 'bg-secondary/20 text-secondary',
    danger: 'bg-red-500/20 text-red-400',
    success: 'bg-green-500/20 text-green-400',
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>{children}</span>
  );
};

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export const Input = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className = '',
}: InputProps) => (
  <div className="input-group">
    {label && (
      <label className="input-label">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`px-4 py-3 bg-surface text-text border border-surfaceLight rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all ${
        error ? 'border-red-500 focus:ring-red-500/20' : ''
      } ${className}`}
    />
    {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
  </div>
);

interface SelectProps {
  label?: string;
  options: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export const Select = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  placeholder,
}: SelectProps) => (
  <div className="input-group">
    {label && (
      <label className="input-label">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`px-4 py-3 bg-surface text-text border border-surfaceLight rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all ${
        error ? 'border-red-500 focus:ring-red-500/20' : ''
      }`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
  </div>
);
