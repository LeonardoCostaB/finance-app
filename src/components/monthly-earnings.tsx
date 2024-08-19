import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { FormattedPrice } from './formatted-price';
import { Input } from './input';
import { SubmitButton } from './submit-button';
import { InformationModal } from './information-modal';
import { Info, Link, Trash2, X } from 'lucide-react';

import { useLoggedIn } from '@/hooks/use-loggedIn';
import {
   CREATE_EARNING_ITEM,
   DELETE_EARNING,
   DELETE_EARNING_ITEM,
} from '@/graphql/client/mutations/month';
import { GET_USER_BY_EMAIL } from '@/context/loggedIn-context';

interface MonthlyEarningsProps {
   monthId: string;
   earnings: Earnings;
}

const createNewEarningsFormSchema = z.object({
   earningName: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .transform((name) => name[0].toUpperCase() + name.substring(1)),
   earningValue: z.number().min(1, 'Mínimo R$ 1'),
   earningLink: z.union([z.literal(''), z.string()]),
   earningNotes: z.union([z.literal(''), z.string().min(5, 'Mínimo de 5 caracteres')]),
});

type CreateNewEarningsFormData = z.infer<typeof createNewEarningsFormSchema>;

export function MonthlyEarnings({ monthId, earnings }: MonthlyEarningsProps) {
   const { updateUser } = useLoggedIn();

   const {
      register,
      handleSubmit,
      watch,
      reset,
      formState: { errors },
   } = useForm<CreateNewEarningsFormData>({
      resolver: zodResolver(createNewEarningsFormSchema),
      defaultValues: {
         earningValue: 0,
         earningLink: '',
      },
   });

   const [createEarningItem, { loading }] = useMutation(CREATE_EARNING_ITEM);
   const [deleteEarningItem, { loading: deleteLoading }] = useMutation(DELETE_EARNING_ITEM);
   const [deleteEarning, { loading: deleteEarningLoading }] = useMutation(DELETE_EARNING);

   const [shouldShowModal, setShouldShowModal] = useState(false);
   const [earningsData, setEarningsData] = useState<Earnings['extract']>([]);

   async function handleOnSubmit(data: CreateNewEarningsFormData) {
      await createEarningItem({
         variables: {
            monthId,
            data: {
               title: earnings.title,
               name: data.earningName,
               value: data.earningValue,
               link: data.earningLink,
               notes: data.earningNotes,
            },
         },
         update: (cache, { data }) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const newEarningsItems = [
                  ...(data.createEarningItem.earnings as Months['earnings']),
               ];

               const updatedData = {
                  ...existingData.user,
                  months: [
                     ...existingData.user.months.filter((month) => month.id !== monthId),
                     ...existingData.user.months
                        .filter((month) => month.id === monthId)
                        .map((month) => ({
                           ...month,
                           earnings: newEarningsItems,
                        })),
                  ],
               };

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: { user: updatedData },
                  variables: { email: '' },
               });

               updateUser(updatedData);

               setEarningsData(
                  updatedData.months
                     .filter((month) => month.id === monthId)[0]
                     .earnings.filter((earning) => earning.title === earnings.title)[0].extract,
               );
            }
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
      reset();
      setShouldShowModal(false);
   }

   function handleOnDeleteBlock() {
      deleteEarning({
         variables: {
            data: {
               monthId,
               title: earnings.title,
            },
         },
         update: (cache) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const updatedData = {
                  ...existingData.user,
                  months: [
                     ...existingData.user.months.filter((month) => month.id !== monthId),
                     ...existingData.user.months
                        .filter((month) => month.id === monthId)
                        .map((month) => ({
                           ...month,
                           earnings: month.earnings.filter(
                              (earning) => earning.title !== earnings.title,
                           ),
                        })),
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
            }
         },
         onCompleted: () => {
            toast.success('Bloco de ganhos excluído com sucesso!');
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
   }

   async function handleOnDeleteEarningItem(earningItemId: string) {
      await deleteEarningItem({
         variables: {
            data: {
               monthId: monthId,
               earningTitle: earnings.title,
               earningItemId,
            },
         },
         update: (cache) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingData) {
               const updatedData = {
                  ...existingData.user,
                  months: [
                     ...existingData.user.months.filter((month) => month.id !== monthId),
                     ...existingData.user.months
                        .filter((month) => month.id === monthId)
                        .map((month) => {
                           const expenses = month.earnings.flatMap((earning) => {
                              const extract = earning.extract.filter(
                                 (extract) => extract.id !== earningItemId,
                              );

                              return {
                                 ...earning,
                                 extract,
                              };
                           });

                           return {
                              ...month,
                              expenses,
                           };
                        }),
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
               setEarningsData((prev) => prev.filter((prev) => prev.id !== earningItemId));
            }
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
   }

   useEffect(() => {
      setEarningsData(earnings.extract);
   }, []);

   return earnings.title.length > 0 ? (
      <div className="mt-6 box-border w-full rounded-lg bg-slate-800 p-4">
         <div className="mb-5 flex items-center justify-between px-1">
            <h3 className="text-xl capitalize">{earnings.title}</h3>

            {earningsData.length > 0 && (
               <FormattedPrice
                  price={earningsData.reduce((a, b) => a + b.value, 0)}
                  style="profit"
                  classNames="text-xl"
               />
            )}
         </div>

         {earningsData.length > 0 && (
            <ul id="month-sub-items" className="flex max-h-96 flex-col items-center justify-center">
               {earningsData.map((earning) => (
                  <li
                     key={earning.id}
                     className="flex w-full items-center justify-between border-b px-1 py-4 text-sm text-gray-400"
                  >
                     {earning.name}

                     <div className="flex items-center gap-2">
                        <FormattedPrice price={earning.value} style="normal" classNames="text-sm" />

                        <InformationModal
                           button={{
                              icon: <Info size={16} className="text-blue-400" />,
                              title: 'Informações',
                           }}
                           modal={{
                              title: earning.name,
                              openAtTheBottom: true,
                           }}
                        >
                           <div>
                              <div>
                                 <span>Data de Publicação:</span>
                                 <span>
                                    {new Date(earning.date.published).toLocaleDateString('pt-BR', {
                                       day: '2-digit',
                                       month: 'long',
                                       year: 'numeric',
                                    })}
                                 </span>
                              </div>

                              {earning.link && (
                                 <div>
                                    <span>Link:</span>
                                    <Link href={earning.link} target="_blank">
                                       {earning.link}
                                    </Link>
                                 </div>
                              )}

                              {earning.notes && (
                                 <div>
                                    <span>Notas:</span>
                                    <span>{earning.notes}</span>
                                 </div>
                              )}
                           </div>
                        </InformationModal>

                        <InformationModal
                           button={{
                              icon: <Trash2 size={16} className="text-red-400" />,
                              title: 'Deletar ganho',
                           }}
                           modal={{
                              title: earning.name,
                              openAtTheBottom: true,
                           }}
                        >
                           <div className="flex flex-col items-center gap-4">
                              <p>Esse ganho será excluído para sempre</p>

                              <SubmitButton
                                 type="button"
                                 loading={deleteLoading}
                                 bgColor={{ color: 'bg-red-400', hover: 'bg-red-600' }}
                                 onClick={() => handleOnDeleteEarningItem(earning.id)}
                                 text="Deletar"
                              />
                           </div>
                        </InformationModal>
                     </div>
                  </li>
               ))}
            </ul>
         )}

         <div className="mt-6 flex w-full justify-end gap-2">
            <Dialog.Root open={shouldShowModal} onOpenChange={(open) => setShouldShowModal(open)}>
               <Dialog.Trigger type="button" className="rounded-lg border p-2">
                  {earningsData.length > 0 ? 'Adicionar mais +' : 'Adicione um ganho 🚀'}
               </Dialog.Trigger>

               <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 animate-overlayShow bg-black/30" />

                  <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-contentShow rounded-xl bg-slate-700 p-4 max-lg:w-[95%] lg:ml-11">
                     <div className="mb-4 flex w-full items-center lg:justify-center">
                        <Dialog.Title className="inline-block w-full text-center text-xl capitalize max-lg:pl-7">
                           {earnings.title}
                        </Dialog.Title>

                        <Dialog.DialogClose className="lg:hidden">
                           <X />
                        </Dialog.DialogClose>
                     </div>

                     <form className="flex flex-col gap-7" onSubmit={handleSubmit(handleOnSubmit)}>
                        <Input
                           labelProps={{
                              text: 'Nome:',
                              filled: watch('earningName')?.length > 0,
                              labelClasses: 'bg-slate-700',
                           }}
                           inputProps={{
                              id: 'earnings-name',
                              type: 'text',
                              required: true,
                              classNames: 'bg-slate-700',
                              register: { ...register('earningName') },
                           }}
                           error={{
                              show: !!errors.earningName,
                              message: errors.earningName?.message,
                           }}
                        />

                        <Input
                           labelProps={{
                              text: 'Valor:',
                              filled: watch('earningValue')?.toString().length > 0,
                              labelClasses: 'bg-slate-700',
                           }}
                           inputProps={{
                              id: 'earnings-value',
                              type: 'number',
                              required: true,
                              classNames: 'bg-slate-700',
                              register: { ...register('earningValue', { valueAsNumber: true }) },
                           }}
                           error={{
                              show: !!errors.earningValue,
                              message: errors.earningValue?.message,
                           }}
                        />

                        <div>
                           <span className="mb-4 inline-block text-sm">Informações Adicionais</span>

                           <div className="flex flex-col gap-7">
                              <Input
                                 labelProps={{
                                    text: 'Link:',
                                    filled: watch('earningLink')?.length > 0,
                                    labelClasses: 'bg-slate-700',
                                 }}
                                 inputProps={{
                                    id: 'earnings-value',
                                    type: 'text',
                                    classNames: 'bg-slate-700',
                                    register: { ...register('earningLink') },
                                 }}
                                 error={{
                                    show: !!errors.earningLink,
                                    message: errors.earningLink?.message,
                                 }}
                              />

                              <Input
                                 container={{
                                    classNames: 'h-full',
                                 }}
                                 labelProps={{
                                    text: 'Anotações:',
                                    filled: watch('earningNotes')?.length > 0,
                                    labelClasses: 'bg-slate-700',
                                 }}
                                 inputProps={{
                                    id: 'earnings-notes',
                                    type: 'textarea',
                                    classNames: 'bg-slate-700 pt-3 min-h-24 max-h-60',
                                    register: { ...register('earningNotes') },
                                 }}
                                 error={{
                                    show: !!errors.earningNotes,
                                    message: errors.earningNotes?.message,
                                 }}
                              />
                           </div>
                        </div>

                        <SubmitButton
                           type="submit"
                           loading={loading}
                           bgColor={{
                              color: 'bg-indigo-500',
                              hover: 'bg-indigo-700',
                           }}
                           text="Adicionar"
                        />
                     </form>
                  </Dialog.Content>
               </Dialog.Portal>
            </Dialog.Root>

            <InformationModal
               button={{
                  icon: <Trash2 size={20} />,
                  buttonClasses:
                     'w-[42px] flex p-0 items-center justify-center border border-white rounded-lg transition-all hover:bg-red-400 hover:border-red-400',
               }}
               modal={{
                  title: earnings.title,
                  openAtTheBottom: true,
               }}
            >
               <div className="flex flex-col items-center gap-4">
                  <p>Esse bloco será excluído para sempre</p>

                  <SubmitButton
                     type="button"
                     loading={deleteEarningLoading}
                     bgColor={{ color: 'bg-red-400', hover: 'bg-red-600' }}
                     onClick={handleOnDeleteBlock}
                     text="Deletar"
                  />
               </div>
            </InformationModal>
         </div>
      </div>
   ) : (
      <div>Nenhum ganho foi cadastrado no momento</div>
   );
}
