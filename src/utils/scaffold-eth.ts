// src/utils/scaffold-eth.ts
interface ToastArgs {
    title: string;
    description: string;
  }
  
  export const toast = ({ title, description }: ToastArgs): void => {
    // You can replace this with your preferred toast library
    console.log(`${title}: ${description}`);
  };