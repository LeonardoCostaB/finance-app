interface MonthExtract {
   id: string;
   name: string;
   value: number;
   date: {
      published: string;
      paidOut?: string;
   };
   link?: string;
   notes?: string;
}

interface Earnings {
   title: string;
   created: string;
   extract: Array<MonthExtract>;
}

interface Expenses {
   title: string;
   created: string;
   extract: Array<MonthExtract>;
}

interface Months {
   id: string;
   title: string;
   createdAt: string;
   date: string;
   user?: {
      id;
   };
   expenses: Array<Expenses>;
   earnings: Array<Earnings>;
}

interface CommonPaymentsAndBenefits {
   id: string;
   name: string;
   value: number;
   date: {
      published: string;
   };
}

interface User {
   id: string;
   avatar: {
      id: string;
      url: string;
   };
   email: string;
   name: string;
   economy: {
      id: string;
      extract: Array<{
         date: string;
         value: number;
      }>;
   };
   commonPayment: Array<CommonPaymentsAndBenefits>;
   benefits: Array<CommonPaymentsAndBenefits>;
   monthlySalary: number;
   months: Array<Months>;
}
