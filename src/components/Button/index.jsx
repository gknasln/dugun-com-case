import classcat from "classcat";
import c from "./button.module.scss";

/**
 * 
 * @param {{ 
 *  text: String
 *  onClick: Function
 *  type: "text" | "default";
 * }} props Props for the component
 * 
 */
export default function Button({
  children, 
  text, 
  onClick,
  type = "default",
  className, 
}) {
  return (
    <button
      onClick={onClick}
      className={classcat([
        c.container, 
        type === "default" && c.default,
        type === "text" && c.textButton,
        className
      ])}
    >  
      {children}
      {text}
    </button>
  )
}