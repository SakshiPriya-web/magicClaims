export const Calendar = ({ selected, onSelect, className, disabled }) => {
  return (
    <input
      type="date"
      value={selected ? selected.toISOString().substr(0, 10) : ""}
      onChange={(e) => onSelect(new Date(e.target.value))}
      className={`${className || ""}`}
      disabled={disabled}
    />
  );
};
