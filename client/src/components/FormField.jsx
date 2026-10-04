// A label + input (or textarea) + error message.
// Used by every form so they all look and behave the same.
function FormField({ label, name, value, onChange, error, type = 'text', multiline = false, maxLength, placeholder }) {
  const InputTag = multiline ? 'textarea' : 'input';

  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <InputTag
        id={name}
        name={name}
        type={multiline ? undefined : type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        className={error ? 'input-error' : ''}
        rows={multiline ? 3 : undefined}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default FormField;
