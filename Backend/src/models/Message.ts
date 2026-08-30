import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import type { UserRole } from "./User.js";

export interface IMessage {
  ticket: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: UserRole;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = HydratedDocument<IMessage>;

const messageSchema = new Schema<IMessage>(
  {
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["customer", "agent"], required: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true },
);

const Message = model<IMessage>("Message", messageSchema);

export default Message;
