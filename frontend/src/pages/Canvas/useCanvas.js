import { useRef, useEffect } from 'react'

const useCanvas = draw => {
  
  const ref = useRef(null)
  
  useEffect(() => {
    
    const canvas = ref.current
    const context = canvas.getContext('2d')
    let count = 0
    let animationId
    
    const renderer = () => {
      count++
      draw(context, count)
      animationId = window.requestAnimationFrame(renderer)
    }
    renderer()
    
    return () => {
      window.cancelAnimationFrame(animationId)
    }
  }, [draw])
  
  return ref
}

export default useCanvas