import { useContext } from 'react';
import { LoggedInContext } from '@/context/loggedIn-context';

export const useLoggedIn = () => useContext(LoggedInContext);
