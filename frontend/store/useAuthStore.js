import {create} from 'zustand'

export const useAuthStore = create((set) => ({
   authUser:{name:"john",_id:123,age:25} ,
   isLoading:false,
   isLoggedIn:false,

   login:()=>{
    set({isLoggedIn:true,isLoading:true});
   },
}))