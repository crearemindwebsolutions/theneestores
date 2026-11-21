import { useState, useEffect } from 'react'
import { productService, getProductImage, getProductBottle } from './productService'

export function useProducts() {
  const [products, setProducts] = useState(() => productService.getProducts())
  const [podis, setPodis] = useState(() => productService.getPodis())

  useEffect(() => {
    const handleUpdate = () => {
      setProducts([...productService.getProducts()])
      setPodis([...productService.getPodis()])
    }

    window.addEventListener('thenee_products_updated', handleUpdate)
    window.addEventListener('thenee_cms_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    // Background sync on mount
    productService.syncFromDatabase()

    return () => {
      window.removeEventListener('thenee_products_updated', handleUpdate)
      window.removeEventListener('thenee_cms_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return { products, podis, getProductImage, getProductBottle }
}

export { getProductImage, getProductBottle }
