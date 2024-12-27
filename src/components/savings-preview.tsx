'use client';

import { Chart, ArcElement, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useLoggedIn } from '@/hooks/use-loggedIn';
import { useEffect, useState } from 'react';

Chart.register(ArcElement);
Chart.register(...registerables);

interface SavingResult {
   date: string;
   value: number;
}

interface SavingsPreviewProps {
   container?: {
      classNames: string;
   };
}

export function SavingsPreview({ container }: SavingsPreviewProps) {
   const { user } = useLoggedIn();
   const [chartData, setChartData] = useState<SavingResult[]>([]);

   useEffect(() => {
      if (!user) return;

      const months = Array.from(
         { length: 12 },
         (_, i) => new Date(new Date().getFullYear(), i + 1, 10, 10),
      );

      const teste: SavingResult[] = [];

      const resultados = user.economy.extract.reduce((acc: SavingResult[], item) => {
         const mesAno = new Date(item.date).toISOString().slice(0, 7);
         const existente = acc.find((d) => d.date === mesAno);

         if (existente) {
            existente.value += item.value;
         } else {
            acc.push({ date: mesAno, value: item.value });
         }

         return acc;
      }, []);

      months.forEach((month) => {
         const getMonthYear = month.toISOString().slice(0, 7);
         const monthResult = resultados.find((d) => d.date === getMonthYear);

         if (monthResult) {
            teste.push(monthResult);
         } else {
            teste.push({ date: getMonthYear, value: 0 });
         }
      });

      setChartData(teste);
   }, [user]);

   if (!user) return <>Carregando</>;

   return (
      <div className={container?.classNames}>
         <Bar
            data={{
               labels: chartData.map((e) =>
                  new Date(e.date).toLocaleDateString('pt-BR', { month: 'short' }),
               ),
               datasets: [
                  {
                     label: 'Valor poupado',
                     data: chartData.map((e) => e.value),
                  },
               ],
            }}
            options={{
               plugins: {
                  title: {
                     display: false,
                  },
               },
               scales: {
                  y: {
                     beginAtZero: true,
                  },
               },
            }}
            style={{
               width: '100%',
            }}
         />
      </div>
   );
}
