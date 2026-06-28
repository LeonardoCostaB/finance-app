import clsx from 'clsx';

interface FormattedPriceProps {
   price?: number;
   style: 'spent' | 'profit' | 'average' | 'normal';
   classNames?: string;
}

export function FormattedPrice({ price = 0, style, classNames }: FormattedPriceProps) {
   return (
      <span
         className={clsx(`text-base font-medium ${classNames}`, {
            'text-red-400': style === 'spent',
            'text-green-400': style === 'profit',
            'text-blue-400': style === 'average',
            'text-white': style === 'normal',
         })}
      >
         {Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
         }).format(price / 100)}
      </span>
   );
}
