'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { CircleFadingPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { SelectInput } from './select-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { CREATE_MONTH } from '@/graphql/client/mutations/month';
import { SubmitButton } from './submit-button';
import { useRouter } from 'next/navigation';
import { useLoggedIn } from '@/hooks/use-loggedIn';
import { GET_USER_BY_EMAIL } from '@/context/loggedIn-context';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

interface NewMonthCardProps {
   onMonthCreated: (month: Months) => void;
   forThePreview?: boolean;
}

const createMonthFormSchema = z.object({
   month: z.string(),
   year: z.string().nonempty('Selecione o ano'),
});

type CreateMonthFormData = z.infer<typeof createMonthFormSchema>;

export function NewMonthCard({ onMonthCreated, forThePreview }: NewMonthCardProps) {
   const { updateUser } = useLoggedIn();
   const [createMonth, { loading }] = useMutation(CREATE_MONTH);

   const [shouldShowModal, setShouldShowModal] = useState(false);
   const [animation, setAnimation] = useState(false);
   const [isMobile, setIsMobile] = useState(false);

   const router = useRouter();

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<CreateMonthFormData>({
      resolver: zodResolver(createMonthFormSchema),
   });

   async function handleSaveNote(data: CreateMonthFormData) {
      await createMonth({
         variables: {
            data: {
               month: data.month,
               year: data.year,
            },
         },
         update: (cache, { data }) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const updatedData = {
                  ...existingData.user,
                  months: [
                     ...existingData.user.months,
                     {
                        ...(data.createMonth as Months),
                     },
                  ],
               };

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: {
                     user: updatedData,
                  },
                  variables: { email: '' },
               });

               updateUser(updatedData);
               onMonthCreated(data.createMonth);
            }
         },
         onCompleted: (data) => {
            toast.success('Mês criado com sucesso');

            router.push(`/${data.createMonth.id}/month`);
         },
         onError: (error) => toast.error(`Erro ao salvar o mês: ${error.message}`),
      });
   }

   useEffect(() => {
      setIsMobile(window.innerWidth <= 1024);
   }, []);

   return (
      <Dialog.Root
         open={shouldShowModal}
         onOpenChange={async (open) => {
            if (!open && isMobile) {
               setAnimation(open);
               await new Promise((resolve) => setTimeout(() => resolve(true), 500));
            }
            setAnimation(open);
            setShouldShowModal(open);
         }}
      >
         <Dialog.Trigger
            className={`flex flex-col items-center ${forThePreview ? 'my-[2px] max-h-[106px] whitespace-nowrap rounded-md p-4 max-lg:w-32 max-lg:p-2' : 'gap-3 rounded-3xl p-5'} space-y-3 bg-slate-700 text-left outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400`}
         >
            <span
               className={`text-center text-lg font-medium text-slate-200 ${forThePreview ? 'max-lg:text-base' : ''}`}
            >
               Novo mês
            </span>

            {!forThePreview && (
               <p className="text-sm leading-6 text-slate-400">Cadastre aqui um novo mês</p>
            )}

            <div className="flex w-full items-center justify-center">
               <CircleFadingPlus size={forThePreview ? 30 : 100} />
            </div>
         </Dialog.Trigger>

         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 animate-overlayShow bg-black/40" />

            <Dialog.Content
               className={clsx(
                  'add-new-block-mobile fixed z-40 flex h-auto w-[min(500px,95%)] flex-col bg-slate-700 outline-none transition-all duration-500 max-lg:animate-contentMobileShow max-md:w-full md:inset-auto md:left-1/2 md:top-1/2 md:max-w-[640px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md lg:animate-contentShow',
                  {
                     'invisible max-h-0 opacity-0': isMobile && !animation,
                     'opacity-1 visible max-h-[500px]': isMobile && animation,
                  },
               )}
            >
               <div className="mb-4 flex w-full items-center lg:justify-center lg:pt-5">
                  <Dialog.Title className="inline-block w-full text-center text-xl max-lg:pl-7">
                     Adicionar um novo mês
                  </Dialog.Title>

                  <Dialog.DialogClose className="lg:hidden">
                     <X />
                  </Dialog.DialogClose>
               </div>

               <form onSubmit={handleSubmit(handleSaveNote)} className="flex flex-1 flex-col">
                  <div className="flex flex-1 flex-col gap-3 lg:p-5">
                     <SelectInput
                        labelProps={{
                           text: 'Selecione o mês',
                        }}
                        selectProps={{
                           id: 'mouths',
                           name: 'mouths',
                           register: { ...register('month') },
                           fields: [
                              {
                                 code: '0',
                                 name: 'Janeiro',
                              },
                              {
                                 code: '1',
                                 name: 'Fevereiro',
                              },
                              {
                                 code: '2',
                                 name: 'Março',
                              },
                              {
                                 code: '3',
                                 name: 'Abril',
                              },
                              {
                                 code: '4',
                                 name: 'Maio',
                              },
                              {
                                 code: '5',
                                 name: 'Junho',
                              },
                              {
                                 code: '6',
                                 name: 'Julho',
                              },
                              {
                                 code: '7',
                                 name: 'Agosto',
                              },
                              {
                                 code: '8',
                                 name: 'Setembro',
                              },
                              {
                                 code: '9',
                                 name: 'Outubro',
                              },
                              {
                                 code: '10',
                                 name: 'Novembro',
                              },
                              {
                                 code: '11',
                                 name: 'Dezembro',
                              },
                           ],
                           placeholder: 'Selecione um mês',
                        }}
                        error={{
                           show: !!errors.year,
                           message: errors.year?.message,
                        }}
                     />

                     <SelectInput
                        labelProps={{
                           text: 'Selecione o ano',
                        }}
                        selectProps={{
                           fields: [
                              {
                                 code: new Date(new Date().getFullYear(), 0, 1)
                                    .getFullYear()
                                    .toString(),
                                 name: new Date(new Date().getFullYear(), 0, 1)
                                    .getFullYear()
                                    .toString(),
                              },
                              {
                                 code: new Date(new Date().getFullYear() + 1, 11, 31)
                                    .getFullYear()
                                    .toString(),
                                 name: new Date(new Date().getFullYear() + 1, 11, 31)
                                    .getFullYear()
                                    .toString(),
                              },
                           ],
                           id: 'years',
                           name: 'years',
                           register: { ...register('year') },
                           placeholder: 'Selecione um ano',
                        }}
                        error={{
                           show: !!errors.year,
                           message: errors.year?.message,
                        }}
                     />

                     <SubmitButton
                        type="submit"
                        loading={loading}
                        bgColor={{
                           color: 'bg-indigo-500',
                           hover: 'bg-indigo-700',
                        }}
                        text="Salvar"
                     />
                  </div>
               </form>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
}
