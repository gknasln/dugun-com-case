import { useRef, useEffect } from "react"



export default function AnimatedField(props) {
    const ref = useRef();

    useEffect(() => {
      ref.current.style.opacity = 1;    
    }, []);
    

    return (
        <div
            ref={ref}
            {...props}
            style={{
                opacity: 0,
                transition: "opacity 0.6s",
                ...props.style
            }}
        >
            {props.children}
        </div>
    )
}