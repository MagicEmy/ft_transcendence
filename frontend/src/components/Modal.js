import { useEffect, useRef } from "react"

export default function({isOpen, setIsOpen, title, children, size}){

    const dialogRef = useRef();

    useEffect(()=>{
        if(isOpen){
            dialogRef.current.showModal();
        }else{
            dialogRef.current.close();
        }
    },[isOpen])

    return(
        <dialog ref={dialogRef} className={size}>
            <div className="close">
                <button onClick={()=>{setIsOpen(false)}}>X</button>
            </div>
            <div className="header">
                <h1>{title}</h1>
            </div>
            <div className="body">
                {children}
            </div>
        </dialog>
    )
}