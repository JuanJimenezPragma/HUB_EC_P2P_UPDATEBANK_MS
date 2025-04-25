import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { SqsSendMessage } from "../../../../src/utils/sqsClient";

jest.mock("@aws-sdk/client-sqs");

describe("SqsSendMessage", () => {
  const mockSend = jest.fn();
  const mockSqsClient = {
    send: mockSend,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (SQSClient as jest.Mock).mockImplementation(() => mockSqsClient);
  });

  it("should send a message successfully", async () => {
    const sendMock = jest.fn().mockResolvedValue({ MessageId: "12345" });
    (SQSClient as jest.Mock).mockImplementation(() => {
      return {
        send: sendMock,
      };
    });

    const params = {
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/123456789012/test-queue",
      MessageBody: "Test message",
    };

    await SqsSendMessage(params);

    expect(SQSClient).toHaveBeenCalledTimes(1);
    expect(SendMessageCommand).toHaveBeenCalledWith(params);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(expect.any(SendMessageCommand));
  });

  it("should log an error if message sending fails", async () => {
    const params = {
      MessageBody: JSON.stringify({ test: "message" }),
      QueueUrl: "https://example-queue-url",
      MessageGroupId: "test-group",
    };

    const error = new Error("SQS error");
    mockSend.mockRejectedValueOnce(error);

    console.error = jest.fn();

    await SqsSendMessage(params);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    expect(console.error).toHaveBeenCalledWith(error);
  });
});
