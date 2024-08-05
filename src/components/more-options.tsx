import clsx from "clsx";
import { PiggyBank, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react"
import { InformationModal } from "./information-modal";
import { Input } from "./input";
import { SubmitButton } from "./submit-button";
import { useMutation } from "@apollo/client";
import { useLoggedIn } from "@/hooks/use-loggedIn";
import { SAVE_ECONOMY } from "@/graphql/client/mutations/user";
import { toast } from "sonner";
import { GET_USER_BY_EMAIL } from "@/context/loggedIn-context";

interface MoreOptionsProps {
   month: string;
}

export function MoreOptions({ month }: MoreOptionsProps) {
   const { user, updateUser } = useLoggedIn();

   const [shouldShowOptions, setShouldShowModal] = useState(false);
   const [saveEconomy, { loading: loadingSaveEconomy }]  = useMutation(SAVE_ECONOMY);

   function handleUpdateEconomy(e: FormEvent) {
      e.preventDefault();

      const target = e.target as HTMLFormElement;
      const formData = new FormData(target);

      const economy = formData.get('saving-value')

      if (!economy) {
         return;
      }

      saveEconomy({
         variables: {
            data: {
               userId: user?.id,
               economyId: user?.economy?.id,
               extract: user?.economy?.extract ?
                  [
                     {
                        date: new Date().toISOString(),
                        value: +economy,
                     },
                     ...user?.economy.extract.map(extract => ({
                        date: extract.date,
                        value: extract.value,
                     }))
                  ] :
                  [
                     {
                        date: new Date().toISOString(),
                        value: +economy,
                     }
                  ]
            }
         },
         onCompleted: () => {
            setShouldShowModal(false);
            target.reset();
         },
         update: (cache, { data }) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const updatedData = {
                  ...existingData.user,
                  economy: {
                    ...data.saveEconomy
                  }
               }

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: {
                     user: updatedData,
                  },
                  variables: { email: '' },
               });

               updateUser(updatedData)
            }
         },
         onError: () => {
            toast.error('Tivemos um erro, tente novamente...')
         },
      })
   }

   return (
      <div className={"relative"}>
         <button
            type="button"
            className="flex flex-col items-center justify-center w-10 h-10 gap-1 bg-slate-700 rounded-full relative z-10"
            onClick={() => setShouldShowModal(!shouldShowOptions)}
         >
            <span className="bg-slate-500 rounded-full p-1">
               {shouldShowOptions ? (
                  <X size={24} />
               ) : (
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="24"
                     height="24"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className="lucide lucide-ellipsis-vertical"
                  >
                     <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                  </svg>
               )}
            </span>
         </button>

         <div className={clsx(
            "absolute right-0 top-0 z-0 bg-slate-700 rounded-xl transition-all",
            {
               'max-h-8 w-8 invisible duration-500': !shouldShowOptions,
               'w-[150px] max-h-56  visible overflow-hidden duration-500': shouldShowOptions
            }
         )}>
            <ul className={clsx(
               "h-full w-full mt-10 transition-all",
               {
                  'invisible opacity-0 duration-200': !shouldShowOptions,
                  'visible opacity-1 duration-[1700ms]': shouldShowOptions,
               }
            )}>
               <li>
                  <InformationModal
                     button={{
                        icon: <PiggyBank size={25} />,
                        text: 'Poupança',
                        disabled: !(new Date().getMonth() === new Date(month).getMonth()),
                        buttonClasses: 'py-3 px-2 w-full transition-all hover:bg-slate-500 active:bg-slate-600 disabled:hover:bg-transparent'
                     }}
                     modal={{
                        title: 'Adicionar Poupança'
                     }}
                  >
                     <div>
                        <form onSubmit={handleUpdateEconomy} className="flex flex-col gap-4">
                           <Input
                              labelProps={{
                                 filled: true,
                                 text: 'Valor',
                                 labelClasses: 'bg-slate-700'
                              }}
                              inputProps={{
                                 type: 'number',
                                 id: 'saving-value',
                                 classNames: 'bg-slate-700',
                                 required: true,
                              }}
                           />

                           <SubmitButton
                              bgColor={{
                                 color: 'bg-blue-500',
                                 hover: 'bg-blue-700'
                              }}
                              loading={loadingSaveEconomy}
                              text="Salvar"
                           />
                        </form>
                     </div>
                  </InformationModal>
               </li>

               <li className="transition-all hover:bg-slate-500 active:bg-slate-600">
                  <InformationModal
                     button={{
                        icon: <Trash2 size={25} />,
                        text: 'Deletar mês',
                        buttonClasses: 'flex w-full py-3 px-2 items-center justify-start gap-2 text-sm whitespace-nowrap'
                     }}
                     modal={{
                        title: 'Deletar mês',
                     }}
                  >
                     <div>
                        <p>
                           Ao deletar esse mês, todas as suas despesas e ganhos serão perdidos para sempre.
                        </p>

                        <div className="flex items-center gap-4">
                           <button type="button" className="flex-1">
                              Cancelar
                           </button>

                           <SubmitButton
                              type="button"
                              loading={false}
                              bgColor={{
                                 color: 'bg-red-400',
                                 hover: 'bg-red-600'
                              }}
                              text="Deletar"
                           />
                        </div>
                     </div>

                  </InformationModal>
               </li>
            </ul>
         </div>
      </div>
   )
}
