'use client'

import { Note } from "@/app/page";
import { FormattedPrice } from "@/components/formatted-price";
import { Header } from "@/components/header";
import { useEffect, useState } from "react"

export default function Month({ params }: { params: { id: string } }) {
   const [month, setMonth] = useState<Note | undefined>({} as Note);

   useEffect(() => {
      const monthStorage = localStorage.getItem('notes');

      if (monthStorage) {
         const monthArray = JSON.parse(monthStorage) as Note[]

         const filterById = monthArray.find(month => month.id === params.id)

         setMonth(filterById);
      }
   }, [])


   return month ? (
      <>
         <Header />

         <main className="flex flex-col items-center max-w-7xl mx-auto mb-20">
            <h1 className="text-4xl">{month.month}</h1>

            <section className="w-full mt-6">
               <h2 className="text-2xl mb-4">Resumo:</h2>

               <div className="p-4 border border-white rounded-xl flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                     <span className="text-sm">Ganhos: <FormattedPrice price={5000} style="profit" /></span>
                     <span className="text-sm">Gastos: <FormattedPrice price={2500} style="spent" /></span>
                     <span className="text-sm">Balanço Mensal: <FormattedPrice price={2500} style="average" /></span>
                  </div>

                  <span className="max-w-52 text-center leading-7">
                     Desses <FormattedPrice price={2500} style="average" /> você poupou R$ <FormattedPrice price={1500} style="profit" />
                  </span>

                  <span className="max-w-56 text-center">
                     Restou <FormattedPrice price={1000} style="profit" /> aproveite. 🚀
                  </span>
               </div>
            </section>

            <section className="w-full mt-6">
               <h2 className="text-2xl mb-4">Ganhos:</h2>

               <div className="pt-4  rounded-xl flex items-start justify-between">
                  <table id="table" className="overflow-auto w-[calc(100%-300px)] block">
                     <thead>
                        <tr>
                           <td className="border border-white p-2 font-normal text-center min-w-[200px]">Comuns</td>
                           <td className="border border-white p-2 font-normal text-center min-w-[200px]">Cartões</td>
                           <td className="border border-white p-2 font-normal text-center min-w-[200px]">Comuns</td>
                           <td className="border border-white p-2 font-normal text-center min-w-[200px]">Cartões</td>
                        </tr>
                     </thead>

                     <tbody>
                        <tr>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Aluguel <br /> <FormattedPrice price={500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Nubank: <br /> <FormattedPrice price={2500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Aluguel <br /> <FormattedPrice price={500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Nubank: <br /> <FormattedPrice price={2500} style="normal" /></th>
                        </tr>

                        <tr>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Dentista <br /> <FormattedPrice price={100} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Inter: <br /> <FormattedPrice price={2500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Dentista <br /> <FormattedPrice price={100} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Inter: <br /> <FormattedPrice price={2500} style="normal" /></th>
                        </tr>

                        <tr>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Academia <br /> <FormattedPrice price={120} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Itau: <br /> <FormattedPrice price={2500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Academia <br /> <FormattedPrice price={100} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Itau: <br /> <FormattedPrice price={2500} style="normal" /></th>
                        </tr>
                     </tbody>

                     <tfoot>
                        <tr>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Total <br /> <FormattedPrice price={720} style="profit" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Total <br /> <FormattedPrice price={2500} style="profit" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Total <br /> <FormattedPrice price={720} style="profit" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Total <br /> <FormattedPrice price={2500} style="profit" /></th>
                        </tr>
                     </tfoot>
                  </table>

                  <form className="shadow-sm shadow-slate-500 p-4">
                     <span className="w-full text-center inline-block mb-3">Novo Ganho</span>

                     <div className="flex flex-col gap-2">
                        <label htmlFor="" className="pl-2 text-sm">Titulo</label>
                        <input type="text" name="" id="" placeholder="Ex: Freela" className="bg-slate-800 py-2 px-4 rounded-lg text-sm" />
                     </div>

                     <div className="flex flex-col gap-2 my-3">
                        <label htmlFor="" className="pl-2 text-sm">Nome</label>
                        <input type="text" name="" id="" placeholder="Ex: Site X" className="bg-slate-800 py-2 px-4 rounded-lg text-sm" />
                     </div>

                     <div className="flex flex-col gap-2">
                        <label htmlFor="" className="pl-2 text-sm">Valor</label>
                        <input type="number" name="" id="" placeholder="Ex: 2500" className="bg-slate-800 py-2 px-4 rounded-lg text-sm" />
                     </div>

                     <button type="submit" className="bg-green-400 px-4 py-1 rounded-md w-full mt-4 transition-all hover:bg-green-600">
                        Salvar
                     </button>
                  </form>
               </div>
            </section>

            <section className="w-full mt-6">
               <h2 className="text-2xl mb-4">Despesas:</h2>

               <div className="pt-4  rounded-xl flex items-start justify-between">
                  <table id="table" className="overflow-auto w-[calc(100%-300px)] block">
                     <thead>
                        <tr>
                           <td className="border border-white p-2 font-normal text-center min-w-[200px]">Comuns</td>
                           <td className="border border-white p-2 font-normal text-center min-w-[200px]">Cartões</td>
                           <td className="border border-white p-2 font-normal text-center min-w-[200px]">Comuns</td>
                           <td className="border border-white p-2 font-normal text-center min-w-[200px]">Cartões</td>
                        </tr>
                     </thead>

                     <tbody>
                        <tr>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Aluguel <br /> <FormattedPrice price={500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Nubank: <br /> <FormattedPrice price={2500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Aluguel <br /> <FormattedPrice price={500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Nubank: <br /> <FormattedPrice price={2500} style="normal" /></th>
                        </tr>

                        <tr>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Dentista <br /> <FormattedPrice price={100} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Inter: <br /> <FormattedPrice price={2500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Dentista <br /> <FormattedPrice price={100} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Inter: <br /> <FormattedPrice price={2500} style="normal" /></th>
                        </tr>

                        <tr>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Academia <br /> <FormattedPrice price={120} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Itau: <br /> <FormattedPrice price={2500} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Academia <br /> <FormattedPrice price={100} style="normal" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Itau: <br /> <FormattedPrice price={2500} style="normal" /></th>
                        </tr>
                     </tbody>

                     <tfoot>
                        <tr>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Total <br /> <FormattedPrice price={720} style="spent" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Total <br /> <FormattedPrice price={2500} style="spent" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Total <br /> <FormattedPrice price={720} style="spent" /></th>
                           <th className="border border-white p-2 text-sm text-gray-300 font-normal leading-7">Total <br /> <FormattedPrice price={2500} style="spent" /></th>
                        </tr>
                     </tfoot>
                  </table>

                  <form className="shadow-sm shadow-slate-500 p-4">
                     <span className="w-full text-center inline-block mb-3">Nova Dispesa</span>

                     <div className="flex flex-col gap-2">
                        <label htmlFor="" className="pl-2 text-sm">Titulo</label>
                        <input type="text" name="" id="" placeholder="Ex: Cartões" className="bg-slate-800 py-2 px-4 rounded-lg text-sm" />
                     </div>

                     <div className="flex flex-col gap-2 my-3">
                        <label htmlFor="" className="pl-2 text-sm">Nome</label>
                        <input type="text" name="" id="" placeholder="Ex: Nubank" className="bg-slate-800 py-2 px-4 rounded-lg text-sm" />
                     </div>

                     <div className="flex flex-col gap-2">
                        <label htmlFor="" className="pl-2 text-sm">Valor</label>
                        <input type="number" name="" id="" placeholder="Ex: 1200" className="bg-slate-800 py-2 px-4 rounded-lg text-sm" />
                     </div>

                     <div className="flex flex-col gap-2 mt-3">
                        <label htmlFor="" className="pl-2 text-sm">Em quantos meses:</label>
                        <input type="number" name="" id="" placeholder="Ex: 3" className="bg-slate-800 py-2 px-4 rounded-lg text-sm" />
                     </div>

                     <button type="submit" className="bg-red-400 px-4 py-1 rounded-md w-full mt-4 transition-all hover:bg-red-600">
                        Salvar
                     </button>
                  </form>
               </div>
            </section>
         </main>
      </>
   ) : params.id === 'new' ? (
      <h1>Novo mês</h1>
   ) : (
      <h1>Not Found</h1>
   )
}
