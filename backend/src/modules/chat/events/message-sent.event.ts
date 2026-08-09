export class MessageSentEvent {
  constructor(
    public readonly messageId: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly recipientId: string,
  ) {}
}
