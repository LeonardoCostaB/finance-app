'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormTwoInputs } from '@/components/form-two-inputs';
import { FormattedPrice } from '@/components/formatted-price';
import { Header } from '@/components/header';
import { Input } from '@/components/input';
import {
   Building,
   Camera,
   Info,
   Loader,
   MapPin,
   Plus,
   /*SendHorizontal*/ User,
   X,
} from 'lucide-react';

import { useLoggedIn } from '@/hooks/use-loggedIn';
import { formatDate } from '@/utils/client/formatDate';
import { useMutation } from '@apollo/client';
import { UPDATE_USER } from '@/graphql/client/mutations/user';
import { toast } from 'sonner';
import { GET_USER_BY_EMAIL } from '@/context/loggedIn-context';

const updateUserFormSchema = z.object({
   name: z.string().min(3, 'Mínimo 3 caracteres'),
   areaOfActivity: z.string().default(''),
   monthlySalary: z.number().default(0),
   state: z.string().default(''),
   city: z.string().default(''),
});

type UpdateUserFormData = z.infer<typeof updateUserFormSchema>;

export default function MyAccount() {
   const { user, updateUser } = useLoggedIn();
   const [updateUserGQL, { loading }] = useMutation(UPDATE_USER);

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<UpdateUserFormData>({
      resolver: zodResolver(updateUserFormSchema),
      defaultValues: {
         name: user?.name ?? '',
         areaOfActivity: user?.profession ?? '',
         monthlySalary: user?.monthlySalary?.[0]?.salary ?? 0,
         state: user?.location?.state ?? '',
         city: user?.location?.city ?? '',
      },
   });

   const popoverMonthlySalary = useRef<HTMLDialogElement | null>(null);
   const userImgInput = useRef<HTMLInputElement | null>(null);

   const [shouldShowSalveButton, setShouldShowSalveButton] = useState(false);
   const [shouldShowAddNewPayment, setShouldShowAddNewPayment] = useState(false);
   // const [shouldShowAddNewBenefit, setShouldShowAddNewBenefit] = useState(false);
   const [file, setFile] = useState<string>('');

   function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
      const currFile = e.target?.files?.[0];

      if (currFile) {
         setFile(URL.createObjectURL(currFile));
      }
   }

   function handleOnUpdateUser(data: UpdateUserFormData) {
      if (data.city && !data.state) {
         toast.error('O estado é obrigatório quando a cidade é preenchida.');
         return;
      }

      if (data.state && !data.city) {
         toast.error('A cidade é obrigatório quando o estado é preenchido.');
         return;
      }

      updateUserGQL({
         variables: {
            userId: user?.id,
            data: {
               name: data.name,
               profession: data.areaOfActivity,
               monthlySalary: data.monthlySalary,
               location: {
                  state: data.state,
                  city: data.city,
               },
            },
         },
         onError: (error) => {
            toast.error(error.message);
         },
         onCompleted: () => {
            toast.success('Informações salvas com sucesso!');
            setShouldShowSalveButton(false);
         },
         update: (cache, { data }) => {
            const existingCache: { user: User } | null = cache.readQuery({
               query: GET_USER_BY_EMAIL,
               variables: { email: '' },
            });

            if (existingCache) {
               cache.writeQuery({
                  query: GET_USER_BY_EMAIL,
                  variables: { email: '' },
                  data: { user: data.updateUser },
               });

               updateUser(data.updateUser);
            }
         },
      });
   }

   if (!user) return <></>;

   return (
      <>
         <Header backToPage />

         <main className="mx-auto mb-10 max-w-3xl rounded-lg p-4 max-lg:mx-0 max-lg:mb-20 lg:bg-slate-800">
            <section className="flex w-full gap-4 max-sm:flex-col">
               <div className="relative h-[160px] w-[160px] overflow-hidden rounded-full ring-1 ring-blue-500 max-sm:h-[120px] max-sm:w-[120px]">
                  {user?.avatar?.url ? (
                     <Image
                        src={user?.avatar?.url ?? ''}
                        alt={`Foto de perfil de ${user?.name}`}
                        width={160}
                        height={160}
                        objectFit="fill"
                        className="h-full"
                     />
                  ) : (
                     <>
                        <input
                           ref={userImgInput}
                           type="file"
                           className="user-img-input"
                           onChange={handleFile}
                           accept="image/*"
                        />

                        <button
                           type="button"
                           className="group relative flex h-full w-full items-center justify-center"
                           onClick={() => userImgInput.current?.click()}
                        >
                           {file && (
                              <Image
                                 src={file}
                                 alt={`Foto de perfil de ${user?.name}`}
                                 width={160}
                                 height={160}
                                 objectFit="fill"
                                 className="h-full"
                              />
                           )}

                           <span
                              className={clsx('', {
                                 'absolute z-10 flex h-full w-full cursor-pointer items-center justify-center bg-blue-500/30 opacity-0 transition-all group-hover:opacity-100':
                                    file,
                              })}
                           >
                              <Camera size={30} />
                           </span>
                        </button>
                     </>
                  )}
               </div>

               <div className="flex flex-col gap-3 sm:mt-4">
                  <span className="flex items-center gap-2">
                     <User size={24} />
                     <span className="text-base">
                        {user?.name}{' '}
                        {user?.dateOfBirth
                           ? `, ${(new Date(user.dateOfBirth).getFullYear() - new Date().getFullYear()) * -1 - 1} anos`
                           : ''}
                     </span>
                  </span>

                  {user?.profession && (
                     <span className="flex items-center gap-2">
                        <Building size={24} />
                        <span className="text-base">{user.profession}</span>
                     </span>
                  )}

                  {user?.location?.city && (
                     <span className="flex items-center gap-2">
                        <MapPin size={24} />
                        <span className="text-base">
                           {user.location?.city}, {user.location?.state}, {user.location?.country}
                        </span>
                     </span>
                  )}

                  <div className="flex flex-1 items-end gap-4">
                     {user?.avatar?.url && (
                        <>
                           <button
                              type="button"
                              className="h-8 w-32 rounded-sm bg-blue-800 text-white transition-all hover:bg-blue-700"
                           >
                              Alterar avatar
                           </button>
                           <button
                              type="button"
                              className="h-8 w-32 rounded-sm bg-red-800 text-white transition-all hover:bg-red-700"
                           >
                              Deletar Avatar
                           </button>
                        </>
                     )}
                  </div>
               </div>
            </section>

            <section className="mt-6">
               <span className="mb-6 flex items-center justify-between gap-1">
                  <h2 className="text-base font-medium text-white">Informações Pessoais:</h2>

                  <button
                     type="button"
                     className="text-xs font-light underline underline-offset-2"
                     onClick={() => setShouldShowSalveButton(!shouldShowSalveButton)}
                  >
                     {shouldShowSalveButton ? 'Cancelar' : 'Editar'}
                  </button>
               </span>

               <form onSubmit={handleSubmit(handleOnUpdateUser)}>
                  <div className="flex items-center gap-3 max-sm:flex-col max-sm:gap-6">
                     <Input
                        container={{
                           classNames: `${shouldShowSalveButton ? 'border-slate-400' : 'border-slate-700'}`,
                        }}
                        labelProps={{
                           text: 'Nome:',
                           filled: true,
                           labelClasses: `bg-slate-900 lg:bg-slate-800 ${shouldShowSalveButton ? '' : 'opacity-70 z-10'}`,
                        }}
                        inputProps={{
                           id: 'name',
                           type: 'text',
                           classNames:
                              'bg-slate-900 lg:bg-slate-800 disabled:opacity-70 disabled:cursor-no-drop',
                           register: {
                              ...register('name'),
                              disabled: shouldShowSalveButton ? false : true,
                              readOnly: shouldShowSalveButton ? false : true,
                           },
                        }}
                        error={{
                           show: !!errors.name,
                           message: errors.name?.message,
                        }}
                     />

                     <Input
                        container={{
                           classNames: 'border-slate-700',
                        }}
                        labelProps={{
                           text: 'Email:',
                           filled: true,
                           labelClasses: 'bg-slate-900 lg:bg-slate-800 opacity-70 z-10',
                        }}
                        inputProps={{
                           id: 'email',
                           type: 'text',
                           classNames:
                              'bg-slate-900 lg:bg-slate-800 disabled:opacity-70 disabled:cursor-no-drop',
                           register: {
                              value: user.email,
                              disabled: true,
                              readOnly: true,
                           },
                        }}
                     />
                  </div>

                  <div className="my-8 flex items-center gap-3 max-sm:my-6 max-sm:flex-col max-sm:gap-6">
                     <Input
                        container={{
                           classNames: `${shouldShowSalveButton ? 'border-slate-400' : 'border-slate-700'}`,
                        }}
                        labelProps={{
                           text: 'Área de atuação:',
                           filled: true,
                           labelClasses: `bg-slate-900 lg:bg-slate-800 ${shouldShowSalveButton ? '' : 'opacity-70 z-10'}`,
                        }}
                        inputProps={{
                           id: 'areaOfActivity',
                           type: 'text',
                           classNames:
                              'bg-slate-900 lg:bg-slate-800 disabled:opacity-70 disabled:cursor-no-drop',
                           register: {
                              ...register('areaOfActivity'),
                              disabled: shouldShowSalveButton ? false : true,
                              readOnly: shouldShowSalveButton ? false : true,
                           },
                        }}
                        error={{
                           show: !!errors.areaOfActivity,
                           message: errors.areaOfActivity?.message,
                        }}
                     />

                     <div className="relative w-full">
                        <Input
                           container={{
                              classNames: `${shouldShowSalveButton ? 'border-slate-400' : 'border-slate-700'}`,
                           }}
                           labelProps={{
                              text: 'Salário atual:',
                              filled: true,
                              labelClasses: `bg-slate-900 lg:bg-slate-800 ${shouldShowSalveButton ? '' : 'opacity-70 z-10'}`,
                           }}
                           inputProps={{
                              id: 'monthlySalary',
                              type: 'text',
                              classNames:
                                 'bg-slate-900 lg:bg-slate-800 disabled:opacity-70 disabled:cursor-no-drop',
                              register: {
                                 ...register('monthlySalary', { valueAsNumber: true }),
                                 disabled: shouldShowSalveButton ? false : true,
                                 readOnly: shouldShowSalveButton ? false : true,
                              },
                           }}
                           error={{
                              show: !!errors.monthlySalary,
                              message: errors.monthlySalary?.message,
                           }}
                        />

                        <button
                           type="button"
                           className="absolute right-4 top-1/2 -translate-y-1/2"
                           onClick={() =>
                              popoverMonthlySalary.current?.open
                                 ? popoverMonthlySalary.current.close()
                                 : popoverMonthlySalary.current?.show()
                           }
                        >
                           <Info size={16} />
                        </button>

                        <dialog
                           ref={popoverMonthlySalary}
                           className="monthly-salary-info z-20 mt-4 flex w-full flex-col gap-3 rounded-md bg-slate-800 px-4 py-2 lg:bg-slate-700"
                        >
                           <h5 className="text-sm text-white">Meus salários</h5>

                           <button
                              type="button"
                              className="absolute right-4 top-[10px]"
                              onClick={() => popoverMonthlySalary.current?.close()}
                           >
                              <X size={16} color="#fff" />
                           </button>

                           {user.monthlySalary?.length > 0 ? (
                              user.monthlySalary.map((month) => (
                                 <div key={month.id} className="flex items-center justify-between">
                                    <FormattedPrice
                                       price={month.salary}
                                       style="normal"
                                       classNames="text-black"
                                    />
                                    <span className="text-xs text-white">
                                       {formatDate(month.createAt)}
                                    </span>
                                 </div>
                              ))
                           ) : (
                              <p className="text-xs text-white">
                                 Aqui ficaram todos os registros de seu salário, além disso, nos
                                 registros mensais o seu salário irá contabilizar de forma
                                 automática
                              </p>
                           )}
                        </dialog>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 max-sm:flex-col max-sm:gap-6">
                     <Input
                        container={{
                           classNames: `${shouldShowSalveButton ? 'border-slate-400' : 'border-slate-700'}`,
                        }}
                        labelProps={{
                           text: 'Cidade:',
                           filled: true,
                           labelClasses: `bg-slate-900 lg:bg-slate-800 ${shouldShowSalveButton ? '' : 'opacity-70 z-10'}`,
                        }}
                        inputProps={{
                           id: 'city',
                           type: 'text',
                           classNames:
                              'bg-slate-900 lg:bg-slate-800 disabled:opacity-70 disabled:cursor-no-drop',
                           register: {
                              ...register('city'),
                              disabled: shouldShowSalveButton ? false : true,
                              readOnly: shouldShowSalveButton ? false : true,
                           },
                        }}
                        error={{
                           show: !!errors.city,
                           message: errors.city?.message,
                        }}
                     />

                     <Input
                        container={{
                           classNames: `${shouldShowSalveButton ? 'border-slate-400' : 'border-slate-700'}`,
                        }}
                        labelProps={{
                           text: 'Estado:',
                           filled: true,
                           labelClasses: `bg-slate-900 lg:bg-slate-800 ${shouldShowSalveButton ? '' : 'opacity-70 z-10'}`,
                        }}
                        inputProps={{
                           id: 'state',
                           type: 'text',
                           classNames:
                              'bg-slate-900 lg:bg-slate-800 disabled:opacity-70 disabled:cursor-no-drop',
                           register: {
                              ...register('state'),
                              disabled: shouldShowSalveButton ? false : true,
                              readOnly: shouldShowSalveButton ? false : true,
                           },
                        }}
                        error={{
                           show: !!errors.state,
                           message: errors.state?.message,
                        }}
                     />
                  </div>

                  <div className="flex lg:justify-center">
                     <button
                        type="submit"
                        className={clsx(
                           'flex w-full items-center justify-center rounded-xl transition-all disabled:cursor-no-drop disabled:opacity-50 lg:w-1/2',
                           {
                              'mt-6 h-10 bg-blue-500 opacity-100': shouldShowSalveButton,
                              'h-0 bg-transparent opacity-0': !shouldShowSalveButton,
                           },
                        )}
                        disabled={loading}
                     >
                        {loading ? <Loader className="animate-spin" /> : 'Salvar'}
                     </button>
                  </div>
               </form>
            </section>

            <section>
               <div className="relative mb-4 mt-6 flex flex-col">
                  <span className="mb-6 flex items-center justify-between gap-1">
                     <h2 className="text-base font-medium text-white">
                        {user && user.commonPayment?.length > 0
                           ? 'Pagamentos comuns:'
                           : 'Adicione um pagamento comum'}
                     </h2>

                     {user && user.commonPayment?.length > 0 && (
                        <button
                           type="button"
                           className="text-xs font-light underline underline-offset-2"
                           onClick={() => setShouldShowAddNewPayment(!shouldShowAddNewPayment)}
                        >
                           {shouldShowAddNewPayment ? <X size={18} /> : <Plus size={18} />}
                        </button>
                     )}
                  </span>

                  <FormTwoInputs
                     newInput={{
                        isVisible: user.commonPayment?.length > 0,
                        toggleOpen: shouldShowAddNewPayment,
                     }}
                     inputs={{
                        firstInput: {
                           name: 'Nome:',
                           id: 'new-common-payment-name',
                        },
                        secondInput: {
                           name: 'Valor:',
                           id: 'new-common-payment-value',
                           type: 'number',
                        },
                     }}
                  />

                  {user?.commonPayment?.map((payment) => (
                     <FormTwoInputs
                        key={payment.id}
                        inputs={{
                           firstInput: {
                              name: 'Nome:',
                              id: `common-payment-name-${payment.name}`,
                              value: payment.name,
                           },
                           secondInput: {
                              name: 'Valor:',
                              id: `common-payment-value-${payment.name}`,
                              type: 'number',
                              value: payment.value,
                           },
                        }}
                     />
                  ))}
               </div>
            </section>

            {/* <section>
               <div className="relative my-8 flex flex-col">
                  <span className="mb-6 flex items-center justify-between gap-1">
                     <h2 className="text-base font-medium text-white">
                        {user && user.benefits?.length > 0
                           ? 'Benefícios:'
                           : 'Adicione seu primeiro benefício'}
                     </h2>

                     {user && user.benefits?.length > 0 && (
                        <button
                           type="button"
                           className="text-xs font-light underline underline-offset-2"
                           onClick={() => setShouldShowAddNewBenefit(!shouldShowAddNewBenefit)}
                        >
                           {shouldShowAddNewBenefit ? <X size={18} /> : <Plus size={18} />}
                        </button>
                     )}
                  </span>

                  <div
                     className={clsx(
                        'relative flex w-full items-stretch transition-all last:mb-0',
                        {
                           'invisible max-h-0 opacity-0':
                              !shouldShowAddNewBenefit && user.benefits.length > 0,
                           'visible mb-8 max-h-20 opacity-100': shouldShowAddNewBenefit,
                        },
                     )}
                  >
                     <Input
                        container={{
                           classNames: 'border-slate-600',
                        }}
                        labelProps={{
                           text: 'Nome:',
                           filled: true,
                           labelClasses: 'bg-slate-900 lg:bg-slate-800',
                        }}
                        inputProps={{
                           id: 'mockup-block-name',
                           type: 'text',
                           classNames: 'bg-slate-900 lg:bg-slate-800 disabled:cursor-no-drop',
                        }}
                        // error={{
                        //    show: !!errors.updateName,
                        //    message: errors.updateName?.message,
                        // }}
                     />

                     <Input
                        container={{
                           classNames: 'border-slate-600 !w-[calc(100%-80px)] ml-3 mr-1',
                        }}
                        labelProps={{
                           text: 'Valor:',
                           filled: true,
                           labelClasses: 'bg-slate-900 lg:bg-slate-800',
                        }}
                        inputProps={{
                           id: 'mockup-block-name',
                           type: 'text',
                           classNames: 'bg-slate-900 lg:bg-slate-800 disabled:cursor-no-drop',
                        }}
                        // error={{
                        //    show: !!errors.updateName,
                        //    message: errors.updateName?.message,
                        // }}
                     />

                     <button type="button" className="w-10 rounded-lg border border-slate-600 p-2">
                        <SendHorizontal size={18} />
                     </button>
                  </div>

                  {user &&
                     user.benefits?.length > 0 &&
                     user.benefits?.map((benefit) => (
                        <div
                           key={benefit.name}
                           className="mb-8 flex w-full items-stretch last:mb-0"
                        >
                           <Input
                              container={{
                                 classNames: 'border-slate-600',
                              }}
                              labelProps={{
                                 text: 'Nome:',
                                 filled: true,
                                 labelClasses: 'bg-slate-900 lg:bg-slate-800',
                              }}
                              inputProps={{
                                 id: 'mockup-block-name',
                                 type: 'text',
                                 classNames: 'bg-slate-900 lg:bg-slate-800 disabled:cursor-no-drop',
                                 register: { value: benefit.name },
                              }}
                              // error={{
                              //    show: !!errors.updateName,
                              //    message: errors.updateName?.message,
                              // }}
                           />

                           <Input
                              container={{
                                 classNames: 'border-slate-600 !w-[calc(100%-80px)] ml-3 mr-1',
                              }}
                              labelProps={{
                                 text: 'Valor:',
                                 filled: true,
                                 labelClasses: 'bg-slate-900 lg:bg-slate-800',
                              }}
                              inputProps={{
                                 id: 'mockup-block-name',
                                 type: 'text',
                                 classNames: 'bg-slate-900 lg:bg-slate-800 disabled:cursor-no-drop',
                                 register: { value: benefit.value },
                              }}
                              // error={{
                              //    show: !!errors.updateName,
                              //    message: errors.updateName?.message,
                              // }}
                           />

                           <button
                              type="button"
                              className="w-10 rounded-lg border border-slate-600 p-2"
                           >
                              <SendHorizontal size={18} />
                           </button>
                        </div>
                     ))}
               </div>
            </section> */}
         </main>
      </>
   );
}
