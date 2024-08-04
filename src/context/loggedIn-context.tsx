'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';

import { gql, useLazyQuery } from '@apollo/client';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export const GET_USER_BY_EMAIL = gql`
   query getUserByEmail($email: String!) {
      user(data: { email: $email }) {
         id
         name
         email
         economy {
            id
            extract {
               date
               value
            }
         }
         monthlySalary
         avatar {
            id
            url
         }
         months {
            id
            title
            createdAt
            date
            expenses {
               title
               extract {
                  id
                  name
                  value
                  date {
                     published
                     paidOut
                  }
                  link
                  notes
               }
            }
            earnings {
               title
               extract {
                  id
                  name
                  value
                  date {
                     published
                  }
                  link
                  notes
               }
            }
         }
      }
   }
`;

interface LoggedInContextProps {
   getUser: () => void;
   updateUser: (user: User) => void;
   user: User | null;
}

interface LoggedInProviderProps {
   children: ReactNode;
}

const LoggedInContext = createContext<LoggedInContextProps>({
   getUser: () => {},
   updateUser: () => {},
   user: null,
});

function LoggedInProvider({ children }: LoggedInProviderProps) {
   const  [getUserQuery]  = useLazyQuery(GET_USER_BY_EMAIL);
   const router = useRouter();

   const [user, setUser] = useState<User | null>(null);

   function getUser() {
      getUserQuery({
         variables: { email: '' },
         onError: (error) => {
            if (error.message === 'Unauthenticated') {
               router.push('/unauthenticated')
            }
            console.log(error)
         },
         onCompleted: (data) => {
            setUser(data.user);
         },
      })
   }

   function updateUser(user: User) {
      setUser(user);
   }

   useEffect(() => {
      if (!Cookies.get('isLoggedIn')) {
         router.push('/unauthenticated');
      }
   }, [])

   return (
         <LoggedInContext.Provider value={{
            getUser,
            updateUser,
            user,
         }}>
            {children}
         </LoggedInContext.Provider>
   );
}

export { LoggedInContext, LoggedInProvider };
