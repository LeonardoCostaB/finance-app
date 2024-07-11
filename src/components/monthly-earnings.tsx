import { useEffect, useState } from "react";
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormattedPrice } from "./formatted-price";
import { Input } from "./input";
import { SubmitButton } from "./submit-button";
import { InformationModal } from "./information-modal";
import { Info, Link, Trash2 } from "lucide-react";

import { useLoggedIn } from "@/hooks/use-loggedIn";
import { CREATE_EARNING_ITEM, DELETE_EARNING_ITEM } from "@/graphql/front-end/querys";
import { GET_USER_BY_EMAIL } from "@/context/loggedIn-context";

interface MonthlyEarningsProps {
   monthId: string;
   earnings: Earnings;
}

const createNewEarningsFormSchema = z.object({
   earningName: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .transform(name => name[0].toUpperCase() + name.substring(1)),
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
                  ...data.createEarningItem.earnings as Months['earnings'],
               ]

               const updatedData = {
                  ...existingData.user,
                  months: [
                     ...existingData.user.months.filter((month) => month.id !== monthId),
                     ...existingData.user.months
                        .filter((month) => month.id === monthId)
                        .map(month => ({
                           ...month,
                           earnings: newEarningsItems,
                        })),
                  ]
               };

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: updatedData,
                  variables: { email: '' },
               });

               updateUser(updatedData);

               setEarningsData(
                  updatedData.months
                  .filter(month => month.id === monthId)[0].earnings
                  .filter(earning => earning.title === earnings.title)[0].extract
               )
            }
         },
         onError: (error) => {
            toast.error(error.message);
         }
      });
      reset();
      setShouldShowModal(false);
   }

   async function handleOnDeleteEarningItem(earningItemId: string) {
      await deleteEarningItem({
         variables: {
            data: {
               monthId: monthId,
               earningTitle: earnings.title,
               earningItemId,
            }
         },
         update: (cache) => {
            const existingData: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            })

            if (existingData) {
               const updatedData = {
                  ...existingData.user,
                  months: [
                     ...existingData.user.months.filter((month) => month.id !== monthId),
                     ...existingData.user.months
                        .filter((month) => month.id === monthId)[0].earnings
                        .filter(earning => earning.title === earnings.title)[0].extract
                        .filter(extract => extract.id !== earningItemId)
                  ]
               }

               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  data: updatedData,
                  variables: { email: '' },
               });

               setEarningsData(prev => prev.filter(prev => prev.id !== earningItemId));
            }
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
   }

   useEffect(() => {
      setEarningsData(earnings.extract);
   }, [])

   return earnings.title.length > 0 ? (
      <div className="w-1/2 p-4 mt-6 bg-slate-800 rounded-lg box-border">
         <div className="flex items-center justify-between mb-5 px-1">
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
            <ul id="month-sub-items" className="flex flex-col items-center justify-center max-h-96">
               {earningsData.map((earning) => (
                  <li
                     key={earning.id}
                     className="py-4 px-1 border-b w-full flex items-center justify-between text-sm text-gray-400"
                  >
                     {earning.name}

                     <div className="flex items-center gap-2">
                        <FormattedPrice price={earning.value} style="normal" classNames="text-sm" />

                        <InformationModal
                           button={{
                              icon: <Info size={16} className="text-blue-400" />,
                              title: 'Informações'
                           }}
                           modal={{
                              title: earning.name,
                           }}
                        >
                           <div>
                              <div>
                                 <span>Data de Publicação:</span>
                                 <span>
                                    {new Date(earning.date.published).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                 </span>
                              </div>

                              {earning.link && (
                                 <div>
                                    <span>Link:</span>
                                    <Link href={earning.link} target="_blank">{earning.link}</Link>
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
                              title: 'Deletar ganho'
                           }}
                           modal={{
                              title: 'Deletar ganho'
                           }}
                        >
                           <div>
                              <p>
                                 Ao deletar essa ganho ele será perdido para sempre
                              </p>

                              <SubmitButton
                                 type="button"
                                 loading={deleteLoading}
                                 bgColor={{ color: 'bg-red-400', hover: 'bg-red-600' }}
                                 onClick={() => handleOnDeleteEarningItem(earning.name)}
                              />
                           </div>
                        </InformationModal>
                     </div>
                  </li>
               ))}
            </ul>
         )}

         <div className="w-full flex justify-end mt-6">
            <Dialog.Root open={shouldShowModal} onOpenChange={(open) => setShouldShowModal(open)}>
               <Dialog.Trigger type="button" className="border p-2 rounded-lg">
                  {earningsData.length > 0 ? 'Adicionar mais +' : 'Adicione um ganho 🚀'}
               </Dialog.Trigger>

               <Dialog.Portal>
                  <Dialog.Overlay className="absolute inset-0 bg-black/30" />

                  <Dialog.Content className="max-w-md w-full p-4 ml-11 rounded-xl bg-slate-700 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
                     <Dialog.Title className="inline-block w-full mb-4 text-xl text-center">
                        Adicionar ganho
                     </Dialog.Title>

                     <form className="flex flex-col gap-7" onSubmit={handleSubmit(handleOnSubmit)}>
                        <Input
                           labelProps={{
                              text: 'Nome:',
                              filled: watch('earningName')?.length > 0,
                              labelClasses: 'bg-slate-700'
                           }}
                           inputProps={{
                              id: 'earnings-name',
                              type: 'text',
                              required: true,
                              classNames: 'bg-slate-700',
                              register: { ...register('earningName') }
                           }}
                           error={{
                              show:!!errors.earningName,
                              message: errors.earningName?.message,
                           }}
                        />

                        <Input
                           labelProps={{
                              text: 'Valor:',
                              filled: watch('earningValue')?.toString().length > 0,
                              labelClasses: 'bg-slate-700'
                           }}
                           inputProps={{
                              id: 'earnings-value',
                              type: 'number',
                              required: true,
                              classNames: 'bg-slate-700',
                              register: { ...register('earningValue', { valueAsNumber: true }) }
                           }}
                           error={{
                              show:!!errors.earningValue,
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
                                    labelClasses: 'bg-slate-700'
                                 }}
                                 inputProps={{
                                    id: 'earnings-value',
                                    type: 'text',
                                    classNames: 'bg-slate-700',
                                    register: { ...register('earningLink') }
                                 }}
                                 error={{
                                    show:!!errors.earningLink,
                                    message: errors.earningLink?.message,
                                 }}
                              />

                              <Input
                                 container={{
                                    classNames: 'h-full'
                                 }}
                                 labelProps={{
                                    text: 'Anotações:',
                                    filled: watch('earningNotes')?.length > 0,
                                    labelClasses: 'bg-slate-700'
                                 }}
                                 inputProps={{
                                    id: 'earnings-notes',
                                    type: 'textarea',
                                    classNames: 'bg-slate-700 pt-3 min-h-24 max-h-60',
                                    register: { ...register('earningNotes') }
                                 }}
                                 error={{
                                    show:!!errors.earningNotes,
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
                              hover: 'bg-indigo-700'
                           }}
                        />
                     </form>
                  </Dialog.Content>
               </Dialog.Portal>
            </Dialog.Root>
         </div>
      </div>
   ) : (
      <div>Nenhum ganho foi cadastrado no momento</div>
   )
}
