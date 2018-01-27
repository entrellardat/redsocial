export class Message{
    constructor(
        public _id : string ,
        public text : string , 
        public viewved : string ,
        public created_at : string ,
        public emitter : string ,
        public reciever : string        
    ){

    }
}