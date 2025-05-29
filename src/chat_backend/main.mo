import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

actor {

  type Message = {
    from : Principal;
    to : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  var messages : [Message] = [];

  // Envia uma mensagem de um usuário para outro
  public shared (msgCaller) func sendMessage(to : Principal, text : Text) : async () {
    let newMessage : Message = {
      from = msgCaller.caller;
      to = to;
      text = text;
      timestamp = Time.now();
    };

    messages := Array.append<Message>(messages, [newMessage]);
  };

  // Obtém todas as mensagens entre o chamador e outro usuário
  public shared query (msgCaller) func getMessages(otherUser : Principal) : async [Message] {
    let self = msgCaller.caller;
    return Array.filter<Message>(
      messages,
      func(m : Message) : Bool {
        (m.from == self and m.to == otherUser) or (m.from == otherUser and m.to == self);
      },
    );
  };

};
