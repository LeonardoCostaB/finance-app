import clsx from "clsx";

interface FormattedPriceProps {
   price: number
   style: 'spent' | 'profit' | 'average' | 'normal'
   classNames?: string
}

export function FormattedPrice({ price, style, classNames }: FormattedPriceProps) {
   return <span className={clsx(`text-base font-medium ${classNames}`, {
      'text-red-400': style ==='spent',
      'text-green-400': style === 'profit',
      'text-blue-400': style === 'average',
      'text-white': style === 'normal',
   })}>
      {price.toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}
   </span>;
}
