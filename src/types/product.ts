export interface ProductRow {
  id: string

  item: string
  brand: string
  category: string
  gender: string
  fabric: string
  pattern: string
  fit: string

  frontImage?: File | null
  backImage?: File | null
  description: string

  sizes: {
    xs: number
    s: number
    m: number
    l: number
    xl: number
    xxl: number
    xxxl: number
    xxxxl: number
  }

  barcode: string
}