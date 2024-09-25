'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';

import { gql, useLazyQuery } from '@apollo/client';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { sortMonth } from '@/utils/client/sort-month';

export const GET_USER_BY_EMAIL = gql`
   query getUserByEmail($email: String!) {
      user(data: { email: $email }) {
         id
         name
         email
         profession
         dateOfBirth
         location {
            city
            state
            country
         }
         owner
         economy {
            id
            extract {
               date
               value
            }
         }
         monthlySalary {
            id
            salary
            createAt
         }
         avatar {
            id
            url
         }
         commonPayment {
            id
            name
            value
            date {
               published
            }
         }
         benefits {
            id
            name
            value
         }
         months {
            id
            title
            createdAt
            date
            expenses {
               title
               created
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
               created
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
   const [getUserQuery] = useLazyQuery(GET_USER_BY_EMAIL);
   const router = useRouter();

   const [user, setUser] = useState<User | null>(null);

   function getUser() {
      getUserQuery({
         variables: { email: '' },
         onError: (error) => {
            if (error.message === 'Unauthenticated') {
               router.push('/unauthenticated');
            }
            console.log(error);
         },
         onCompleted: (data) => {
            setUser({
               ...data.user,
               months: sortMonth([...data.user.months]),
            });
         },
         notifyOnNetworkStatusChange: true,
      });
   }

   function updateUser(user: User) {
      setUser({
         ...user,
         months: sortMonth([...user.months]),
      });
   }

   useEffect(() => {
      if (!Cookies.get('isLoggedIn')) {
         router.push('/unauthenticated');
      }
   }, []);

   return (
      <LoggedInContext.Provider
         value={{
            getUser,
            updateUser,
            user,
         }}
      >
         {children}
      </LoggedInContext.Provider>
   );
}

export { LoggedInContext, LoggedInProvider };
