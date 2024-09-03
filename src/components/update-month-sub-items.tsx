import Link from 'next/link';
import { InformationModal } from './information-modal';

import { Clock, Handshake, Info, LinkIcon, NotebookPen, SquarePen, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from './input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SubmitButton } from './submit-button';
import { useMutation } from '@apollo/client';
import { UPDATE_EARNING_OR_EXPENSE_ITEM } from '@/graphql/client/mutations/month';
import { toast } from 'sonner';
import { GET_USER_BY_EMAIL } from '@/context/loggedIn-context';
import { useLoggedIn } from '@/hooks/use-loggedIn';

interface UpdateMonthSubItems {
   monthId: string;
   extract: MonthExtract;
   blockTitle: string;
   type: 'earnings' | 'expenses';
}

const createNewExpenseFormSchema = z.object({
   updateName: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .transform((name) => name[0].toUpperCase() + name.substring(1)),
   updateValue: z.number().min(1, 'Mínimo R$ 1'),
   updateLink: z.union([z.literal(''), z.string()]),
   updateNotes: z.union([z.literal(''), z.string().min(5, 'Mínimo de 5 caracteres')]),
});

type CreateNewExpenseFormData = z.infer<typeof createNewExpenseFormSchema>;

export function UpdateMonthSubItems({ monthId, extract, blockTitle, type }: UpdateMonthSubItems) {
   const { updateUser } = useLoggedIn();
   const [updateEarningOrExpenseItem, { loading }] = useMutation(UPDATE_EARNING_OR_EXPENSE_ITEM);

   const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
   } = useForm<CreateNewExpenseFormData>({
      resolver: zodResolver(createNewExpenseFormSchema),
      defaultValues: {
         updateName: extract.name,
         updateValue: extract.value,
         updateLink: extract.link ?? '',
         updateNotes: extract.notes ?? '',
      },
   });

   const [shouldShowEditForm, setShouldShowEditForm] = useState(false);

   async function handleOnUpdateItem(data: CreateNewExpenseFormData) {
      const fieldsToCheck: Array<{
         data: keyof CreateNewExpenseFormData;
         extract: keyof MonthExtract;
      }> = [
         {
            data: 'updateName',
            extract: 'name',
         },
         {
            data: 'updateValue',
            extract: 'value',
         },
         {
            data: 'updateLink',
            extract: 'link',
         },
         {
            data: 'updateValue',
            extract: 'value',
         },
      ];

      const hasChanges = fieldsToCheck.some((field) => data[field.data] !== extract[field.extract]);

      if (hasChanges) {
         await updateEarningOrExpenseItem({
            variables: {
               monthId,
               data: {
                  title: blockTitle,
                  id: extract.id,
                  name: data.updateName,
                  value: data.updateValue,
                  link: data.updateLink,
                  notes: data.updateNotes,
               },
               type,
            },
            onError: (error) => {
               toast.error(error.message);
            },
            onCompleted: () => {
               setShouldShowEditForm(false);
               toast.success('Seu item foi atualizado com sucesso!');
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
                        ...existingData.user.months.filter(
                           (month) => month.id !== data.updateEarningItem.id,
                        ),
                        ...existingData.user.months
                           .filter((month) => month.id === data.updateEarningItem.id)
                           .map((month) => {
                              return {
                                 ...month,
                                 [type]: data.updateEarningItem[type],
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
               }
            },
         });
      } else {
         toast.info('Altere algum valor para continuar');
      }
   }

   useEffect(() => {}, [extract]);

   return (
      <InformationModal
         button={{
            icon: <Info size={16} className="text-blue-400" />,
            title: 'Informações',
         }}
         modal={{
            title: shouldShowEditForm ? 'Editar informações' : extract.name,
            openAtTheBottom: true,
            classNames: 'lg:!max-w-fit max-lg:max-w-full',
            closeButtonClasses: shouldShowEditForm ? 'hidden' : '',
         }}
      >
         <div className={`flex flex-col gap-4 ${shouldShowEditForm ? 'mt-5' : ''}`}>
            <button
               className={`absolute right-4 top-[21px] ${shouldShowEditForm ? '' : 'max-lg:right-12'}`}
               onClick={() => setShouldShowEditForm(!shouldShowEditForm)}
            >
               {shouldShowEditForm ? <X size={18} /> : <SquarePen size={18} />}
            </button>

            {shouldShowEditForm ? (
               <form
                  className="flex flex-col gap-5 lg:w-[288px]"
                  onSubmit={handleSubmit(handleOnUpdateItem)}
               >
                  <div className="flex items-center gap-2">
                     <Input
                        labelProps={{
                           text: 'Bloco:',
                           filled: true,
                           labelClasses: 'bg-slate-700',
                        }}
                        inputProps={{
                           id: 'mockup-block-name',
                           type: 'text',
                           classNames: 'bg-slate-700 disabled:cursor-no-drop',
                           register: { value: blockTitle, disabled: true },
                        }}
                        error={{
                           show: !!errors.updateName,
                           message: errors.updateName?.message,
                        }}
                     />

                     <Input
                        labelProps={{
                           text: 'Referência:',
                           filled: true,
                           labelClasses: 'bg-slate-700',
                        }}
                        inputProps={{
                           id: 'mockup-block-name',
                           type: 'text',
                           classNames: 'bg-slate-700 disabled:cursor-no-drop',
                           register: { value: extract.name, disabled: true },
                        }}
                        error={{
                           show: !!errors.updateName,
                           message: errors.updateName?.message,
                        }}
                     />
                  </div>

                  <hr />

                  <Input
                     labelProps={{
                        text: 'Nome:',
                        filled: watch('updateName')?.toString().length > 0,
                        labelClasses: 'bg-slate-700',
                     }}
                     inputProps={{
                        id: 'update-name',
                        type: 'text',
                        classNames: 'bg-slate-700',
                        register: { ...register('updateName') },
                     }}
                     error={{
                        show: !!errors.updateName,
                        message: errors.updateName?.message,
                     }}
                  />

                  <Input
                     labelProps={{
                        text: 'Valor:',
                        filled: watch('updateValue')?.toString().length > 0,
                        labelClasses: 'bg-slate-700',
                     }}
                     inputProps={{
                        id: 'update-value',
                        type: 'number',
                        classNames: 'bg-slate-700',
                        register: { ...register('updateValue', { valueAsNumber: true }) },
                     }}
                     error={{
                        show: !!errors.updateValue,
                        message: errors.updateValue?.message,
                     }}
                  />

                  <Input
                     labelProps={{
                        text: 'Link:',
                        filled: watch('updateLink')?.toString().length > 0,
                        labelClasses: 'bg-slate-700',
                     }}
                     inputProps={{
                        id: 'update-link',
                        type: 'text',
                        classNames: 'bg-slate-700',
                        register: { ...register('updateLink') },
                     }}
                     error={{
                        show: !!errors.updateLink,
                        message: errors.updateLink?.message,
                     }}
                  />

                  <Input
                     labelProps={{
                        text: 'Nota:',
                        filled: watch('updateNotes')?.toString().length > 0,
                        labelClasses: 'bg-slate-700',
                     }}
                     inputProps={{
                        id: 'update-notes',
                        type: 'text',
                        classNames: 'bg-slate-700',
                        register: { ...register('updateNotes') },
                     }}
                     error={{
                        show: !!errors.updateNotes,
                        message: errors.updateNotes?.message,
                     }}
                  />

                  <SubmitButton
                     bgColor={{
                        color: 'bg-blue-500',
                        hover: 'bg-blue-700',
                     }}
                     loading={loading}
                     text="Atualizar"
                  />
               </form>
            ) : (
               <>
                  <div className="flex items-center gap-1">
                     <Clock size={18} />
                     <span className="text-sm">Publicado em:</span>
                     <span className="font-medium">
                        {new Date(extract.date.published).toLocaleDateString('pt-BR', {
                           day: '2-digit',
                           month: 'long',
                           year: 'numeric',
                        })}
                     </span>
                  </div>

                  {type === 'expenses' && extract?.date.paidOut && (
                     <div className="flex items-center gap-1">
                        <Handshake size={18} />
                        <span className="text-sm">Pago em:</span>
                        <span className="font-medium">
                           {new Date(extract.date.paidOut).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                           })}
                        </span>
                     </div>
                  )}

                  {extract.link && (
                     <div className="flex items-center gap-1">
                        <LinkIcon size={18} />
                        <span className="text-sm">Link:</span>
                        <Link
                           href={extract.link}
                           target="_blank"
                           className="font-medium text-blue-400 transition-all hover:text-blue-500"
                        >
                           {extract.link}
                        </Link>
                     </div>
                  )}

                  {extract.notes && (
                     <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                           <NotebookPen size={18} />
                           <span className="text-sm">Notas:</span>
                        </div>
                        <p className="w-full rounded-lg bg-slate-600 px-4 py-2">{extract.notes}</p>
                     </div>
                  )}
               </>
            )}
         </div>
      </InformationModal>
   );
}
