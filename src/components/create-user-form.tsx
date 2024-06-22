'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import { Input } from './input';
import { PasswordInput } from './password-input';

const createUserFormSchema = z.object({
   name: z.string().min(3, 'Mínimo 3 caracteres'),
   email: z
      .string()
      .email('Email inválido')
      .nonempty('Email é obrigatório')
      .toLowerCase(),
   password: z
      .string()
      .min(8, 'A senha precisa ter no mínimo 8 caracteres')
      .nonempty('Senha é obrigatório')
      .regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/, 'Formato inválido'),
   confirmPassword: z
      .string()
      .min(6, 'A senha precisa ter no mínimo 6 caracteres')
      .nonempty('Senha é obrigatório'),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export function CreateUserForm() {
   const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
   } = useForm<CreateUserFormData>({
      resolver: zodResolver(createUserFormSchema),
   });

   async function createUser({ email, password }: CreateUserFormData) {
      console.log({ email, password });
   }

   const errorMessageShow =
      watch('confirmPassword')?.length &&
      watch('password') !== watch('confirmPassword');

   return (
      <form
         onSubmit={handleSubmit(createUser)}
         className="mx-auto my-0 flex w-full max-w-lg flex-col gap-7"
      >
         <Input
            container={{
               classNames: 'h-12'
            }}
            labelProps={{ text: 'Nome Completo:', labelClasses: 'top-3', filled: watch('name')?.length > 0 }}
            inputProps={{
               type: 'text',
               register: { ...register('name') },
               id: 'user-name'
            }}
            error={{
               show: !!errors.email,
               message: errors.email?.message,
            }}
         />

         <Input
            container={{
               classNames: 'h-12'
            }}
            labelProps={{ text: 'Email:', labelClasses: 'top-3', filled: watch('email')?.length > 0 }}
            inputProps={{
               type: 'email',
               register: { ...register('email') },
               id: 'create-user-email'
            }}
            error={{
               show: !!errors.email,
               message: errors.email?.message,
            }}
         />

         <PasswordInput
            container={{
               classNames: 'h-12'
            }}
            labelProps={{ text: 'Senha:', labelClasses: 'top-3', filled: watch('password')?.length > 0 }}
            inputProps={{
               type: 'password',
               register: { ...register('password') },
               id: 'create-user-pass'
            }}
            error={{
               show: !!errors.password,
               message: errors.password?.message,
            }}
            tutorial
         />

         <PasswordInput
            container={{
               classNames: 'h-12'
            }}
            labelProps={{ text: 'Confirmar senha:', labelClasses: 'top-3', filled: watch('confirmPassword')?.length > 0 }}
            inputProps={{
               type: 'password',
               register: { ...register('confirmPassword') },
               id: 'confirm-password'
            }}
            error={{
               show: !!errors.confirmPassword || !!errorMessageShow,
               message: errorMessageShow
                  ? 'Senha não coincidem'
                  : errors.confirmPassword?.message,
            }}
         />

         <strong className="mx-auto flex max-w-lg items-center gap-2 rounded-lg bg-red-600 p-2 text-[10px] leading-relaxed">
            <AlertCircle size={24} />
            Lembre-se: Para poder utilizar a plataforma, o proprietário deverá
            conceder permissão, este é apenas o primeiro passo.
         </strong>

         <button
            type="submit"
            className="w-full rounded-lg bg-indigo-500 py-2 text-white transition-all duration-300 ease-out hover:bg-indigo-700"
         >
            Cadastrar
         </button>
      </form>
   );
}
