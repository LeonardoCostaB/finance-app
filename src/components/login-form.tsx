'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { gql, useMutation } from '@apollo/client';

import Link from 'next/link';
import { Input } from './input';
import { PasswordInput } from './password-input';
import { Loader2Icon } from 'lucide-react';

const LOGIN = gql`
   mutation Login($email: String!, $password: String!) {
      login(data: { email: $email, password: $password }) {
         token
      }
   }
`;

const userLoginFormSchema = z.object({
   email: z.string().email('Email inválido').nonempty('Email é obrigatório'),
   password: z.string().nonempty('Senha é obrigatório'),
});

type UserLoginFormData = z.infer<typeof userLoginFormSchema>;

export function LoginForm() {
   const [login, { loading }] = useMutation(LOGIN);

   const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
   } = useForm<UserLoginFormData>({
      resolver: zodResolver(userLoginFormSchema),
   });

   function handleLogin({ email, password }: UserLoginFormData) {
      login({
         variables: {
            email,
            password,
         },
         onError: (error) => {
            toast.error(error.message);
         },
         onCompleted: (data) => {
            if (data?.login.token) {
               window.location.reload();
            }
         },
      });
   }

   return (
      <>
         <form
            onSubmit={handleSubmit(handleLogin)}
            className="mx-auto my-0 flex w-full flex-col gap-8 max-md:px-4 sm:max-w-sm"
         >
            <Input
               container={{
                  classNames: 'h-12',
               }}
               labelProps={{
                  text: 'Email:',
                  labelClasses: 'top-3',
                  filled: watch('email')?.length > 0,
               }}
               inputProps={{
                  type: 'email',
                  register: { ...register('email') },
                  id: 'email',
               }}
               error={{
                  show: !!errors.email,
                  message: errors.email?.message,
               }}
            />

            <PasswordInput
               container={{
                  classNames: 'h-12',
               }}
               labelProps={{
                  text: 'Senha:',
                  labelClasses: 'top-3',
                  filled: watch('password')?.length > 0,
               }}
               inputProps={{
                  type: 'password',
                  id: 'password',
                  register: { ...register('password') },
               }}
               error={{
                  show: !!errors.password,
                  message: errors.password?.message,
               }}
            />

            <button
               type="submit"
               className="flex h-10 w-full items-center justify-center rounded-lg bg-indigo-500 py-2 text-white transition-all duration-300 ease-out hover:bg-indigo-700 disabled:cursor-no-drop disabled:opacity-50"
               disabled={loading}
            >
               {loading ? <Loader2Icon size={24} className="animate-spin" /> : 'Entrar'}
            </button>
         </form>

         <Link href="/login/create-user" className="text-sm">
            Novo por aqui?{' '}
            <span className="text-blue-400 transition-colors hover:text-blue-500">
               cadastre-se e adquira suas credencias
            </span>
         </Link>
      </>
   );
}
