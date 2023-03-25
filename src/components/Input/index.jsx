
import classcat from "classcat";
import c from "./input.module.scss";


/**
 * 
 * @param {{ 
 *  value: Any
 *  onChange: Function
 *  type: "text" | "button" | "checkbox" | "mail" 
 *  label: String
 *  style: Object
 *  warn: Boolean
 *  placeholder: String
 * }} props Props for the component
 * 
 */
export default function Input({
  value, 
  onChange, 
  type = "text", 
  label,
  icon,
  containerStyle,
  warn,
  deleteButton,
  placeholder
}) { 

  
  return (
    <div 
      className={classcat([c.container, warn && c.warn])}
      style={containerStyle} 
    >
      <input  
        className={value && c.filledInput}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        type={type}    
      />
      <label>
        {label}
      </label>
      {
        deleteButton&& (
          <div 
            className={c.clearButton}
            onClick={() => onChange("")}
          >
            &times;
          </div>
        ) 
      }
      {
        icon && (
          <div className={c.icon}>
            {icon}
          </div>
        )
      }
    </div>
  )
}


